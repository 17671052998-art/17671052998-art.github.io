import { execFile } from "node:child_process";
import { cp, mkdtemp, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { promisify } from "node:util";

const exec = promisify(execFile);
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pagesDir = path.join(projectRoot, ".pages");
const tempRoot = await mkdtemp(path.join(tmpdir(), "hawk-admin-pages-"));
const worktreeDir = path.join(tempRoot, "site");

async function git(args, options = {}) {
  return exec("git", args, { cwd: projectRoot, ...options });
}

const { stdout: remoteUrl } = await git(["remote", "get-url", "origin"]);
if (!remoteUrl.trim().includes("17671052998-art/17671052998-art.github.io")) {
  throw new Error(`origin 不是指定的 GitHub Pages 仓库：${remoteUrl.trim()}`);
}

await git(["fetch", "origin", "gh-pages"]);

try {
  await git(["worktree", "add", "--detach", worktreeDir, "origin/gh-pages"]);

  for (const entry of await readdir(worktreeDir)) {
    if (entry !== ".git") await rm(path.join(worktreeDir, entry), { recursive: true, force: true });
  }
  for (const entry of await readdir(pagesDir)) {
    if (entry === ".git") continue;
    await cp(path.join(pagesDir, entry), path.join(worktreeDir, entry), { recursive: true });
  }

  await exec("git", ["add", "-A"], { cwd: worktreeDir });
  const diff = await exec("git", ["diff", "--cached", "--quiet"], { cwd: worktreeDir }).then(
    () => false,
    (error) => {
      if (error.code === 1) return true;
      throw error;
    },
  );

  if (!diff) {
    console.log("GitHub Pages 已是最新版本，无需重复发布。");
  } else {
    await exec("git", ["commit", "-m", "Deploy Hawk Admin"], { cwd: worktreeDir });
    await exec("git", ["push", "origin", "HEAD:gh-pages"], { cwd: worktreeDir });
    console.log("GitHub Pages 已推送到 gh-pages 分支。");
  }
} finally {
  await git(["worktree", "remove", "--force", worktreeDir]).catch(() => undefined);
  await rm(tempRoot, { recursive: true, force: true });
}

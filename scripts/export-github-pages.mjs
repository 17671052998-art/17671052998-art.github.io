import { spawn } from "node:child_process";
import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDir = path.join(projectRoot, ".pages");
const port = 4173;
const origin = `http://127.0.0.1:${port}`;
const pnpmCommand = process.platform === "win32" ? "pnpm.cmd" : "pnpm";

await rm(outputDir, { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });
await cp(path.join(projectRoot, "dist", "client"), outputDir, { recursive: true });

const server = spawn(pnpmCommand, ["exec", "vinext", "start", "--port", String(port)], {
  cwd: projectRoot,
  env: { ...process.env, WRANGLER_LOG_PATH: ".wrangler/wrangler.log" },
  stdio: ["ignore", "pipe", "pipe"],
});

let serverLog = "";
server.stdout.on("data", (chunk) => { serverLog += chunk.toString(); });
server.stderr.on("data", (chunk) => { serverLog += chunk.toString(); });

async function waitForPage() {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    if (server.exitCode !== null) throw new Error(`预览服务提前退出：\n${serverLog}`);
    try {
      const response = await fetch(`${origin}/`);
      if (response.ok) return response.text();
    } catch {
      // The local production server may still be starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`等待静态页面生成超时：\n${serverLog}`);
}

try {
  const html = await waitForPage();
  await writeFile(path.join(outputDir, "index.html"), html);
  await writeFile(path.join(outputDir, "404.html"), html);
  await writeFile(path.join(outputDir, ".nojekyll"), "");
  console.log(`GitHub Pages 静态文件已生成：${outputDir}`);
} finally {
  server.kill("SIGTERM");
}

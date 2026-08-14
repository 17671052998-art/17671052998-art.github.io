# Repository instructions

## GitHub publishing

- The canonical repository is `https://github.com/17671052998-art/17671052998-art.github.io`.
- Treat an implementation or code-change request in this repository as authorization to validate the result, commit only the task-related files, push the current `main` branch to `origin`, and publish the updated site to GitHub Pages.
- Do not ask the user for the repository URL or publishing destination again unless `origin` is inaccessible or authentication has actually failed.
- After pushing `main`, run `pnpm run publish:pages` and verify that `https://17671052998-art.github.io/` serves the updated page.
- Preserve unrelated user changes. Never stage, commit, overwrite, or publish unrelated work.
- If validation, authentication, or deployment fails, report the concrete blocker instead of claiming the site was published.

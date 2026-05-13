import { cpSync, existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { execSync } from "node:child_process";

const repoRoot = process.cwd();
const distDir = resolve(repoRoot, "dist");

if (!existsSync(distDir)) {
  console.error("dist 目录不存在，请先执行 npm run build");
  process.exit(1);
}

const tempPrefix = join(tmpdir(), "my-ai-chat-gh-pages-");
const worktreeDir = mkdtempSync(tempPrefix);

const run = (command, cwd = repoRoot) => {
  execSync(command, {
    cwd,
    stdio: "inherit",
  });
};

try {
  run("git fetch origin gh-pages");
  run(`git worktree add --track -B gh-pages "${worktreeDir}" origin/gh-pages`);

  // 清空工作树中的旧发布产物，只保留 .git 元数据。
  run(
    'bash -lc \'shopt -s dotglob extglob && rm -rf -- !(.git)\'',
    worktreeDir
  );
  cpSync(distDir, worktreeDir, { recursive: true });

  run("git add -A", worktreeDir);

  let hasChanges = true;
  try {
    run("git diff --cached --quiet", worktreeDir);
    hasChanges = false;
  } catch {
    hasChanges = true;
  }

  if (!hasChanges) {
    console.log("gh-pages 无变化，跳过提交和推送。");
    process.exit(0);
  }

  run('git commit -m "chore(deploy): update GitHub Pages artifacts"', worktreeDir);
  run("git push origin gh-pages", worktreeDir);
} finally {
  try {
    run(`git worktree remove "${worktreeDir}" --force`);
  } catch {
    // Windows 上可能被占用，删除失败时尝试直接清理目录。
    rmSync(worktreeDir, { recursive: true, force: true });
  }
}

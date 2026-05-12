import { Command } from "commander";
import { createWorkflow } from "./index.js";

/**
 * 给有子命令的 Command 设置无匹配时打印 help 并以 0 退出，
 * 防止 bash 因非 0 退出码误判为错误。
 */
function showHelpOnNoSubcommand(cmd: InstanceType<typeof Command>) {
  cmd.exitOverride();
  cmd.action(() => {
    cmd.outputHelp();
    process.exit(0);
  });
}

export function workflowCli() {
  const wf = createWorkflow();

  const cmd = new Command("workflow")
    .description("GitHub 开发工作流管理");
  showHelpOnNoSubcommand(cmd);

  // issue 子命令
  const issueCmd = new Command("issue").description("issue 管理");
  showHelpOnNoSubcommand(issueCmd);

  issueCmd
    .command("new <description...>")
    .description("创建新 issue")
    .action(async (desc: string[]) => {
      await wf.issue.new_issue(desc.join(" "));
    });

  issueCmd
    .command("dev <issueNum> [branchName]")
    .description("开始开发：创建 worktree 并推送")
    .action(async (num: string, name?: string) => {
      await wf.issue.dev(parseInt(num), name);
    });

  issueCmd
    .command("list")
    .description("列出 open issue")
    .option("--label <label>", "按标签过滤")
    .action(async (opts: any) => {
      await wf.issue.list(opts.label);
    });

  cmd.addCommand(issueCmd);

  // dev 子命令
  const devCmd = new Command("dev").description("开发环境管理");
  showHelpOnNoSubcommand(devCmd);

  devCmd
    .command("list")
    .description("列出所有 worktree 状态")
    .option("--json", "输出 JSON 格式")
    .action(async (opts: any) => {
      const rows = await wf.dev.list();
      if (opts.json) {
        console.log(JSON.stringify(rows, null, 2));
      }
    });

  devCmd
    .command("status")
    .description("当前分支详情")
    .action(async () => {
      await wf.dev.status();
    });

  devCmd
    .command("pr")
    .description("推送并创建 PR")
    .action(async () => {
      await wf.dev.pr();
    });

  devCmd
    .command("merge-pr")
    .description("合并当前分支的 PR")
    .option("--method <method>", "合并策略: merge | squash | rebase")
    .action(async (opts: any) => {
      await wf.dev.mergePr(opts.method);
    });

  devCmd
    .command("remove")
    .description("删除 worktree 和分支")
    .action(async () => {
      await wf.dev.remove();
    });

  cmd.addCommand(devCmd);

  return cmd;
}

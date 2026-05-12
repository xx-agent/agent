import { Command } from "commander";
import { syncDependencies } from "../common/sync.js";
import { logger } from "../common/logger.js";
import { workflowCli } from "../common/workflow/workflow-cli.js";

const program = new Command();
program.name("xx-cli").description("xx 统一入口");

program
  .command("sync")
  .action(async () => {
    const log = logger.withTag("sync");
    syncDependencies().catch(err => {
      log.error("同步失败:", err);
      process.exit(1);
    });
  });

program.addCommand(workflowCli());

program.parseAsync(process.argv);

import yargs from "yargs";
import { hideBin } from "yargs/helpers";

/* istanbul ignore next */
async function main(): Promise<void> {
  await yargs(hideBin(process.argv))
    .commandDir("./commands", { recurse: false, extensions: ["ts", "js"] })
    .demandCommand(1)
    .showHelpOnFail(true)
    .exitProcess(true)
    .strict(true)
    .locale("en")
    .wrap(yargs.terminalWidth())
    .parse();
}

/* istanbul ignore next */
if (require.main === module) {
  void main();
}

import prompts from "prompts";
import { execa } from "execa";
import ora from "ora";
import chalk from "chalk";
import fs from "fs";
import path from "path";

export async function installLibraries(libs) {
  const packageJsonPath = path.resolve(process.cwd(), "package.json");
  if (!fs.existsSync(packageJsonPath)) {
    console.log(chalk.red("Error: package.json not found. Please run this CLI in the root of your project."));
    process.exit(1);
  }

  for (const lib of libs) {
    let spinner = ora(`Checking ${chalk.green(lib.label)}...`).start();
    let alreadyInstalled = false;

    try {
      const result = await execa("npm", ["list", lib.pkg, "--depth=0"]);
      const output = result.stdout;
      if (output.includes(lib.pkg)) {
        alreadyInstalled = true;
        spinner.succeed(`${chalk.green(lib.label)} is already installed`);
      } else {
        spinner.stop();
      }
    } catch (err) {
      spinner.stop();
    }

    let installAction = "install";
    if (alreadyInstalled) {
      const { update } = await prompts({
        type: "confirm",
        name: "update",
        message: `Do you want to update ${chalk.green(lib.label)}?`,
        initial: true,
      });

      if (!update) continue; 
      installAction = "update";
    }

    spinner = ora(`${installAction === "install" ? "Installing" : "Updating"} ${chalk.green(lib.label)}...`).start();

    try {
      await execa("npm", [installAction, ...lib.pkg.split(" ")], { stdio: "inherit" });
      spinner.succeed(`${chalk.green(lib.label)} ${installAction === "install" ? "installed" : "updated"}`);
    } catch (err) {
      spinner.fail(`${chalk.red(lib.label)} ${installAction === "install" ? "installation failed" : "update failed"}`);
    }
  }
}

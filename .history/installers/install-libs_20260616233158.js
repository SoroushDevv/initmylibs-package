import prompts from "prompts";
import { execa } from "execa";
import ora from "ora";
import chalk from "chalk";
import fs from "fs";
import path from "path";


export async function installLibraries(libs) {
  const packageJsonPath = path.resolve(process.cwd(), "package.json");
  async function detectPackageManager() {
  const cwd = process.cwd();

  if (fs.existsSync(path.join(cwd, "pnpm-lock.yaml"))) {
    return "pnpm";
  }

  if (fs.existsSync(path.join(cwd, "yarn.lock"))) {
    return "yarn";
  }

  return "npm";
}
  if (!fs.existsSync(packageJsonPath)) {
    console.log(chalk.red("\nError: package.json not found. Please run this CLI in the root of your project."));
    return;
  }

  const pkgManager = await detectPackageManager();
  console.log(chalk.dim(`\nUsing ${chalk.bold(pkgManager)} for installation...`));

  for (const lib of libs) {
    let alreadyInstalled = false;
    let spinner = ora(`Checking ${chalk.cyan(lib.label)}...`).start();

    try {
      const firstPkg = lib.pkg.split(" ")[0];
      const { stdout } = await execa(pkgManager, [pkgManager === "yarn" ? "list" : "list", firstPkg, "--depth=0"]);
      
      if (stdout.includes(firstPkg)) {
        alreadyInstalled = true;
        spinner.succeed(`${chalk.green(lib.label)} is already installed.`);
      } else {
        spinner.stop();
      }
    } catch {
      spinner.stop();
    }

    if (alreadyInstalled) {
      const { update } = await prompts({
        type: "confirm",
        name: "update",
        message: `Do you want to update ${chalk.yellow(lib.label)}?`,
        initial: false,
      });

      if (!update) continue;
    }

    const actionText = alreadyInstalled ? "Updating" : "Installing";
    const installSpinner = ora(`${actionText} ${chalk.cyan(lib.label)}...`).start();

    try {
      const pkgs = lib.pkg.split(" ");
      let args = [];

      if (pkgManager === "npm") {
        args = ["install", ...pkgs, "--legacy-peer-deps"];
      } else if (pkgManager === "yarn") {
        args = ["add", ...pkgs];
      } else if (pkgManager === "pnpm") {
        args = ["add", ...pkgs];
      }

      await execa(pkgManager, args);
      installSpinner.succeed(`${chalk.green(lib.label)} ${actionText.toLowerCase()}ed successfully.`);
    } catch (err) {
      installSpinner.fail(`${chalk.red(lib.label)} ${actionText.toLowerCase()} failed.`);
      console.log(chalk.dim(`   Note: This might be due to peer dependency conflicts or network.`));
    }
  }
}
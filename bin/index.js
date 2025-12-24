#!/usr/bin/env node
import prompts from "prompts";
import { installLibraries } from "../installers/install-libs.js";
import chalk from "chalk";
import { execa } from "execa";

console.clear();

const LIBRARIES = [
  { label: "SweetAlert2", pkg: "sweetalert2", description: "Beautiful alerts and popups" },
  { label: "React Toastify", pkg: "react-toastify", description: "Toast notifications for React" },
  { label: "Framer Motion", pkg: "framer-motion", description: "Animations for React" },
  { label: "AOS (Animate On Scroll)", pkg: "aos", description: "Animate elements on scroll" },
  { label: "Yup (Validation)", pkg: "yup", description: "Schema validation library" },
  { label: "TanStack Table", pkg: "@tanstack/react-table", description: "Powerful table library for React" },
  { label: "Axios", pkg: "axios", description: "HTTP client for API requests" },
  { label: "Day.js", pkg: "dayjs", description: "Date library for parsing and formatting" },
  { label: "Lucide React", pkg: "lucide-react", description: "Beautiful SVG icons for React" },
  { label: "Tippy.js", pkg: "@tippyjs/react", description: "Tooltip, popover, dropdown library" },
  { label: "FilePond (File Upload)", pkg: "filepond react-filepond", description: "File upload component" },
  { label: "React ApexCharts", pkg: "react-apexcharts apexcharts", description: "Charts for React" },
  { label: "Tabler Icons React", pkg: "tabler-icons-react", description: "Open source icons for React" },
  { label: "React Beautiful DnD", pkg: "react-beautiful-dnd", description: "Drag & drop library" },
  { label: "CountUp.js", pkg: "react-countup", description: "Animated counters" },
];

(async () => {
  const toInstall = [];

  console.log(chalk.bold("Select libraries to install or update:\n"));

  for (let i = 0; i < LIBRARIES.length; i++) {
    const lib = LIBRARIES[i];

    let installed = false;
    let outdated = false;

    try {
      const result = await execa("npm", ["list", lib.pkg, "--depth=0"]);
      const output = result.stdout;
      if (output.includes(lib.pkg)) {
        installed = true;
        const outdatedResult = await execa("npm", ["outdated", lib.pkg]);
        if (outdatedResult.stdout) {
          outdated = true;
        }
      }
    } catch {
      installed = false;
    }

    // نمایش شماره پکیج
    const pkgNumber = `${i + 1}/${LIBRARIES.length}`;

    if (!installed) {
      const { confirm } = await prompts({
        type: "confirm",
        name: "confirm",
        message: `${chalk.cyan(pkgNumber)} - Install ${chalk.green(lib.label)}? - ${lib.description}`,
        initial: true,
      });
      if (confirm) toInstall.push(lib);
    } else if (outdated) {
      const { update } = await prompts({
        type: "confirm",
        name: "update",
        message: `${chalk.cyan(pkgNumber)} - ${chalk.strikethrough(lib.label)} is outdated. Do you want to update it?`,
        initial: true,
      });
      if (update) toInstall.push(lib);
    } else {
      console.log(`${chalk.cyan(pkgNumber)} - ${chalk.green(lib.label)} is already up-to-date.`);
    }
  }

  if (toInstall.length === 0) {
    console.log(chalk.yellow("\nNo libraries selected for installation or update. Exiting."));
      console.log("\nIf you have any feedback, suggestions, or issues, please share them with me:");
  console.log(chalk.blue("GitHub: https://github.com/SoroushDevv"));
  console.log(chalk.cyan("LinkedIn: https://www.linkedin.com/in/soroushmoradidev/"));
  console.log("\nThank you for using this CLI!");
    return;
  }

  console.log("\nProcessing selected libraries...\n");
  await installLibraries(toInstall);

  console.log(chalk.green("\nAll selected libraries processed successfully!"));
  console.log("\nIf you have any feedback, suggestions, or issues, please share them with me:");
  console.log(chalk.blue("GitHub: https://github.com/SoroushDevv"));
  console.log(chalk.cyan("LinkedIn: https://www.linkedin.com/in/soroushmoradidev/"));
  console.log("\nThank you for using this CLI!");

})();

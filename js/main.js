import commands from "./commands.js";
import executors from "./executors.js";
import { error, render, isURLValid } from "./helpers.js";
import shortcuts from "./shortcuts.js";

const input = document.getElementById("input");
const output = document.getElementById("output");

input.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    const fullInput = input.value.trim();
    const userInput = fullInput.split(" ");
    const command = userInput[0].toLowerCase();
    const options = userInput.slice(1);
    render(`<span class="red">$&nbsp;</span>${input.value}`);
    try {
      const commandDetails = commands.find((c) =>
        c.name.map((n) => n.toLowerCase()).includes(command),
      );
      if (commandDetails) {
        commandDetails.execute(options);
      } else {
        const shortcutDetails = shortcuts
          .flatMap((c) => Object.entries(c.items))
          .find(([i]) => i.toLowerCase().startsWith(command));
        if (shortcutDetails) {
          render(`Redirecting to ${shortcutDetails[0]}...`);
          window.location.href = shortcutDetails[1];
        } else {
          if (isValidURL(fullInput)) {
            let url = fullInput;
            if (!/^https?:\/\//i.test(url)) {
              url = "http://" + url;
            }
            render(`Opening URL: ${url}`);
            window.location.href = url;
          } else {
            render(`Searching for: ${fullInput}`);
            executors.search([fullInput]);
          }
        }
      }
    } catch (e) {
      error("red", "JS Error", e.message);
    }
    input.value = "";
  }
});

window.addEventListener("load", () => {
  try {
    executors.ls();
    executors.motd();
    let filenames = ["purple-mountains.jpg"];
    let root = document.getElementsByTagName("html")[0];
    root.style.backgroundImage = `url("./backgrounds/${
      filenames[Math.floor(Math.random() * filenames.length)]
    }")`;
    root.style.backgroundSize = "cover";
    root.style.backgroundPosition = "center";
  } catch (e) {
    error("red", "JS Error", e.message);
  }
});

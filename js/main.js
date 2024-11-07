// main.js
import commands from "./commands.js";
import executors from "./executors.js";
import { error, render, isValidURL } from "./helpers.js";
import shortcuts from "./shortcuts.js";

const input = document.getElementById("input");
const output = document.getElementById("output");

// Command history array and index
let commandHistory = [];
let historyIndex = -1; // Start at -1 to indicate no history navigation yet

input.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    const fullInput = input.value.trim();

    // Add the command to the history
    if (fullInput) {
      commandHistory.push(fullInput);
      historyIndex = commandHistory.length; // Reset history index
    }

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
        // Check if input matches any shortcut
        const shortcutDetails = shortcuts
          .flatMap((c) => Object.entries(c.items))
          .find(([name]) => name.toLowerCase().startsWith(command));
        if (shortcutDetails) {
          render(`Redirecting to ${shortcutDetails[0]}...`);
          window.location.href = shortcutDetails[1];
        } else {
          // If input is a valid URL, open it
          let url = fullInput;
          if (!/^https?:\/\//i.test(url)) {
            url = 'http://' + url;
          }
          if (isValidURL(url)) {
            render(`Opening URL: ${url}`);
            window.location.href = url;
          } else {
            // Otherwise, perform a search
            render(`Searching for: ${fullInput}`);
            executors.search([fullInput]);
          }
        }
      }
    } catch (e) {
      console.error(e);
      error("red", "JS Error", e.message);
    }
    input.value = "";
  } else if (e.key === "ArrowUp") {
    // Navigate to previous command
    if (commandHistory.length > 0 && historyIndex > 0) {
      historyIndex--;
      input.value = commandHistory[historyIndex];
    } else if (historyIndex === 0) {
      // Already at the oldest command
      input.value = commandHistory[historyIndex];
    }
    e.preventDefault(); // Prevent default action of moving cursor to beginning
  } else if (e.key === "ArrowDown") {
    // Navigate to next command
    if (commandHistory.length > 0 && historyIndex < commandHistory.length - 1) {
      historyIndex++;
      input.value = commandHistory[historyIndex];
    } else if (historyIndex >= commandHistory.length - 1) {
      // At the latest command, clear input
      historyIndex = commandHistory.length;
      input.value = "";
    }
    e.preventDefault(); // Prevent default action of moving cursor to end
  }
});

window.addEventListener("load", () => {
  try {
    console.log("Page loaded, executing ls and motd");
    executors.ls();
    // executors.motd();
    let filenames = ["purple-mountains.jpg"];
    let root = document.getElementsByTagName("html")[0];
    root.style.backgroundImage = `url("./backgrounds/${
      filenames[Math.floor(Math.random() * filenames.length)]
    }")`;
    root.style.backgroundSize = "cover";
    root.style.backgroundPosition = "center";
  } catch (e) {
    console.error(e);
    error("red", "JS Error", e.message);
  }
});

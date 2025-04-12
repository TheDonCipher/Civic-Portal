/// <reference types="cypress" />

// Import commands.js using ES2015 syntax:
import "./commands";

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Hide fetch/XHR requests in the command log
const app = window.top;
if (
  app &&
  !app.document.head.querySelector("[data-hide-command-log-request]")
) {
  const style = app.document.createElement("style");
  style.innerHTML =
    ".command-name-request, .command-name-xhr { display: none }\n" +
    ".command-name-get, .command-name-visit { display: none }\n";
  style.setAttribute("data-hide-command-log-request", "");
  app.document.head.appendChild(style);
}

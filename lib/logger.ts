import { fs } from "https://deno.land/std@0.170.0/node/internal_binding/constants.ts";
import { EOL } from "https://deno.land/std@0.206.0/fs/eol.ts";

let diag = false;
let prefix = "";

if (Deno.args.includes("-diag")) {
  diag = true;
  prefix = "[DIAG] ";
}
class Logger {
  logSuccess(message: string) {
    console.log(`%c${message}${EOL.LF}`, "color: green");
  }

  logInfo(message: string) {
    if (!diag) return;
    console.log(`%c${prefix}${message}${EOL.LF}`, "color: blue");
  }

  logWarning(message: string) {
    console.log(`%c${message}${EOL.LF}`, "color: yellow");
  }

  logError(message: string) {
    console.log(`%c${message}${EOL.LF}`, "color: red");
  }
}

export const logger = new Logger();

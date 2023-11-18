import { EOL } from "https://deno.land/std@0.206.0/fs/eol.ts";

const platformEOL = Deno.build.os === "windows" ? EOL.CRLF : EOL.LF;

let diag = false;
let prefix = "";

if (Deno.args.includes("-diag")) {
  diag = true;
  prefix = "[DIAG] ";
}
class Logger {
  logSuccess(message: string) {
    console.log(`%c${message}${platformEOL}`, "color: green");
  }

  logInfo(message: string) {
    if (!diag) return;
    console.log(`%c${prefix}${message}${platformEOL}`, "color: blue");
  }

  logWarning(message: string) {
    console.log(`%c${message}${platformEOL}`, "color: yellow");
  }

  logError(message: string) {
    console.log(`%c${message}${platformEOL}`, "color: red");
  }
}

export const logger = new Logger();

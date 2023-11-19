import { EOL } from "https://deno.land/std@0.206.0/fs/eol.ts";

export const platformEOL = Deno.build.os === "windows" ? EOL.CRLF : EOL.LF;

function escapeRegExp (string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // $& means the whole matched string
}


export const util = {
  escapeRegExp
}

#!/usr/bin/env node

import * as path from "https://deno.land/std@0.206.0/path/mod.ts";
import { fileURLToPath } from "https://deno.land/std@0.170.0/node/url.ts";
import getFiles from "https://deno.land/x/getfiles@v1.0.0/mod.ts";
import * as fs from "https://deno.land/std@0.206.0/fs/mod.ts";
import { logger } from "../lib/logger.ts";
import { platformEOL, util } from "../lib/utility.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
let workingDir = __dirname;
const commandsText = await Deno.readTextFile(
  path.join(__dirname, "commander.commands"),
);
const commands = commandsText.split(/\r?\n/);

function executeCommandsSequentially(commands: string[]): void {
  if (commands.length === 0) {
    logger.logSuccess("All commands executed");
    return;
  }

  const command = commands.shift();

  const result = excecuteCommand(command);
  if (!result) return;

  executeCommandsSequentially(commands);
}

executeCommandsSequentially(commands);

function excecuteCommand(command: string | undefined) {
  if (!command) {
    throw new Error("Command is empty");
  }

  const commandName = command.split(/ /)[0];
  switch (commandName) {
    case "dir": {
      workingDir = command.substring(3).trim();

      if (!fs.existsSync(workingDir)) {
        logger.logError(`working-dir: ${workingDir} not found`);
        return false;
      }

      return true;
    }
    case "add-file":
      {
        const fileName = command.substring(8, command.indexOf("-withcontent"))
          .trim();
        const content = command.substring(command.indexOf("-withcontent") + 12);

        logger.logInfo(`working-dir: ${workingDir}`);
        logger.logInfo(`command: ${command}`);

        Deno.writeTextFile(fileName, content);
      }
      return true;
    case "search":
      {
        const searchTerm = command.substring(
          7,
          command.indexOf("-replace") - 1,
        );
        const replaceWith = command.substring(command.indexOf("-replace") + 9);

        logger.logInfo(`working-dir: ${workingDir}`);
        logger.logInfo(`command: ${command}`);

        const allFiles = getFiles({
          root: workingDir,
          exclude: [".git"],
        });
        for (const file of allFiles) {
          try {
            const content = Deno.readTextFileSync(file.path);
            const re = new RegExp(util.escapeRegExp(searchTerm), "g");
            const result = content.replace(re, replaceWith);
            if (content !== result) Deno.writeTextFileSync(file.path, result);
          } catch (e) {
            logger.logError(`Error in replacing file ${file}`);
          }
        }
      }
      return true;
    case "add-line":
      {
        const lineToAdd = command.substring(8, command.indexOf("-after") - 1);
        const lineToSearch = command.substring(command.indexOf("-after") + 7);

        logger.logInfo(`working-dir: ${workingDir}`);
        logger.logInfo(`command: ${command}`);
        logger.logInfo(
          `line-to-search '${lineToSearch}' line-to-add '${lineToAdd}'`,
        );

        const allFiles = getFiles({
          root: workingDir,
          exclude: [".git"],
        });
        for (const file of allFiles) {
          try {
            const content = Deno.readTextFileSync(file.path);
            const splits = content.split(lineToSearch);

            if (splits.length < 2) {
              logger.logInfo("Term to add line after not found");
              continue;
            }
            if (splits.length > 2) {
              logger.logInfo(
                "Multiple occurance of the term to add line after, not supported",
              );
              continue;
            }
            const secondPart = lineToAdd + platformEOL + splits[1];
            const result = splits[0] + lineToSearch + platformEOL + secondPart;
            Deno.writeTextFileSync(file.path, result);
          } catch (e) {
            logger.logError(`Error in add line content: ${file}, ${e}`);
          }
        }
      }
      return true;
    default: {
      logger.logError(`Invalid command ${commandName}`);
      return false;
    }
  }
}

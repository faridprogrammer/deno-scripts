#!/usr/bin/env node
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { globSync } from 'glob'
import { EOL } from 'os'
import { logger } from '../lib/logger.mjs'
import { util } from '../lib/utility.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
let workingDir = __dirname
const commandsText = fs.readFileSync(path.join(__dirname, 'commander.commands'), 'utf8')
const commands = commandsText.split(/\r?\n/)

function executeCommandsSequentially (commands) {
  if (commands.length === 0) {
    logger.logSuccess('All commands executed')
    return
  }

  const command = commands.shift()

  const result = excecuteCommand(command)
  if (!result) { return }

  executeCommandsSequentially(commands)
}

executeCommandsSequentially(commands)

function excecuteCommand (command) {
  const commandName = command.split(/ /)[0]
  switch (commandName) {
    case 'dir':
    {
      workingDir = command.substring(3).trim()

      if (!fs.existsSync(workingDir)) {
        logger.logError(`working-dir: ${workingDir} not found`)
        return false
      }

      return true
    }
    case 'add-file':
      {
        const fileName = command.substring(8, command.indexOf('-withcontent')).trim()
        const content = command.substring(command.indexOf('-withcontent') + 12)

        logger.logInfo(`working-dir: ${workingDir}`)
        logger.logInfo(`command: ${command}`)

        fs.writeFileSync(fileName, content)
      }
      return true
    case 'search':
      {
        const searchTerm = command.substring(7, command.indexOf('-replace') - 1)
        const replaceWith = command.substring(command.indexOf('-replace') + 9)

        logger.logInfo(`working-dir: ${workingDir}`)
        logger.logInfo(`command: ${command}`)

        const allFiles = globSync(path.posix.join(workingDir, '**/*.*'), { recursive: true, nodir: true })
        for (const file of allFiles) {
          try {
            const content = fs.readFileSync(file, 'utf8')
            const re = new RegExp(util.escapeRegExp(searchTerm), 'g')
            const result = content.replace(re, replaceWith)
            if (content !== result) { fs.writeFileSync(file, result, 'utf8') }
          } catch (e) {
            logger.logError(`Error in replacing file ${file}`)
          }
        }
      } return true
    case 'add-line':
      {
        const lineToAdd = command.substring(8, command.indexOf('-after') - 1)
        const lineToSearch = command.substring(command.indexOf('-after') + 7)

        logger.logInfo(`working-dir: ${workingDir}`)
        logger.logInfo(`command: ${command}`)
        logger.logInfo(`line-to-search '${lineToSearch}' line-to-add '${lineToAdd}'`)

        const allFiles = globSync(path.posix.join(workingDir, '**/*.*'), { recursive: true, nodir: true })
        for (const file of allFiles) {
          try {
            const content = fs.readFileSync(file, 'utf8')
            const splits = content.split(lineToSearch)

            if (splits.length < 2) {
              logger.logInfo('Term to add line after not found')
              continue
            }
            if (splits.length > 2) {
              logger.logInfo('Multiple occurance of the term to add line after, not supported')
              continue
            }
            const secondPart = lineToAdd + EOL + splits[1]
            const result = splits[0] + lineToSearch + EOL + secondPart
            fs.writeFileSync(file, result, 'utf8')
          } catch (e) {
            logger.logError(`Error in add line content: ${file}, ${e}`)
          }
        }
      }
      return true
    default:
    {
      logger.logError(`Invalid command ${commandName}`)
      return false
    }
  }
}

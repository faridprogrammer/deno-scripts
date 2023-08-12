import terminalkit from 'terminal-kit'
import os from 'os'

const term = terminalkit.terminal

let diag = false
let prefix = ''

if (process.argv[2] && process.argv[2] === '-diag') {
  diag = true
  prefix = '[DIAG] '
}
class Logger {
  logSuccess (message) {
    term.green(message + os.EOL)
  }

  logInfo (message) {
    if (!diag) { return }
    term.blue(prefix + message + os.EOL)
  }

  logWarning (message) {
    term.yellow(message + os.EOL)
  }

  logError (message) {
    term.red(message + os.EOL)
  }
}

export const logger = new Logger()

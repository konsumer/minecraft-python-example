/* global WebSocket */
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import colors from 'colors'

import 'xterm/css/xterm.css'
import './index.css'

const motd = colors.yellow(`Welcome to The Minecraft Python REPL.\r

Connected to ws://localhost:44445/\r
Type dir() or print(thing) to explore.\r

`)

let currentInput = []
const history = []

const term = new Terminal()
const fitAddon = new FitAddon()
term.loadAddon(fitAddon)
term.open(document.getElementById('terminal'))
fitAddon.fit()

const socket = new WebSocket('ws://localhost:44445/')
socket.onopen = e => term.write(motd)
socket.onerror = error => term.write(colors.red(`\r\nError: ${error.message}\r`))
socket.onmessage = e => term.write(`\r\n${e.data}`)
socket.onclose = e => {
  if (e.wasCLean) {
    term.write(`\r\n[close] Connection closed cleanly, code=${e.code} reason=${e.reason}`)
  } else {
    term.write(colors.red('\r\n[close] Connection died. Is minecraft + minecraft-python running locally?'))
  }
}

term.onKey(({ key, domEvent }) => {
  console.log(key.charCodeAt(0))
  if (key.charCodeAt(0) === 13) {
    term.write('\n')
    const line = currentInput.join('')
    socket.send(line)
    history.push(line)
    currentInput = []
  } else if (key.charCodeAt(0) === 127) {
    console.log('BACKSPACE')
  } else if (key.charCodeAt(0) < 32) {
    // TODO: fancy arrow-handling for history
  } else {
    term.write(key)
    currentInput.push(key)
  }
})

#!/usr/bin/env node
'use strict'

const {Connection, ExampleGlobal} = require('./westfield-client-example.js')
const WebSocket = require('ws')
const express = require('express')
const http = require('http')

// setup connection logic (http+websocket)
const app = express()
app.use(express.static('public'))

const server = http.createServer()
server.on('request', app)
const wss = new WebSocket.Server({
  server: server,
  path: '/westfield'
})

// listen for new websocket connections.
wss.on('connection', ws => {
  // create connection
  const connection = new Connection()

  // wire connection send to websocket
  connection.onFlush = (data) => {
    ws.send(data)
  }

  // wire websocket message to connection unmarshall
  ws.onmessage = (event) => {
    const b = event.data
    const arrayBuffer = b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength)
    connection.unmarshall(arrayBuffer)
    // flush any messages that might have been queued by our call to connection.unmarshall(..)
    connection.flush()
  }

  // create registry and be notified if a new global appears
  const registry = connection.createRegistry()
  registry.listener.global = (name, interface_, version) => {
    // check if we support the global
    if (interface_ === ExampleGlobal.name) {
      // create a new object that will be bound to the global
      const exampleGlobal = registry.bind(name, interface_, version)

      // create a new clock object
      const exampleClock = exampleGlobal.createExampleClock()

      // listen for time updates
      exampleClock.listener.timeUpdate = (time) => {
        // print the time
        console.log(time)
      }
    }
  }
  connection.flush()
})

// Listen for incoming http requests on port 8080.
server.listen(8080)

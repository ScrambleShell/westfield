'use strict'

const {Global, ExampleGlobal, ExampleClock, Server} = require('./westfield-server-example.js')

class ExampleGlobalImpl extends Global {
  constructor () {
    super(ExampleGlobal.name, 1)
  }

  bindClient (client, id, version) {
    // Create a new example-global resource when a client binds to the global.
    const resource = new ExampleGlobal(client, id, version)
    // Assign implemented factory method.
    resource.implementation = this
  }

  createExampleClock (resource, id) {
    // Create a new example clock resource.
    const clockResource = new ExampleClock(resource.client, id, 1)
    // Send time update events to the client.
    setInterval(function () {
      clockResource.timeUpdate(new Date().getTime())
      resource.client.flush()
    }, 1)
  }
}

// Create a new global singleton clock-factory implementation.
const exampleGlobal = new ExampleGlobalImpl()

// Create westfield server. Required to expose global singleton protocol objects to clients.
const westfieldServer = new Server()
// Register the global so clients can find it when they connect.
westfieldServer.registry.register(exampleGlobal)

// setup connection logic (http+websocket)
const ws = new window.WebSocket('ws://' + window.location.host + '/westfield')
// set socket type to array buffer, required for wfc connection to work.
ws.binaryType = 'arraybuffer'

ws.onopen = (event) => {
  // A new connection was established. Create a new westfield client object to represent this connection.
  const client = westfieldServer.createClient()

  // Wire the send callback of this client object to our websocket.
  client.onFlush = function (wireMsg) {
    if (ws.readyState === window.WebSocket.CLOSING || ws.readyState === window.WebSocket.CLOSED) {
      // Fail silently as we will soon receive the close event which will trigger the cleanup.
      return
    }

    try {
      ws.send(wireMsg, function (error) {
        if (error !== undefined) {
          console.error(error)
          ws.close()
        }
      })
    } catch (error) {
      console.error(error)
      ws.close()
    }
  }

  // Wire data receiving from the websocket to the client object.
  ws.onmessage = function incoming (message) {
    try {
      // The client object expects an ArrayBuffer as it's argument.
      // Slice and get the ArrayBuffer of the Node Buffer with the provided offset, else we take too much data into account.
      client.message(message.data)
      // flush any messages that might have been queued by our call to client.message(..)
      client.flush()
    } catch (error) {
      console.error(error)
      ws.close()
    }
  }

  // Wire closing of the websocket to our client object.
  ws.onclose = function () {
    client.close()
  }
}

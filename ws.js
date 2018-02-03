/**
 * Created by lonelydawn on 2017-11-20.
 */

const WebSocket = require('ws')
const wss = new WebSocket.Server({ port: 3001 })

wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(data) {
        // Broadcast to everyone else.
        wss.clients.forEach(function(client,index,arr) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(data)
            }
        })
    })
})

console.log("listening at 3001")
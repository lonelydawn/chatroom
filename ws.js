/**
 * Created by lonelydawn on 2017-11-20.
 */

const Mediator = function () {
  let contactList = [
    {
      id: 0,
      name: 'All'
    }
  ]
  let talkHistory = [
    {
      id: 0,
      from: {
        id: 1,
        name: 'John'
      },
      to: {
        id: 2,
        name: 'Jackson'
      },
      msg: 'hello world'
    }
  ]
  let contactCounter = 0
  let talkCounter = 0
  return {
    contactList () {
      return contactList
    },
    talkHistory () {
      return talkHistory
    },
    parseOpen (name, onOpen) {
      let contact = {
        id: ++contactCounter,
        name
      }
      contactList.push(contact)
      typeof onOpen === 'function' && onOpen(contact)
    },
    parseMessage (record, onMessage) {
      let item = {
        id: talkCounter++,
        ...record
      }
      talkHistory.push(item)
      typeof onMessage === 'function' && onMessage()
    },
    parseClose (id, onClose) {
      contactList.splice(contactList.indexOf(contactList.find(item => item.id === id)), 1)
      typeof onClose === 'function' && onClose()
    }
  }
}
const WebSocket = require('ws')
const wss = new WebSocket.Server({ port: 3001 })
const mediator = new Mediator()

wss.on('connection', function (ws) {
  // cite ws
  const parseOpen = function ({name}) {
    mediator.parseOpen(name, function (params) {
      wss.clients.forEach(client => {
        client.readyState === WebSocket.OPEN && client.send(JSON.stringify({
          type: 'contact',
          payload: params
        }))
      })
      // cite params
      ws.send(JSON.stringify({
        type: 'load',
        payload: {
          from: params,
          contactList: mediator.contactList(),
          talkHistory: mediator.talkHistory().filter(item => item.to.id === 0)
        }
      }))
      // assign id to websocket client
      ws.id = params.id
    })
  }
  const parseMessage = function (payload) {
    let {from, to} = payload
    mediator.parseMessage(payload, function (params) {
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN &&
          (to.id === 0 || client.id === to.id || client.id === from.id)) {
          client.send(JSON.stringify({
            type: 'message',
            payload
          }))
        }
      })
    })
  }
  const parseClose = function ({id}) {
    // sync state and broadcast to others
    mediator.parseClose(id, function (params) {
      wss.clients.forEach(client => {
        client.readyState === WebSocket.OPEN && client.send(JSON.stringify({
          type: 'lose',
          payload: {
            id
          }
        }))
      })
    })
  }
  ws.on('message', function (data) {
    let {type, payload} = JSON.parse(data)
    switch(type) {
      case 'open':
        parseOpen(payload)
        break
      case 'close':
        parseClose(payload)
        break
      case 'message':
        parseMessage(payload)
        break
    }
  })
  ws.on('close', function () {
    parseClose({id: ws.id})
  })
})

console.log('listening at 3001')
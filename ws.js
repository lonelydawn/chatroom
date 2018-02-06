/**
 * Created by lonelydawn on 2017-11-20.
 */

const Mediator = function () {
  // store
  let contactList = [
    {
      id: 0,
      name: 'All'
    }
  ]
  let talkHistory = []
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
    parseNickname ({id, name}, onNickname) {
      contactList.find(item => item.id === id).name = name
      talkHistory.forEach(record => {
        if (record.to.id === id) {
          record.to.name = name
        }
        if (record.from.id === id) {
          record.from.name = name
        }
      })
      typeof onNickname === 'function' && onNickname()
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
      // Notify other clients to create contact item.
      wss.clients.forEach(client => {
        client.readyState === WebSocket.OPEN && client.send(JSON.stringify({
          type: 'contact',
          payload: params
        }))
      })
      // Notify the new client to create contact list and talk history.
      ws.send(JSON.stringify({
        type: 'load',
        payload: {
          from: params,
          contactList: mediator.contactList(),
          talkHistory: mediator.talkHistory().filter(item => item.to.id === 0)
        }
      }))
      // Assign id to websocket client.
      ws.id = params.id
    })
  }
  const parseMessage = function (payload) {
    let {from, to} = payload
    mediator.parseMessage(payload, function (params) {
      // Notify the appropriate client to create talk record.
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
  const parseNickname = function (payload) {
    mediator.parseNickname(payload, function (params) {
      // Notify all clients to update contact list and talk history.
      wss.clients.forEach(client => {
        client.readyState === WebSocket.OPEN && client.send(JSON.stringify({
          type: 'reload',
          payload: {
            contactList: mediator.contactList(),
            talkHistory: mediator.talkHistory().filter(record => {
              return record.from.id === client.id ||
                record.to.id === client.id || record.to.id === 0
            })
          }
        }))
      })
    })
  }
  const parseClose = function ({id}) {
    // Notify other clients to delete contact item.
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
  // Dispatch actions.
  ws.on('message', function (data) {
    let {type, payload} = JSON.parse(data)
    switch(type) {
      case 'open':
        parseOpen(payload)
        break
      case 'message':
        parseMessage(payload)
        break
      case 'nickname':
        parseNickname(payload)
        break
      case 'close':
        parseClose(payload)
        break
    }
  })
  ws.on('close', function () {
    parseClose({id: ws.id})
  })
})

console.log('listening at 3001')
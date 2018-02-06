/**
 * Created by lonelydawn on 2017-11-20.
 */

import $ from 'jquery'

// get DOM element
let nickname = $('#nickname')
let content = $('#content')
let msg = $('#msg')
let send = $('#send')
let contact = $('#contact')

const Mediator = function () {
  // Parse data, then render UI.
  let contactList = []
  let talkHistory = []
  let src = {}
  let dest = {}
  const parseTalkRecord = function ({from, to, msg, timestamp}) {
    $('<div class="record-item">' +
      '<p class="record-label">' +
      '<span class="color-deep-blue">' + (from.id === src.id ? 'You' : from.name) + '</span>' +
      '&nbsp;send&nbsp;to&nbsp;' +
      '<span class="color-deep-blue">' + (to.id === src.id ? 'You' : to.name) + '</span>' +
      '&nbsp;&nbsp;&nbsp;&nbsp;' +
      '<span class="color-blue">' + timestamp + '</span>' +
      '</p>' +
      '<p class="record-text">' + msg + '</p>' +
      '</div>').appendTo(content)
  }
  const parseContactItem = function (item) {
    $('<li class="contact-list-item' + (item.id === dest.id ? ' is-active' : '') + '">' +
      '<span class="contact-name">' + item.name + '</span>' +
      '</li>')
      .click(function () {
        dest = item
        $(this).addClass('is-active').siblings().removeClass('is-active')
      })
      .appendTo(contact)
  }
  const parseAddContact = function (item) {
    contactList.push(item)
    parseContactItem(item)
  }
  const parseContactList = function () {
    contact.empty()
    for (let contactItem of contactList) {
      if (contactItem.id !== src.id) {
        parseContactItem(contactItem)
      }
    }
  }
  const parseLoseContact = function ({id}) {
    contact.empty()
    contactList.splice(contactList.indexOf(contactList.find(item => item.id === id)), 1)
    parseContactList()
  }
  const parseTalkHistory = function () {
    content.empty()
    for (let talkRecord of talkHistory) {
      parseTalkRecord(talkRecord)
    }
  }
  const parseLoad = function (payload) {
    src = payload.from

    contactList = payload.contactList
    dest = contactList[0]
    parseContactList()

    talkHistory = payload.talkHistory
    parseTalkHistory()
  }
  const parseReload = function (payload) {
    contactList = payload.contactList
    dest = contactList.find(item => item.id === dest.id) || contactList[0]
    parseContactList()

    talkHistory = payload.talkHistory
    parseTalkHistory()
  }
  return {
    from () {
      return src
    },
    to () {
      return dest
    },
    parse (type, payload) {
      // dispatch actions
      switch (type) {
        case 'load':
          parseLoad(payload)
          break
        case 'message':
          parseTalkRecord(payload)
          break
        case 'contact':
          parseAddContact(payload)
          break
        case 'lose':
          parseLoseContact(payload)
          break
        case 'reload':
          parseReload(payload)
      }
    }
  }
}

// generate name
let firstLetter = 'ABCDFGHJKLMNPRST'
let otherLetter = 'abcdefghijklmnopqrstuvwxyz'
let length = 3 + Math.floor(Math.random() * 6)
let name = ''
name += firstLetter[Math.floor(Math.random() * firstLetter.length)] || ''
for (let i = 0; i < length; i++) {
  name += otherLetter[Math.floor(Math.random() * otherLetter.length)] || 'n'
}
nickname.val(name)

// declare mediator
let mediator = new Mediator()

// define ws
let ws = new WebSocket('ws://localhost:3001')
ws.onopen = function () {
  ws.send(JSON.stringify({
    type: 'open',
    payload: {
      name: name
    }
  }))
  // rich text
  console.log('%c  %c | %cWebsocket open!', 'background-color: #41b883;', 'color: #333;', 'color: #888;')
}
ws.onclose = function () {
  console.log('%c  %c | %cWebsocket close!', 'background-color: #41b883;', 'color: #333;', 'color: #888;')
}
ws.onmessage = function (e) {
  let {type, payload} = JSON.parse(e.data)
  mediator.parse(type, payload)
}
const getFormatTimestamp = function () {
  const doubleBit = function (num) {
    return (num >= 0 && num < 10) ? '0' + num : num
  }
  let date = new Date()
  return date.getYear() + 1900 + '-' + doubleBit(date.getMonth() + 1) + '-' +
  doubleBit(date.getDate()) + '  ' + doubleBit(date.getHours()) + ':' +
  doubleBit(date.getMinutes()) + ':' + doubleBit(date.getSeconds())
}
msg.keyup(function (e) {
  let keyCode = e.keyCode || e.which || e.charCode
  let ctrlKey = e.ctrlKey || e.metaKey
  let text = $(this).val()
  if (ctrlKey && keyCode === 13 && text !== '') {
    ws.send(JSON.stringify({
      type: 'message',
      payload: {
        from: mediator.from(),
        to: mediator.to(),
        msg: text,
        timestamp: getFormatTimestamp()
      }
    }))
    msg.val('')
  }
  e.preventDefault()
  return false
})
send.click(function () {
  let text = msg.val()
  if (text !== '') {
    ws.send(JSON.stringify({
      type: 'message',
      payload: {
        from: mediator.from(),
        to: mediator.to(),
        msg: text,
        timestamp: getFormatTimestamp()
      }
    }))
    msg.val('')
  }
})

// change nickname
let timer = {}
nickname.keyup(function () {
  clearTimeout(timer)
  timer = setTimeout(() => {
    if (nickname !== '') {
      ws.send(JSON.stringify({
        type: 'nickname',
        payload: {
          id: mediator.from().id,
          name: nickname.val()
        }
      }))
    }
  }, 500)
})
window.onbeforeunload = function () {
  // Close websocket manually, or it will interrupt the server.
  ws.close()
}

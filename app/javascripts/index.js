/**
 * Created by lonelydawn on 2017-11-20.
 */

import $ from 'jquery'

let input = $('#keyInput')
let content = $('#content')

// 一位数转换为两位数
let getDoubleBitDate = function (num) {
  return (num >= 0 && num < 10) ? '0' + num : num
}

let ws = new WebSocket('ws://localhost:3001')
ws.onopen = function () {
  console.log('Websocket open!')
}

ws.onclose = function () {
  console.log('Websocket close!')
}

ws.onmessage = function (e) {
  let date = new Date()
  let timeStamp = date.getYear() + 1900 + '-' + getDoubleBitDate(date.getMonth() + 1) + '-' +
    getDoubleBitDate(date.getDate()) + '  ' + getDoubleBitDate(date.getHours()) + ':' +
    getDoubleBitDate(date.getMinutes()) + ':' + getDoubleBitDate(date.getSeconds())
  $('<p class="color-blue">' + timeStamp + '</p>').appendTo(content)
  $('<p>' + e.data + '</p>').appendTo(content)
}

// 发送消息
let sendMessage = function () {
  let val = input.val()
  if (val.trim() !== '') {
    ws.send(val)
    input.val('')
  }
}

input.keyup(function (e) {
  let keyCode = e.keyCode || e.which || e.charCode
  let ctrlKey = e.ctrlKey || e.metaKey
  if (ctrlKey && keyCode === 13) {
    sendMessage()
  }
  e.preventDefault()
  return false
})

$('#sendBtn').click(function (e) {
  sendMessage()
})

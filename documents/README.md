# 共享网页聊天室系统设计

## 系统概述

 ### 技术结构

#### webpack

本质上，[webpack](https://github.com/webpack/webpack) 是一个现代 JavaScript 应用程序的*静态模块打包器(module bundler)*。当 webpack 处理应用程序时，它会递归地构建一个*依赖关系图(dependency graph)*，其中包含应用程序需要的每个模块，然后将所有这些模块打包成一个或多个 *bundle*。

在该例中，我们用其编译和合并压缩 ES5 以上 JS、SASS/SCSS、各种图片和字体资源等，并建立开发模式下热重载服务端，以方便系统调试。

#### jQuery

[jQuery ](https://github.com/jquery/jquery)是一个“写的更少，但做的更多”的轻量级 JavaScript 库。

在该例中，我们用其操作 DOM 节点。

#### WebSocket

[WebSocket](https://github.com/websockets/ws) 是基于TCP的一种新的网络协议，不同于 HTTP 一次请求一次响应的机制，它允许服务器主动发送信息给客户端，由此衍生了许多基于 WebSocket 的 web 即时应用。

在该例中，我们采用 node 第三方 ws 模块以建立网页即时通讯服务端。

### 核心功能

* 当打开页面时，系统会为用户随机分配一个名称
* 用户可以手动修改名称，系统将向所有客户端广播消息以同步数据
* 当用户 建立/关闭 连接时，系统将广播消息通知所有客户端创建新的联系人项目
* 用户可以向所有参与者或指定参与者发送消息





## 原型设计

### 原型图

![ChatRoomPrototype](https://github.com/lonelydawn/chatroom/blob/master/documents/ChatRoomPrototype.png)

[process on 链接地址](https://www.processon.com/view/5a7560d7e4b0615ac0498edc)



## 流程设计

### 流程图

![ChatRoomSystemConcept](https://github.com/lonelydawn/chatroom/blob/master/documents/ChatRoomSystemConcept.png)

[process on 链接地址](https://www.processon.com/view/5a792197e4b0874437bd3490)



### 流程描述

#### 打开页面

1. 打开页面时，客户端为用户分配随机用户名，并向服务端发送 open 消息

   ```js
   // 消息格式
   {
     type: 'open',
     payload: {
       name
     }
   }
   ```

2. 服务端接收 open 消息，转发至服务端 Mediator 

3. Mediator 根据 contactCounter 生成客户端 id 号，并新增 contact 对象，之后进入回调流程 4、5

4. 服务端向新建连接的客户端发送 load 消息，之后进入流程 6

   ```js
   // 消息格式
   {
     type: 'load',
     payload: {
       from: {id, name},
       contactList: mediator.contactList(), // 联系人列表
       talkHistory: mediator.talkHistory().filter(item => item.to.id === 0) // 聊天记录中群发的消息
     }
   }
   ```

5. 服务端向原有客户端发送 contact 消息，之后进入流程 7

   ```js
   // 消息格式
   {
     type: 'contact',
     payload: {
       id, name
     }
   }
   ```

6. 新建连接的客户端接收 load 消息，转发至 Mediator，初始化联系人列表和聊天历史记录并渲染 UI

7. 原有客户端接收 contact 消息，转发至 Mediator，新增联系人列表项并渲染 UI

#### 关闭页面

1. 关闭页面时，服务端捕获 close 事件并向所有客户端发送 lose 消息

   ```js
   // 消息格式
   {
     type: 'lose',
     payload: {
       id
     }
   }
   ```

2. 客户端接收 lose 消息，转发至客户端 Mediator 

3. Mediator 移除联系人列表项并渲染 UI

#### 发送消息

1. 用户输入并发送信息，客户端向服务端发送 message 消息

   ```js
   // 消息格式
   {
     type: 'message',
     payload: {
       from: {id,name},
       to: {id,name},
       msg,
       timestamp
     }
   }
   ```

2. 服务端接收 message 消息，转发至服务端 Mediator 

3. Mediator 根据 talkCounter 生成聊天记录 id 号，并新增聊天记录，之后进入回调流程 4

4. 服务端向目标客户端发送 message 消息，消息格式同流程 1

5. 客户端接收 message 消息，转发至客户端 Mediator

6. 客户端 Mediator 新增聊天记录项并渲染 UI

#### 修改用户名

1. 用户修改用户名时，客户端向服务端发送 nickname 消息

   ```js
   // 消息格式
   {
       type: 'nickname',
       payload: {
         id: targetId,
         name: modifiedName
       }
   }
   ```

2. 服务端接收 nickname 消息，转发至服务端 Mediator

3. Mediator 修改目标用户的信息和与之相关的所有聊天历史记录，之后进入回调流程 4

4. 服务端向所有建立连接的客户端发送 reload 消息

   ```js
   // 消息格式
   {
     type: 'reload',
     payload: {
       contactList: mediator.contactList(), // 联系人列表
       talkHistory: mediator.talkHistory().filter(record => { // 过滤和当前 client 有关的聊天记录
         return record.from.id === client.id || record.to.id === client.id || record.to.id === 0
       })
     }
   }
   ```

5. 客户端接收 reload 消息，转发至客户端 Mediator

6. 客户端 Mediator 更新联系人列表和聊天历史记录并渲染 UI





### 补充说明

- 系统只建立一个共享聊天室，其中 WebSocket Server 服务于所有 Client 端。
- 系统不以任何方式留存用户信息，打开页面即视为新的客户端建立连接，关闭页面即视为客户端永久断开连接。
- 兼容 Chrome, Firefox, Sogou 浏览器，不兼容 IE


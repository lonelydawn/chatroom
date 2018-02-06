# ChatRoom

## Content

* This is an simple chatroom program developed by webpack, jquery and **websocket**.
* In this chatroom, you can broadcast messages to all participants or someone you wanto talk with.
* At the moment you open a page, we'll assign a random nickname for you. But, you can change it as your wish. We'll synchronize data for other clients.

## Start

### dependencies

After clone or download this project, you should install dependencies firstly.

```shell
npm install
```

### develop

You can execute

```shell
npm start
```

to start webpack develop server, then you can debug it.

### produce

If you wanto release a production version, then execute

```shell
npm run build
```

to compile and merge source code.

Then excute

```shell
node app.js
```

to start a server which is established by node framework [koa](https://github.com/koajs/koa).

### ws

Last but not least, don't forget to execute

```shell
node ws.js
```

to start websocket server. Otherwise, you'll see nothing on the page.




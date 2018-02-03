/**
 * Created by lonelydawn on 2017-11-20.
 */

const Koa = require('koa')
const route = require('koa-route')
const serve = require('koa-static')
const sendfile = require('koa-sendfile')
const compress = require('koa-compress')
const json = require('koa-json')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const path = require('path')

const app = new Koa()

// middlewares
app.use(bodyparser())
app.use(json())
app.use(logger())
app.use(compress())
app.use(serve(path.join(__dirname, 'dist')))

app.use(route.get('/node_modules',function * (req, res) {
    yield * sendfile.call(this, path.join(__dirname,'index.html'))
}))

app.use(route.get('/*',function * (req, res) {
    yield * sendfile.call(this, path.join(__dirname,'index.html'))
}))

app.listen(3000)
console.log('listening at port 3000!')

module.exports = app
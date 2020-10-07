'use strict'
const env = process.env.NODE_ENV
const dotenv = '.env.' + env
require('dotenv').config({ path: dotenv })
const log = require('pino')()
const { gen_file } = require('./engine/puppeteer-engine.js')
const { compose } = require('./template/assembler.js')
const { create_docs } = require('./integrator/pdf-composition.js')
const Koa = require('koa')
const koarespond = require('koa-respond')
const bodyParser = require('koa-bodyparser')
const Router = require('koa-router')

const app = new Koa()
const router = new Router()
var constant = require('./constant/file-attribute.js')
  
router.post('/post', async (ctx, next) => {
    try {
        let start = process.hrtime()
        await next()
        // log.info(ctx.method + ' ' + ctx.url)
        let content = { header: '', body: '' }
        let param = ctx.request.body

        //get all required params from session
        let query = ctx.request.query
        param.user_id = query.username
        param.org_id = query.organizationid
        param.x_session_id = query['x-session-id']

        // call assembler to compose the templates with content
        log.info('1.  compose')
        await compose(param).then(json => {
            content = json
        })

        let pdfdoc = null
        param.file_name = param.file_name || constant.DEFAULT_NAME
        param.file_name += constant.DOT_PDF
        log.info('2.  gen_file')
        await gen_file(param, content).then( pdf => {
            pdfdoc = pdf
        })

        // call pdf-composition (/api/reports/post) service to create documents
        log.info('3.  create_docs')
        await create_docs(param, pdfdoc).then( () => {log.info('3a. (async) createing docs...')})

        let end = process.hrtime(start)
        let et = `${end[0]}s ${end[1] / 1000000}ms`
        ctx.set('X-Response-Time', et)
        log.info('** Elapsed time: ' + et + ' (response to user)')
    } catch (err) {
        ctx.status = err.statusCode || err.status || 500
        ctx.body = { status: ctx.status, message: err.message }
        log.error(err)
    }
})

app.use(koarespond())
app.use(bodyParser(
    {
        onerror: function (err, ctx) {
            log.error(err.message)
            ctx.throw(400, 'Bad Request: body parse error')
        }
    }
))
app.use(router.routes())
app.use(router.allowedMethods())

log.info('The report service was started on port: ' + process.env.PORT)
app.listen(process.env.PORT)


// await dispatch(ctx, start) // to be wrapped by worker.js for parallelism
async function dispatch(ctx, start){
    log.info(ctx.method + ' ' + ctx.url)
    // log.info('ctx.path' + ' ' + ctx.path)
    // log.info("charset: " + ctx.request.charset)
    let content = { header: '', body: '' }
    let param = ctx.request.body
    await compose(param).then(json => {
        content = json
    })

    let file_name = param.file_name || constant.DEFAULT_NAME
    file_name += constant.DOT_PDF
    await gen_file(file_name, content).then(pdf => {
        ctx.type = constant.CONTENT_TYPE
        ctx.attachment(file_name)
        ctx.ok(pdf) // ctx.ok(stream)
        let end = process.hrtime(start)
        let info = `${end[0]}s ${end[1] / 1000000}ms`
        ctx.set('X-Response-Time', info)
        log.info('Elapsed time: ' + info)
    })
}
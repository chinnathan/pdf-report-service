const env = process.env.NODE_ENV
const path = '.env.' + env
require('dotenv').config({ path: path })

const Koa = require('koa')
const koarespond = require('koa-respond')
const app = new Koa()
const log = require('pino')()
const fs = require('fs')

app.use(koarespond())

app.use(async (ctx, next) => {
    try {
        let start = process.hrtime()
        await next()
        log.info(ctx.method + ' ' + ctx.url)
        // log.info('ctx.path' + ' ' + ctx.path)
        ctx.type = 'application/pdf'
        ctx.attachment('report-chinnathan.pdf')
        const stream = fs.createReadStream(`${__dirname}/downstream/report-chinnathan.pdf`)
        ctx.ok(stream)

        let end = process.hrtime(start)
        let info = `${end[0]}s ${end[1] / 1000000}ms`
        ctx.set('X-Response-Time', info)
        log.info('Elapsed time: ' + info)
        // throw Error('error test')
    } catch (err) {
        ctx.status = err.statusCode || err.status || 500
        ctx.body = {
            status: ctx.status,
            message: err.message
        }
        log.error(err)
    }
})

log.info('The report service was started on port: ' + process.env.PORT)
app.listen(process.env.PORT)

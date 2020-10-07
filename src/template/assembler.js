'use strict'
// the assembler will assamble the html doc from static template and the content which is passed as parameter from client's request.
const env = process.env.NODE_ENV
const dotenv = '.env.' + env
require('dotenv').config({ path: dotenv })

const log = require('pino')()
const fs = require('fs')
const path = require('path')
log.info("TEMPLATE_PATH: " + process.env.TEMPLATE_PATH)

const base64Img = require('base64-img')
var Handlebars = require('handlebars')

async function compose(param) {
    // log.debug("compose -> param: " + JSON.stringify(param))
    if(!param.user_id){
        throw Error('user_id is required!')
    }
    if(!param.site_id){
        throw Error('site_id is required!')
    }
    
    let user_path = path.join(process.env.TEMPLATE_PATH, param.site_id, param.user_id) + path.sep

    if(!fs.existsSync(user_path + 'header.html')){
        throw Error(`A header template doesn't exist for user: ` + param.user_id)
    }
    let header = fs.readFileSync(user_path + 'header.html', 'utf8')

    let body = ''
    if(fs.existsSync(user_path + 'body.html')){
        body = fs.readFileSync(user_path + 'body.html', 'utf8')
    }else{
        let tpl_path = path.join(process.env.TEMPLATE_PATH, '../', 'default') + path.sep
        body = fs.readFileSync(tpl_path + 'body.html', 'utf8')
    }
    
    if(!fs.existsSync(user_path + 'barcode.png')){
        throw Error(`A barcode image doesn't exist for user: ` + param.user_id)
    }
    var img_data = base64Img.base64Sync(user_path + 'barcode.png')
    // let img_tag = `<img src='` + img_data + `' style='width:190px; height:66px;'>`
    let img_tag = `<img src='` + img_data + `' width='190' height='66'>`
    var template = Handlebars.compile(body)
    body = template({ content: param.content, img_tag: img_tag })
    param.content = ''
    log.info('1a. templates were assembled.')
    return { header: header, body: body }
}

module.exports.compose = compose
'use strict'
const env = process.env.NODE_ENV
const dotenv = '.env.' + env
require('dotenv').config({ path: dotenv })
const puppeteer = require('puppeteer')
const path = require('path')
const log = require('pino')()
log.info("DOWNSTREAM_PATH: " + process.env.DOWNSTREAM_PATH)

let { get_options } = require('../settings/options.js')

async function gen_file(param, content) {
    const browser = await puppeteer.launch({ args: ['--disable-dev-shm-usage', '--no-sandbox', '--disable-setuid-sandbox'] })
    const page = await browser.newPage()

    await page.goto(`data:text/html,${content.body}`, { waitUntil: 'networkidle0' }) // networkidle2 wait longer
    // create in DLS_PATH first
    let file_name = param.file_name
    let file = process.env.DLS_PATH + path.sep + file_name
    let options = get_options()
    // console.log("options", options)
    options.headerTemplate = content.header
    options.path = file
    let pdf = await page.pdf(options)
    // let pdf = await page.pdf({ path: file, format: PAPER_SIZE, margin: { top: '1cm', right: '2cm', bottom: '2cm', left: '2cm' } })
    log.info('2a. ' + file + ' was created.')
    await browser.close()

    return pdf
}

module.exports.gen_file = gen_file
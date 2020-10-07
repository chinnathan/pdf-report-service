'use strict'
// the integrator will call the external API service and write the file to listening directory as well.
const env = process.env.NODE_ENV
const dotenv = '.env.' + env
require('dotenv').config({ path: dotenv })
const log = require('pino')()
const fs = require('fs')
const path = require('path')
const { v4: uuidv4 } = require('uuid')
const axios = require('axios')

const constant = require('../constant/file-attribute.js')

async function create_docs(param, pdf) {
    let uuid = uuidv4(param.file_name)
    let downstreamPath = process.env.DOWNSTREAM_PATH
    let uuidFile = uuid + constant.DOT_PDF
    let downstreamFile = downstreamPath + path.sep + uuidFile

    fs.writeFile(downstreamFile, pdf, err => {
        if (err) {
            throw Error(err.message)
        }
        log.info('3b. ' + downstreamFile + ' was created.')
    })

}

module.exports.create_docs = create_docs
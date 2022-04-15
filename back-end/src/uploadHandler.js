const Busboy = require('busboy')
const { logger, pipelineAsync } = require('./util')
const { createWriteStream } = require('fs')
const { join } = require('path')
const ON_UPLOAD_EVENT =  'file-uploaded'

module.exports = class UploadHandler {
    #io
    #socketId

    constructor(io, socketId) {
        this.#io = io
        this.#socketId = socketId
    }


    registerEvents(headers, onFinish) {
        const busboy = new Busboy({ headers })

        busboy.on('file', this.#onFile.bind(this))

        busboy.on('finish', onFinish)

        return busboy

    }

    #handleFileBytes(fileName) {
        async function* handleData(data) {
            for await (const item of data) {
                const size = item.length
                // logger.warn(`File [${fileName}] got ${size} bytes to ${this.#socketId}`)
                this.#io.to(this.#socketId).emit(ON_UPLOAD_EVENT, size)
                yield item
            }
        }

        return handleData.bind(this)
    }

    async #onFile(fieldName, file, fileName) {
        const saveFileTo = join(__dirname, '../downloads', fileName)
        debugger
        logger.info('Uploading into ' + saveFileTo)

        await pipelineAsync(
            file,
            this.#handleFileBytes.apply(this, [fileName]),
            createWriteStream(saveFileTo)
        )

        logger.info(`File [${fileName}] finished!`)
    }

}
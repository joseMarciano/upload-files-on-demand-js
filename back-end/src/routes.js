const url = require('url')
const UploadHandler = require('./uploadHandler')
const { pipelineAsync, logger } = require('./util')
class Routes {

    #io

    constructor(io) {
        this.#io = io
    }

    async post(request, response) {
        console.log("POST request")
        const { headers } = request
        const { query: { socketId } } = url.parse(request.url, true)
        const redirectTo = headers.origin


        const uploadHanlder = new UploadHandler(this.#io, socketId)

        const onFinish = (response, redirectTo) => () => {
            response.writeHead(303, {
                Connection: 'close',
                Location: `${redirectTo}?msg=Files uploadded with success`
            })

            response.end()
        }

        const busboyInstance =
            uploadHanlder
            .registerEvents(headers, onFinish(response, redirectTo))

            await pipelineAsync(
                request,
                busboyInstance
            )

            logger.info('Request finishded with success!')

        return onFinish(response, headers.origin)

    }
}
module.exports = Routes
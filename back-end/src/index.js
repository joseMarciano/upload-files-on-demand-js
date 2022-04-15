const http = require('http')
const socketIo = require('socket.io')
const Routes = require('./routes')
const { logger } = require('./util')

const PORT = 3000

const handler = (request, response) => {
    const defaultRoute = async (_, response) => response.end('Hello!')

    const routes = new Routes(io)

    const chosen = routes[request.method.toLowerCase()] || defaultRoute

    return chosen.apply(routes, [request, response])

}

const server = http.createServer(handler)

const io = socketIo(server, {
    cors: {
        origin: '*',
        credentials: false
    }
})

io.on('connection', (socket) => logger.info('someone connected ' + socket.id))

// const interval = setInterval(() => {
//     io.emit('file-uploaded', 5e6)
// }, 250)

const startServer = () => {
    console.log(`app is running at http://localhost:${PORT}`)
}

server.listen(PORT, startServer)
// index.js
import exitHook from 'async-exit-hook'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import http from 'http'
import path from 'path'
import { Server } from 'socket.io'

import { corsOptions } from './config/cors.js'
import { env } from './config/environment.js'
import { CLOSE_DB, CONNECT_DB } from './config/mongodb.js'
import { errorHandlingMiddleware } from './middlewares/errorHandlingMiddleware.js'
import { APIs_V1 } from './routes/v1/index.js'
import {
  handleSockerBoard,
  handleSocketCard,
  handleSocketColumn,
} from './sockets/index.js'

// --- EXPRESS ---
const app = express()

// Fix caching
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store')
  next()
})

app.use(cookieParser())
app.use(cors(corsOptions))

// express.static để expose uploads
app.use('/uploads', express.static(path.resolve('uploads')))

app.use(express.json())

app.use('/v1', APIs_V1)
app.use(errorHandlingMiddleware)

// --- HTTP + SOCKET.IO ---
// tạo server mới bọc thằng app của express để làm real-time vói Socket.IO
const server = http.createServer(app)
const io = new Server(server, {
  cors: corsOptions
})

// --- SOCKET.IO EVENTS ---
io.on('connection', (socket) => {

  handleSockerBoard(socket)
  handleSocketColumn(socket)
  handleSocketCard(socket)

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id)
  })
})

// --- TEST API ---
app.get('/test', (req, res) => {
  res.status(200).json({ message: 'Test API is working!' })
})

// --- START SERVER ---
const START_SERVER = () => {
  const port = env.BUILD_MODE === 'production' ? process.env.PORT : env.LOCAL_DEV_APP_PORT
  const host = env.BUILD_MODE === 'production' ? undefined : env.LOCAL_DEV_APP_HOST

  // dùng server.listen() để lắng nghe kết nối từ client, // vì đã bọc app vào server mới tạo ở trên
  server.listen(port, host, () => {
    console.log(
      `${env.BUILD_MODE === 'production' ? 'Production' : 'Dev'}: Server running at ${host ?? 'localhost'}:${port}`
    )
  })
}

// --- DB CONNECT ---
exitHook(() => {
  CLOSE_DB()
  console.log('2. Disconnected from MongoDB')
})
;(async () => {
  try {
    await CONNECT_DB()
    console.log('1. Connected to MongoDB Cloud Atlas!')
    START_SERVER()
  } catch (error) {
    console.error('❌ MongoDB Connect Failed:', error)
    process.exit(1)
  }
})()

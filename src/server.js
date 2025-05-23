import exitHook from 'async-exit-hook'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'

import { corsOptions } from './config/cors'
import { env } from './config/environment'
import { CLOSE_DB, CONNECT_DB } from './config/mongodb'
import { errorHandlingMiddleware } from './middlewares/errorHandlingMiddleware'
import { APIs_V1 } from './routes/v1'

const app = express()


// fix cái lỗi cache from dish của expressjs
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store')
  next()
})

app.use(cookieParser())
app.use(cors(corsOptions))


// Enable req.body json data
app.use(express.json())
app.use('/v1', APIs_V1)

// Middleware xử lý lỗi tập trung
app.use(errorHandlingMiddleware)

// Test API
app.get('/test', (req, res) => {
  res.status(200).json({ message: 'Test API is working!' })
})

// Start server
const START_SERVER = () => {
  const port = env.BUILD_MODE === 'production' ? process.env.PORT : env.LOCAL_DEV_APP_PORT
  const host = env.BUILD_MODE === 'production' ? undefined : env.LOCAL_DEV_APP_HOST

  app.listen(port, host, () => {
    console.log(`${env.BUILD_MODE === 'production' ? 'Production' : 'Dev'}: Server running at ${host ?? ''}:${port}`)
  })
}
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
    process.exit(0)
  }
})()

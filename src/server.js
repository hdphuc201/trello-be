import express from 'express'
import exitHook from 'async-exit-hook'
import cors from 'cors'
import { CLOSE_DB, CONNECT_DB } from './config/mongodb'
import { env } from './config/environment'
import { APIs_V1 } from './routes/v1'
import { errorHandlingMiddleware } from './middlewares/errorHandlingMiddleware'
import { corsOptions } from './config/cors'

const app = express()

app.use(cors(corsOptions))

// Enable req.body json data
app.use(express.json())
app.use('/v1', APIs_V1)

// Middleware xử lý lỗi tập trung
app.use(errorHandlingMiddleware)

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

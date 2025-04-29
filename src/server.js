/* eslint-disable no-console */
/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */

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

// use APIs V1
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
  console.log('4. Server is shutting down...')
  CLOSE_DB()
  console.log('5. Disconnected from MongoDB')
})

// Imediately-invoked / Anonymous Async Functions (IIFE)
// https://developer.mozilla.org/en-US/docs/Glossary/IIFE
;(async () => {
  try {
    console.log('1. Connecting to MongoDB Cloud Atlas...')
    await CONNECT_DB()
    console.log('2. Connected to MongoDB Cloud Atlas!')
    START_SERVER()
  } catch (error) {
    console.error(error)
    process.exit(0)
  }
})()

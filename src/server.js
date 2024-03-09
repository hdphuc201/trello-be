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

const START_SERVER = () => {
  const app = express()

  app.use(cors(corsOptions))

  // Enable req.body json data
  app.use(express.json())

  // use APIs V1
  app.use('/v1', APIs_V1)

  // Middleware xử lý lỗi tập trung
  app.use(errorHandlingMiddleware)

  // Môi trường production (cụ thể hiện tại là đang support render.com)
  if (env.BUILD_MODE === 'production') {
    app.listen(process.env.PORT, () => {
      console.log(
        `3. Production: Hello ${env.AUTHOR}, Back-end server is running successully at Port: ${process.env.PORT}`
      )
    })
  } else {
    // Môi trường local dev
    app.listen(env.LOCAL_DEV_APP_PORT, env.LOCAL_DEV_APP_HOST, () => {
      console.log(
        `3. Local DEV: Hello ${env.AUTHOR}, Back-end server is running successully at Host: ${env.LOCAL_DEV_APP_HOST} and Port: ${env.LOCAL_DEV_APP_PORT}`
      )
    })
  }

  // commnet video 48 có giải thích: nên sử dụng linux-ubuntun, sd window dễ gặp tình trạng lỗi
  // Ctrl + C lúc được lúc không
  exitHook(() => {
    console.log('4. Server is shutting down...')
    CLOSE_DB()
    console.log('5. Disconnected from MongoDB')
  })
}

// Chỉ khi kết nối tới Database thành công thì mới Start Server Back-end lên

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

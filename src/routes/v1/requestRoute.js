import express from 'express'

import { requestController } from '~/controllers/requestController'
import { authMiddleware } from '~/middlewares/authMiddleware'

const Router = express.Router()

// get notify by user
Router.route('/')
  .get(authMiddleware.authentication, requestController.get)
  .post(authMiddleware.authentication, requestController.create)
  .put(authMiddleware.authentication, requestController.update)

export const requestRoute = Router

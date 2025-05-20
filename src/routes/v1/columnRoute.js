

import express from 'express'

import { columnController } from '~/controllers/columnController'
import { authMiddleware } from '~/middlewares/authMiddleware'
import { columnValidation } from '~/validations/columnValidation'

const Router = express.Router()

Router.route('/').post(authMiddleware.authentication, columnValidation.create, columnController.create)
Router.route('/:id')
  .put(authMiddleware.authentication, columnValidation.update, columnController.update)
  .delete(authMiddleware.authentication, columnValidation.deleteItem, columnController.deleteItem)

export const columnRoute = Router

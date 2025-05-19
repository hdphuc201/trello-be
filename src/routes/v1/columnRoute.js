

import express from 'express'

import { columnController } from '~/controllers/columnController'
import { authMiddleware } from '~/middlewares/authMiddleware'
import { columnValidation } from '~/validations/columnValidation'

const Router = express.Router()

Router.route('/').post(authMiddleware.isAuthrization, columnValidation.create, columnController.create)
Router.route('/:id')
  .put(authMiddleware.isAuthrization, columnValidation.update, columnController.update)
  .delete(authMiddleware.isAuthrization, columnValidation.deleteItem, columnController.deleteItem)

export const columnRoute = Router

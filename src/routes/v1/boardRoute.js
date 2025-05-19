import express from 'express'

import { boardController } from '~/controllers/boardController'
import { authMiddleware } from '~/middlewares/authMiddleware'
import { boardValidation } from '~/validations/boardValidation'

const Router = express.Router()

Router.route('/')
  .get(authMiddleware.isAuthrization, boardController.getAll)
  .post(authMiddleware.isAuthrization, boardValidation.create, boardController.create)

Router.route('/:id')
  .get(authMiddleware.isAuthrization, boardController.getDetails)
  .put(authMiddleware.isAuthrization, boardValidation.update, boardController.update)

// API hỗ trợ việc di chuyển card giữa các column khác nhau trong một board
Router.route('/supports/moving_card').put(
  authMiddleware.isAuthrization,
  boardValidation.moveCardToDifferentColumn,
  boardController.moveCardToDifferentColumn
)

export const boardRoute = Router

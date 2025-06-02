import express from 'express'

import { boardController } from '~/controllers/boardController'
import { authMiddleware } from '~/middlewares/authMiddleware'
import { boardValidation } from '~/validations/boardValidation'

const Router = express.Router()

Router.route('/').get(authMiddleware.authentication, boardController.getAll)

Router.route('/create').post(authMiddleware.authentication, boardValidation.create, boardController.create)

Router.route('/detail/:id').get(authMiddleware.authentication, boardController.getDetails)

Router.route('/update/:id').put(authMiddleware.authentication, boardValidation.update, boardController.update)

Router.route('/delete/:id').delete(authMiddleware.authentication, boardController.deleteBoard)

// API hỗ trợ việc di chuyển card giữa các column khác nhau trong một board
Router.route('/supports/moving_card').put(
  authMiddleware.authentication,
  boardValidation.moveCardToDifferentColumn,
  boardController.moveCardToDifferentColumn
)

export const boardRoute = Router

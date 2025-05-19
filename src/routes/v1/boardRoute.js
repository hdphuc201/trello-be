import express from 'express'

import { boardController } from '~/controllers/boardController'
import { authMiddleware } from '~/middlewares/authMiddleware'
import { boardValidation } from '~/validations/boardValidation'

const Router = express.Router()

Router.route('/')
  .get(authMiddleware.isAuthrization, boardController.getBoards,)
  .post(authMiddleware.isAuthrization, boardValidation.createBoard, boardController.createBoard)

Router.route('/:id')
  // từ Router -> Controler (tùy TH, kh nhất thiết phải qua validate vì ở đây nó chỉ cần truyền id nên kh cần thiết qua validate)
  .get(authMiddleware.isAuthrization, boardController.getDetails)
  .put(authMiddleware.isAuthrization, boardValidation.update, boardController.update)

// API hỗ trợ việc di chuyển card giữa các column khác nhau trong một board
Router.route('/supports/moving_card').put(
  authMiddleware.isAuthrization,
  boardValidation.moveCardToDifferentColumn,
  boardController.moveCardToDifferentColumn
)

export const boardRoute = Router

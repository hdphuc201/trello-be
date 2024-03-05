/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */

import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { boardController } from '~/controllers/boardController'
import { boardValidation } from '~/validations/boardValidation'

const Router = express.Router()

Router.route('/')
  .get((req, res) => {
    res.status(StatusCodes.OK).json({ message: 'GET: API get list boards' })
  })
  .post(boardValidation.createNew, boardController.createNew)

Router.route('/:id')
  // từ Router -> Controler (tùy TH, kh nhất thiết phải qua validate vì ở đây nó chỉ cần truyền id nên kh cần thiết qua validate)
  .get(boardController.getDetails)
  .put(boardValidation.update, boardController.update)

// API hỗ trợ việc di chuyển card giữa các column khác nhau trong một board

Router.route('/supports/moving_card').put(
  boardValidation.moveCardToDifferentColumn,
  boardController.moveCardToDifferentColumn
)

export const boardRoute = Router

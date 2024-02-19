/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */

import { StatusCodes } from 'http-status-codes'
import { boardService } from '~/services/boardService'

const createNew = async (req, res, next) => {
  try {
    // điều hướng dữ liệu sang tầng service
    // console.log('req.body', req.body)
    // console.log('req.body', req.query)
    // console.log('req.body', req.params)
    // console.log('req.body', req.files)
    // console.log('req.body', req.cookies)

    //Điều hướng dữ liệu sang tầng service
    const createBoard = await boardService.createNew(req.body)
    // Có kết quả thì trả về phía Client
    res.status(StatusCodes.CREATED).json(createBoard)
  } catch (error) {
    // nó chạy về Middleware xử lý lỗi
    next(error)
  }
}

export const boardController = {
  createNew
}

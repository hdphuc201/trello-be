/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */

import { boardModel } from '~/models/boardModel'
import { slugify } from '~/utils/formatters'
import { StatusCodes } from 'http-status-codes';
import ApiError from '~/utils/ApiError';

const createNew = async (reqBody) => {
  try {
    // xử lý logic dữ liệu tùy đặc thù dự án
    const newBoard = {
      ...reqBody,
      slug: slugify(reqBody.title)
    }

    // gọi cho tới tầng Model để xử lý lưu bản ghi newBoard vào trong Database
    const createdBoard = await boardModel.createNew(newBoard)

    // lấy bản ghi board sau khi gọi ( tùy mục đích dự án mà có cần bước này hay không)
    const getNewBoard = await boardModel.findOneById(createdBoard.insertedId)

    // Làm thêm các xử lý logic khác vs các collection khác tùy đặc thù dự án...
    // Bắn Email, notification về cho admin khi có 1 cái board mới được tạo...

    // trả kết quả về trong Service, luôn phải có return
    return getNewBoard
  } catch (error) {
    throw new Error(error)
  }
}


const getDetails = async (boardId) => {
  try {
    // gọi cho tới tầng Model để xử lý lưu bản ghi newBoard vào trong Database
    const board = await boardModel.getDetails(boardId)

    if (!board) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found')
    }
    // trả kết quả về trong Service, luôn phải có return
    return board
  } catch (error) {
    throw new Error(error)
  }
}
export const boardService = {
  createNew,
  getDetails
}

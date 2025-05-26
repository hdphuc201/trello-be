import { StatusCodes } from 'http-status-codes'

import { boardModel } from '~/models/boardModel'
import { cardModel } from '~/models/cardModel'
import { columnModel } from '~/models/columnModel'
import ApiError from '~/utils/ApiError'

const create = async (reqBody) => {
  try {
    const newColumn = {
      ...reqBody
    }

    const createdColumn = await columnModel.create(newColumn)
    const getNewColumn = await columnModel.findOneById(createdColumn.insertedId)

    if (getNewColumn) {
      // xử lý cấu trúc data ở đây trước khi trả về dữ liệu
      getNewColumn.cards = []

      // Cập nhật mảng columnOrderIds trong collection boards
      await boardModel.pushToBoard({
        type: 'columnOrderIds',
        column: getNewColumn
      })
    }

    return getNewColumn
  } catch (error) {
    throw error
  }
}

const update = async (columnId, reqBody) => {
  try {
    const updateData = {
      ...reqBody,
      updateAt: Date.now()
    }
    // gọi cho tới tầng Model để xử lý lưu bản ghi newBoard vào trong Database
    const updatedColumn = await columnModel.update(columnId, updateData)

    // trả kết quả về trong Service, luôn phải có return
    return updatedColumn
  } catch (error) {
    throw new Error(error)
  }
}

const deleteItem = async (columnId) => {
  try {
    const targetColumn = await columnModel.findOneById(columnId)

    if (!targetColumn) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Column not found')
    }
    // xóa Column
    await columnModel.deleteOneById(columnId)

    // xóa toàn bộ Cards thuộc cái Column trên
    await cardModel.deleteManyByColumnId(columnId)

    // Xóa columnId trong mảng columnOrderIds của cái board chứa nó
    await boardModel.pullColumnOrderIds(targetColumn)

    // trả kết quả về trong Service, luôn phải có return
    return {
      deleteResult: 'Column and its Cards delete successfully!'
    }
  } catch (error) {
    throw new Error(error)
  }
}

const moveItemToBoard = async (columnId, boardId) => {
  try {
    const existColumn = await columnModel.findOneById(columnId)
    const existBoard = await boardModel.findOneById(boardId)

    if (!existColumn || !existBoard) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Column or Board not found')
    }

    // 1. Xóa columnId khỏi board hiện tại
    await boardModel.pullColumnOrderIds(existColumn._id)

    // 2. Cập nhật column.boardId + thêm vào board mới
    const movedColumn = await columnModel.moveItemToBoard(columnId, boardId)

    return {
      message: 'Column moved successfully',
      movedColumn
    }
  } catch (error) {
    throw new Error(error)
  }
}

export const columnService = {
  create,
  update,
  moveItemToBoard,
  deleteItem
}

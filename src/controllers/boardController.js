import { StatusCodes } from 'http-status-codes'

import { boardService } from '~/services/boardService'

const create = async (req, res, next) => {
  const userId = req.user._id
  try {
    //Điều hướng dữ liệu sang tầng service
    const newBoard = await boardService.create(userId, req.body)
    res.status(StatusCodes.CREATED).json(newBoard)
  } catch (error) {
    next(error)
  }
}

const getAll = async (req, res, next) => {
  const userId = req.user._id
  const { page, itemsPerPage, q } = req.query
  try {
    const boards = await boardService.getAll(userId, req.query)
    res.status(StatusCodes.OK).json(boards)
  } catch (error) {
    next(error)
  }
}
const getDetails = async (req, res, next) => {
  try {
    const userId = req.user._id
    const boardId = req.params.id
    const board = await boardService.getDetails(userId, boardId)
    res.status(StatusCodes.OK).json(board)
  } catch (error) {
    next(error)
  }
}

const update = async (req, res, next) => {
  try {
    const boardId = req.params.id
    const updatedBoard = await boardService.update(boardId, req.body)
    res.status(StatusCodes.OK).json(updatedBoard)
  } catch (error) {
    next(error)
  }
}

const moveCardToDifferentColumn = async (req, res, next) => {
  try {
    const result = await boardService.moveCardToDifferentColumn(req.body)

    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const deleteBoard = async (req, res, next) => {
  try {
    const boardId = req.params.id
    const result = await boardService.deleteBoard(boardId)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

export const boardController = {
  getAll,
  create,
  getDetails,
  update,
  deleteBoard,
  moveCardToDifferentColumn
}

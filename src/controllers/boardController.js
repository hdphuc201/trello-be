import { StatusCodes } from 'http-status-codes'

import { boardService } from '~/services/boardService'

const createBoard = async (req, res, next) => {
  const userId = req.user._id
  try {
    //Điều hướng dữ liệu sang tầng service
    const createBoard = await boardService.createBoard(userId, req.body)
    res.status(StatusCodes.CREATED).json(createBoard)
  } catch (error) {
    next(error)
  }
}

const getBoards = async (req, res, next) => {
  const userId = req.user._id
  const { page, itemsPerPage } = req.query
  try {
    const boards = await boardService.getBoards(userId, page, itemsPerPage)
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

export const boardController = {
  getBoards,
  createBoard,
  getDetails,
  update,
  moveCardToDifferentColumn
}

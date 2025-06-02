import { StatusCodes } from 'http-status-codes'

import { requestService } from '~/services/requestService'

const get = async (req, res, next) => {
  try {
    const boardId = req.query.boardId
    const userId = req.user._id
    const newRequest = await requestService.get(boardId)
    const result = res.status(StatusCodes.OK).json(newRequest)
    return result
  } catch (error) {
    next(error)
  }
}
const create = async (req, res, next) => {
  try {
    const { approvedUserId } = req.body // người được duyệt (người nhập link và gửi yêu cầu duyệt)
    const createRequest = await requestService.create(req.body, approvedUserId)
    const result = res.status(StatusCodes.OK).json(createRequest)
    return result
  } catch (error) {
    next(error)
  }
}

const update = async (req, res, next) => {
  try {
    const updateRequest = await requestService.update(req.body)
    const result = res.status(StatusCodes.OK).json(updateRequest)
    return result
  } catch (error) {
    next(error)
  }
}

export const requestController = {
  get,
  create,
  update
}

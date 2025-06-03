import { StatusCodes } from 'http-status-codes'

import { boardModel } from '~/models/boardModel'
import { requestModel } from '~/models/requestModel'
import { userModel } from '~/models/userModel'
import ApiError from '~/utils/ApiError'
import { BOARD_INVITATION_STATUS, INVITATION_TYPES } from '~/utils/constants'

const get = async (boardId) => {
  try {
    const result = await requestModel.get(boardId)
    return result
  } catch (error) {
    throw error
  }
}
const create = async (reqBody, approvedUserId) => {
  const { boardId } = reqBody

  try {
    const board = await boardModel.findOneById(boardId)

    // id của người duyệt, lấy owner từ board
    const approveUserId = board.ownerIds[0].toString()

    const approvedUser = await userModel.findOneById(approvedUserId)
    const approveUser = await userModel.findOneById(approveUserId)

    if (!approvedUser || !approveUser || !board) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'approveUser, approvedUser or Board not found!')
    }
    const newRequest = {
      approveUserId,
      approvedUserId: approvedUserId,
      type: INVITATION_TYPES.BOARD_REQUEST_JOIN,
      boardJoinRequest: {
        boardId,
        status: BOARD_INVITATION_STATUS.PENDING // default status
      },
      user: {
        email: approvedUser.email,
        displayName: approvedUser.displayName,
        avatar: approvedUser.avatar,
        role: approvedUser.role
      }
    }

    // trả về kết quả của create vì insertOne luôn trả về dạng:
    // create {
    //   acknowledged: true,
    //   insertedId: new ObjectId('683838af7b64a0f1cd5f6071')
    // }
    // nên truy vấn lại document vừa tạo
    const create = await requestModel.create(newRequest)
    const getRequest = await requestModel.findOneById(create.insertedId.toString())

    return getRequest
  } catch (error) {
    throw error
  }
}
const update = async (reqBody) => {
  const { requestId, status } = reqBody

  try {
    // Lấy request
    const request = await requestModel.findOneById(requestId)
    if (!request) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Join request not found!')
    }

    const boardId = request.boardJoinRequest.boardId
    const board = await boardModel.findOneById(boardId)
    if (!board) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found!')
    }

    const userId = request.approvedUserId
    const isAlreadyInBoard = board.ownerIds.includes(userId) || board.memberIds.includes(userId)

    if (status === BOARD_INVITATION_STATUS.ACCEPTED && isAlreadyInBoard) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'User already in board!')
    }

    // Cập nhật trạng thái mới vào request
    const updatedRequest = await requestModel.update(requestId, status)

    // Nếu trạng thái là ACCEPTED thì thêm user vào board
    if (status === BOARD_INVITATION_STATUS.ACCEPTED && !isAlreadyInBoard) {
      await boardModel.pushToBoard({
        type: 'memberIds',
        boardId,
        userId
      })
    }

    return updatedRequest
  } catch (error) {
    throw error
  }
}

export const requestService = {
  get,
  create,
  update
}

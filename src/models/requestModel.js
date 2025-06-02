import Joi from 'joi'
import { ObjectId } from 'mongodb'

import { GET_DB, getDB } from '~/config/mongodb'
import { BOARD_INVITATION_STATUS, INVITATION_TYPES, USER_ROLES } from '~/utils/constants'
import { EMAIL_RULE, EMAIL_RULE_MESSAGE, OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

import { boardModel } from './boardModel'
import { userModel } from './userModel'

// Joi schema để validate dữ liệu trước khi insert
const BOARD_JOIN_REQUEST_COLLECTION_SCHEMA = Joi.object({
  approveUserId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE), // NGƯỜI DUYỆT
  approvedUserId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE), // NGƯỜI ĐƯỢC DUYỆT
  type: Joi.string()
    .required()
    .valid(...Object.values(INVITATION_TYPES)),
  boardJoinRequest: Joi.object({
    boardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    status: Joi.string()
      .required()
      .valid(...Object.values(BOARD_INVITATION_STATUS))
  }).optional(),
  user: Joi.object({
    email: Joi.string().required().pattern(EMAIL_RULE).message(EMAIL_RULE_MESSAGE), // unique
    displayName: Joi.string().required().trim().strict(),
    avatar: Joi.any().default(null),
    role: Joi.string()
      .valid(...Object.values(USER_ROLES))
      .default(USER_ROLES.CLIENT)
  }).optional(),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

const BOARD_JOIN_REQUEST_COLLECTION_NAME = 'request-join-boards'

const validateBeforeCreate = async (data) => {
  return await BOARD_JOIN_REQUEST_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const get = async (boardId) => {
  try {
    const result = await GET_DB()
      .collection(BOARD_JOIN_REQUEST_COLLECTION_NAME)
      .find({
        'boardJoinRequest.boardId': boardId,
        _destroy: false // đừng quên điều kiện này để lọc những cái chưa bị xoá mềm
      })
      .toArray()

    return result
  } catch (error) {
    throw new Error(error.message)
  }
}
const create = async (newRequest) => {
  try {
    const validData = await validateBeforeCreate(newRequest)
    const result = await GET_DB().collection(BOARD_JOIN_REQUEST_COLLECTION_NAME).insertOne(validData)
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const findOneById = async (requestId) => {
  try {
    const result = await GET_DB()
      .collection(BOARD_JOIN_REQUEST_COLLECTION_NAME)
      .findOne({ _id: new ObjectId(requestId) })

    return result
  } catch (error) {
    throw new Error(error)
  }
}

const findPendingRequestsByBoardId = async (boardId) => {
  try {
    const result = await getDB()
      .collection(BOARD_JOIN_REQUEST_COLLECTION_NAME)
      .find({
        boardId,
        status: BOARD_INVITATION_STATUS.PENDING,
        _destroy: false
      })
      .toArray()
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const update = async (requestId, status) => {
  try {
    const result = await GET_DB()
      .collection(BOARD_JOIN_REQUEST_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(requestId), _destroy: false },
        { $set: { 'boardJoinRequest.status': status } }, // Cập nhật đúng field con
        { returnDocument: 'after' } // Trả về document sau khi update
      )

    return result // MongoDB trả về trong { value, ok, ... }
  } catch (error) {
    throw new Error(error)
  }
}

const getRequest = async (userId) => {
  // Hôm nay tạm thời giống hệt hàm findOneById - và sẽ update phần aggregate tiep1 ở những video tới
  try {
    const queryCondition = [{ approveUserId: new ObjectId(userId) }, { _destroy: false }] // người được mời là em
    const result = await GET_DB()
      .collection(BOARD_JOIN_REQUEST_COLLECTION_NAME)
      .aggregate([
        { $match: { $and: queryCondition } },
        {
          $lookup: {
            from: userModel.USER_COLLECTION_NAME,
            localField: 'approveUserId', // người được duyệt
            foreignField: '_id',
            as: 'approveUser',
            pipeline: [{ $project: { password: 0, verifyToken: 0 } }]
          }
        },
        {
          $lookup: {
            from: userModel.USER_COLLECTION_NAME,
            localField: 'approvedUserId', // người duyệt
            foreignField: '_id',
            as: 'approvedUser',
            pipeline: [{ $project: { password: 0, verifyToken: 0 } }]
          }
        },
        {
          $lookup: {
            from: boardModel.BOARD_COLLECTION_NAME,
            localField: 'boardJoinRequest.boardId', // lấy thông tin board
            foreignField: '_id',
            as: 'board'
          }
        }
      ])
      .toArray()
    return result
  } catch (error) {
    throw new Error(error)
  }
}
export const requestModel = {
  BOARD_JOIN_REQUEST_COLLECTION_NAME,
  get,
  getRequest,
  create,
  update,
  findOneById,
  findPendingRequestsByBoardId
}

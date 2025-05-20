/* eslint-disable no-console */
import Joi from 'joi'
import { ObjectId } from 'mongodb'

import { GET_DB } from '~/config/mongodb'
import { EMAIL_RULE, EMAIL_RULE_MESSAGE, OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

// Define collection (name & schema)
const CARD_COLLECTION_NAME = 'cards'
const CARD_COLLECTION_SCHEMA = Joi.object({
  boardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  columnId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),

  title: Joi.string().required().min(3).max(50).trim().strict(),
  description: Joi.string().optional().allow(''),

  cover: Joi.string().default(null),
  memberIds: Joi.array().items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)).default([]),

  // Dữ liệu comments của Card chúng ta sẽ học cách nhúng - embedded vào bản ghi Card luôn như dưới đây:
  comments: Joi.array()
    .items({
      userId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
      userEmail: Joi.string().pattern(EMAIL_RULE).message(EMAIL_RULE_MESSAGE),
      userAvatar: Joi.string(),
      userDisplayName: Joi.string(),
      content: Joi.string(),
      // Chỗ này lưu ý vì dùng hàm push để thêm comment nên không set default Date.now luôn giống hàm insertOne khi create được.
      commentedAt: Joi.date().timestamp()
    })
    .default([]),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

// chỉ định ra những fields mà chúng ta không muốn cho phép cập nhật trong hàm update()
const INVALID_UPDATE_FIELDS = ['_id', 'createAt', 'boardId']

const validateBeforeCreate = async (data) => {
  return await CARD_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const create = async (data) => {
  try {
    const validData = await validateBeforeCreate(data)

    // biến đổi 1 số dữ liệu liên quan tới ObjectId chuẩn chỉnh
    const newCardToAdd = {
      ...validData,
      boardId: new ObjectId(validData.boardId),
      columnId: new ObjectId(validData.columnId)
    }

    const createdCard = await GET_DB().collection(CARD_COLLECTION_NAME).insertOne(newCardToAdd)
    return createdCard
  } catch (error) {
    throw new Error(error)
  }
}

const findOneById = async (cardId) => {
  try {
    // console.log(cardId)
    const result = await GET_DB()
      .collection(CARD_COLLECTION_NAME)
      .findOne({
        // id truyền vào phải là 1 Object
        _id: new ObjectId(cardId)
      })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const update = async (cardId, updateData, cardCover) => {
  try {
    // Lọc những cái field không cho phép chúng ta cập nhật linh tinh
    Object.keys(updateData).forEach((fieldName) => {
      if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
        delete updateData[fieldName]
      }
    })

    // Đối vs những dữ liệu liên quan ObjectId, biến đổi ở đây (tùy sau này nếu cần thì tách function riêng )
    if (updateData.columnId) {
      updateData.columnId = new ObjectId(updateData.columnId)
    }

    const result = await GET_DB()
      .collection(CARD_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(cardId) },
        { $set: updateData },
        { returnDocument: 'after' } // dùng thg này nếu muốn trả về bản ghi đã được cập nhật
      )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const deleteManyByColumnId = async (columnId) => {
  try {
    // console.log(columnId)
    const result = await GET_DB()
      .collection(CARD_COLLECTION_NAME)
      .deleteMany({
        // id truyền vào phải là 1 Object
        columnId: new ObjectId(columnId)
      })
    return result
  } catch (error) {
    throw new Error(error)
  }
}
export const cardModel = {
  CARD_COLLECTION_NAME,
  CARD_COLLECTION_SCHEMA,
  create,
  update,
  findOneById,
  deleteManyByColumnId
}

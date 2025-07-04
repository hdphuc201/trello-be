import Joi from 'joi'
import { ObjectId } from 'mongodb'

import { GET_DB } from '~/config/mongodb'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

// Define Collection (name & schema)
const COLUMN_COLLECTION_NAME = 'columns'
const COLUMN_COLLECTION_SCHEMA = Joi.object({
  boardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  title: Joi.string().required().min(1).max(50).trim().strict(),

  // Lưu ý các item trong mảng cardOrderIds là ObjectId nên cần thêm pattern cho chuẩn nhé, (lúc quay video số 57 mình quên nhưng sang đầu video số 58 sẽ có nhắc lại về cái này.)
  cardOrderIds: Joi.array().items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)).default([]),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

// chỉ định ra những fields mà chúng ta không muốn cho phép cập nhật trong hàm update()
const INVALID_UPDATE_FIELDS = ['_id', 'createAt', 'boardId']

const validateBeforeCreate = async (data) => {
  return await COLUMN_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const create = async (data) => {
  try {
    const validData = await validateBeforeCreate(data)

    const newColumnToAdd = {
      ...validData,
      boardId: new ObjectId(validData.boardId)
    }

    const createdColumn = await GET_DB().collection(COLUMN_COLLECTION_NAME).insertOne(newColumnToAdd)
    return createdColumn
  } catch (error) {
    throw new Error(error)
  }
}

const findOneById = async (columnId) => {
  try {
    const result = await GET_DB()
      .collection(COLUMN_COLLECTION_NAME)
      .findOne({
        // id truyền vào phải là 1 Object
        _id: new ObjectId(columnId)
      })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

// nhiệm vụ của function này là push 1 cái giá trị cardId vào cuối mảng cardOrderIds
const pushCardOrderIds = async (card) => {
  try {
    const result = await GET_DB()
      .collection(COLUMN_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(card.columnId) },
        { $push: { cardOrderIds: new ObjectId(card._id) } },
        // dùng thg này nếu muốn trả về bản ghi đã được cập nhật
        { returnDocument: 'after' }
      )

    return result
  } catch (error) {
    throw new Error(error)
  }
}

const update = async (columnId, updateData) => {
  try {
    // Lọc những cái field không cho phép chúng ta cập nhật linh tinh
    Object.keys(updateData).forEach((fieldName) => {
      if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
        delete updateData(fieldName)
      }
    })

    // đối vs những dữ liệu liên quan ObjectId, biến đổi ở đây
    if (updateData.cardOrderIds) {
      updateData.cardOrderIds = updateData.cardOrderIds.map((_id) => new ObjectId(_id))
    }

    const result = await GET_DB()
      .collection(COLUMN_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(columnId) },
        { $set: updateData },
        { returnDocument: 'after' } // dùng thg này nếu muốn trả về bản ghi đã được cập nhật
      )

    return result
  } catch (error) {
    throw new Error(error)
  }
}

const deleteOneById = async (columnId) => {
  try {
    const result = await GET_DB()
      .collection(COLUMN_COLLECTION_NAME)
      .deleteOne({
        // id truyền vào phải là 1 Object
        _id: new ObjectId(columnId)
      })

    return result
  } catch (error) {
    throw new Error(error)
  }
}
const BOARD_COLLECTION_NAME = 'boards'
const moveItemToBoard = async (columnId, newBoardId) => {
  try {
    // Cập nhật column: set lại boardId
    const result = await GET_DB()
      .collection(COLUMN_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(columnId) },
        { $set: { boardId: new ObjectId(newBoardId) } },
        { returnDocument: 'after' }
      )

    // Thêm columnId vào board mới
    await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(newBoardId) },
        { $push: { columnOrderIds: new ObjectId(columnId) } }
      )

    return result
  } catch (error) {
    throw new Error(error)
  }
}


export const columnModel = {
  COLUMN_COLLECTION_NAME,
  COLUMN_COLLECTION_SCHEMA,
  create,
  update,
  findOneById,
  pushCardOrderIds,
  deleteOneById,
  moveItemToBoard
}

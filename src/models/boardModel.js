import Joi from 'joi'
import { ObjectId } from 'mongodb'

import { GET_DB } from '~/config/mongodb'
import { BOARD_TYPES } from '~/utils/constants'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

import { cardModel } from './cardModel'
import { columnModel } from './columnModel'
import { userModel } from './userModel'

const BOARD_COLLECTION_NAME = 'boards'
const BOARD_COLLECTION_SCHEMA = Joi.object({
  title: Joi.string().required().min(3).max(50).trim().strict(),
  slug: Joi.string().required().min(3).trim().strict(),
  description: Joi.string().required().min(3).max(256).trim().strict(),
  type: Joi.string().valid(BOARD_TYPES.PUBLIC, BOARD_TYPES.PRIVATE).required(),
  // Lưu ý các item trong mảng columnOrderIds là ObjectId nên cần thêm pattern cho chuẩn nhé, (lúc quay video số 57 mình quên nhưng sang đầu video số 58 sẽ có nhắc lại về cái này.)
  columnOrderIds: Joi.array().items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)).default([]),
  // những Admin của board
  ownerIds: Joi.array().items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)).default([]),
  // những Member của board
  memberIds: Joi.array().items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)).default([]),

  createAt: Joi.date().timestamp('javascript').default(Date.now),
  updateAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

// chỉ định ra những fields mà chúng ta không muốn cho phép cập nhật trong hàm update()
const INVALID_UPDATE_FIELDS = ['_id', 'createAt']

const validateBeforeCreate = async (data) => {
  return await BOARD_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const create = async (userId, data) => {
  try {
    const validData = await validateBeforeCreate(data)

    const creatBoardData = {
      ...validData,
      ownerIds: [new ObjectId(userId)],
      memberIds: [new ObjectId(userId)]
    }

    const createdBoard = await GET_DB().collection(BOARD_COLLECTION_NAME).insertOne(creatBoardData)
    return createdBoard
  } catch (error) {
    throw new Error(error)
  }
}

const findOneById = async (boardId) => {
  try {
    // console.log(boardId)
    const result = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .findOne({
        // id truyền vào phải là 1 Object
        _id: new ObjectId(boardId)
      })
    return result
  } catch (error) {
    throw new Error(error)
  }
}



// Query tổng hợp (aggregate) để lấy toàn bộ Columns và Cards thuộc về Board
const getDetails = async (userId, boardId) => {
  // Hôm nay tạm thời giống hệt hàm findOneById - và sẽ update phần aggregate tiep1 ở những video tới
  try {
    const queryCondition = [
      { _id: new ObjectId(boardId) },
      { _destroy: false },
      { $or: [{ ownerIds: { $all: [new ObjectId(userId)] } }, { memberIds: { $all: [new ObjectId(userId)] } }] }
    ]
    const result = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .aggregate([
        { $match: { $and: queryCondition } },
        {
          $lookup: {
            // đang đứng ở board tìm tới colum
            from: columnModel.COLUMN_COLLECTION_NAME,
            // là cái _id của cái board hiện tại
            localField: '_id',
            // tìm tới cái boardId của column
            foreignField: 'boardId',
            as: 'columns'
          }
        },
        {
          $lookup: {
            from: cardModel.CARD_COLLECTION_NAME,
            localField: '_id',
            foreignField: 'boardId',
            as: 'cards'
          }
        },
        {
          $lookup: {
            from: userModel.USER_COLLECTION_NAME,
            localField: 'memberIds',
            foreignField: '_id',
            as: 'members',
            // lọc ra những field mà chúng ta muốn hiển thị, password và verifyToken không hiển thị
            // chỉ định không muốn trả về thì gán 0
            pipeline: [{ $project: { password: 0, verifyToken: 0 } }]
          }
        },
        {
          $lookup: {
            from: userModel.USER_COLLECTION_NAME,
            localField: 'ownerIds',
            foreignField: '_id',
            as: 'owners',
            pipeline: [{ $project: { password: 0, verifyToken: 0 } }]
          }
        }
      ])
      .toArray()
    // aggregate nó sẽ trả về mảng => mục đích chỉ lấy 1 cái board
    // => thì nó sẽ luôn luôn là mảng có 1 phần tử
    // => nên sẽ return về phần tử đầu tiên result[0] - còn nếu kh có thì trả về null
    // console.log(result)
    return result[0] || null
  } catch (error) {
    throw new Error(error)
  }
}

// Đẩy một phần tử ColumnId vào cuối mảng columnOrderIds
// dùng $push trong mongdb ở trường hợp này để lấy một phần vào cuối mảng
const pushColumnOrderIds = async (column) => {
  try {
    const result = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(column.boardId) },
        { $push: { columnOrderIds: new ObjectId(column._id) } },
        // dùng thg này nếu muốn trả về bản ghi đã được cập nhật
        { returnDocument: 'after' }
      )

    return result
  } catch (error) {
    throw new Error(error)
  }
}

// Lấy một phần tử columnIds ra khỏi mảng columnOrderIds
// dùng $pull trong mongdb ở trường hợp này để lấy một phần tử ra khỏi mảng rồi xóa nó đi
const pullColumnOrderIds = async (column) => {
  try {
    const result = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(column.boardId) },
        { $pull: { columnOrderIds: new ObjectId(column._id) } },
        // dùng thg này nếu muốn trả về bản ghi đã được cập nhật
        { returnDocument: 'after' }
      )

    return result
  } catch (error) {
    throw new Error(error)
  }
}

const update = async (boardId, updateData) => {
  try {
    // Lọc những cái field không cho phép chúng ta cập nhật linh tinh
    Object.keys(updateData).forEach((fieldName) => {
      if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
        delete updateData(fieldName)
      }
    })

    // đối vs những dữ liệu liên quan ObjectId, biến đổi ở đây
    if (updateData.columnOrderIds) {
      updateData.columnOrderIds = updateData.columnOrderIds.map((_id) => new ObjectId(_id))
    }

    const result = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(boardId) },
        { $set: updateData },
        { returnDocument: 'after' } // dùng thg này nếu muốn trả về bản ghi đã được cập nhật
      )

    return result
  } catch (error) {
    throw new Error(error)
  }
}

const getAll = async (userId, page, itemsPerPage) => {
  try {
    const queryCondition = [
      // điều kiện board chưa bị xóa
      { _destroy: false },
      // điều kiện 2: userId đang thực hiện request này nó phải thuộc 1 trong 2 cái mảng ownerIds hoặc memberIds,
      // sử dụng toán tử $all của mongodb
      { $or: [{ ownerIds: { $all: [new ObjectId(userId)] } }, { memberIds: { $all: [new ObjectId(userId)] } }] }
    ]

    const query = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .aggregate(
        [
          { $match: { $and: queryCondition } },
          // sort title của board theo A-Z (mặc định sẽ bị chữ B hoa đứng trước chữ a thường, theo chuẩn bảng mã ASCII)
          { $sort: { title: 1 } },
          // $facet để xử lý nhiều luồng trong một query
          {
            $facet: {
              // luồng thứ 1: Querry board
              queryBoards: [{ $skip: itemsPerPage > 0 ? (page - 1) * itemsPerPage : 0 }, { $limit: itemsPerPage }],
              // luồng thứ 2: Query đếm tổng tất cả số lượng bản ghi boards trong DB và trả về vào biến countedAllBoards
              queryTotalBoards: [{ $count: 'countedAllBoards' }]
            }
          }
        ],
        // Khai báo thêm thuộc tính collation locale 'en' để fix fux chữ B hoa và a thường
        // https://www.mongodb.com/docs/v6.0/reference/collation/#std-label-collation-document-fields
        { collation: { locale: 'en' } }
      )
      .toArray()
    const res = query[0]

    return {
      boards: res?.queryBoards || [],
      total: res?.queryTotalBoards[0]?.countedAllBoards || 0
    }
  } catch (error) {
    throw new Error(error)
  }
}

export const boardModel = {
  BOARD_COLLECTION_NAME,
  BOARD_COLLECTION_SCHEMA,
  getAll,
  create,
  findOneById,
  getDetails,
  pushColumnOrderIds,
  pullColumnOrderIds,
  update
}

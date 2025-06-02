/* eslint-disable no-console */
import Joi from 'joi'
import { ObjectId } from 'mongodb'

import { GET_DB } from '~/config/mongodb'
import { CARD_MEMBER_ACTION } from '~/utils/constants'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

// Define collection (name & schema)
const CARD_COLLECTION_NAME = 'cards'
const CARD_COLLECTION_SCHEMA = Joi.object({
  boardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  columnId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),

  title: Joi.string().required().min(1).max(50).trim().strict(),
  description: Joi.string().optional().allow(''),

  cover: Joi.any().default(null),
  done: Joi.boolean().default(false),
  fileAttach: Joi.array()
    .items({
      originalName: Joi.string(),
      mimeType: Joi.string(),
      size: Joi.number(),
      url: Joi.string(),
      createdAt: Joi.date().timestamp('javascript').default(Date.now)
    })
    .optional(),

  todoList: Joi.array()
    .items({
      title: Joi.string().required().min(1).max(255).trim(),
      _id: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
      items: Joi.array()
        .items({
          title: Joi.string().min(1).max(255).trim(),
          isDone: Joi.boolean().default(false), // trong items của todoList
          _id: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
        })
        .default([])
    })
    .default([]),

  memberIds: Joi.array().items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)).default([]),
  memberCardIds: Joi.array().items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)).default([]),

  // Dữ liệu comments của Card chúng ta sẽ học cách nhúng - embedded vào bản ghi Card luôn như dưới đây:
  comments: Joi.array()
    .items({
      createdBy: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
      userDisplayName: Joi.string(),
      content: Joi.string(),
      // Chỗ này lưu ý vì dùng hàm push để thêm comment nên không set default Date.now luôn giống hàm insertOne khi create được.
      commentedAt: Joi.date().timestamp()
    })
    .default([]),

  date: Joi.object({
    startDate: Joi.date().timestamp('javascript').allow(null),
    endDate: Joi.date().timestamp('javascript').allow('', null),
    endTime: Joi.alternatives().try(Joi.date().timestamp('javascript'), Joi.valid(null)),
    reminder: Joi.string().default('')
  }).default({}),

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

const update = async (cardId, updateData) => {
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

// mongodb chỉ có hàm $push để đẩy phần tử vào cuối mảng thôi, nên nếu muốn đẩy vào đầu mảng
// thì ta sẽ bọc data vào trong Array each và chỉ định postion là 0
const updateComment = async (cardId, commentData) => {
  const updateCondition =
    commentData.action === 'remove'
      ? { $pull: { comments: { _id: new ObjectId(commentData._id) } } }
      : { $push: { comments: { $each: [commentData], $position: 0 } } }

  try {
    const result = await GET_DB()
      .collection(CARD_COLLECTION_NAME)
      .findOneAndUpdate({ _id: new ObjectId(cardId) }, updateCondition, { returnDocument: 'after' })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const updateTodoList = async (cardId, todoList) => {
  let updateCondition
  let arrayFilters
  // thêm todolist
  if (todoList.action === 'add-item') {
    updateCondition = {
      $push: {
        'todoList.$[todo].items': {
          _id: new ObjectId(),
          title: todoList.title,
          isDone: false
        }
      }
    }
    arrayFilters = [{ 'todo._id': new ObjectId(todoList.todoId) }]
  }

  // arrayFilters dùng để chọn todoList cụ thể ($[todo]), còn items thì pull theo điều kiện _id.
  if (todoList.action === 'remove-item') {
    updateCondition = {
      $pull: { 'todoList.$[todo].items': { _id: new ObjectId(todoList.itemId) } }
    }
    arrayFilters = [{ 'todo._id': new ObjectId(todoList.todoId) }]
  }
  if (todoList.action === 'update-item') {
    updateCondition = {
      $set: { 'todoList.$[todo].items.title': todoList.title }
    }
    arrayFilters = [{ 'todo._id': new ObjectId(todoList.todoId) }]
  }

  if (todoList.action === 'add') {
    updateCondition = { $push: { todoList: { $each: [todoList], $position: 0 } } }
  }
  if (todoList.action === 'remove') {
    updateCondition = { $pull: { todoList: { _id: new ObjectId(todoList.todoId) } } }
  }
  if (todoList.action === 'update') {
    updateCondition = {
      $set: {
        'todoList.$[todo].title': todoList.title
      }
    }
    arrayFilters = [{ 'todo._id': new ObjectId(todoList.todoId) }]
  }
  if (todoList.action === 'toggle-checkbox') {
    updateCondition = {
      $set: {
        'todoList.$[todo].items.$[item].isDone': todoList.isDone
      }
    }
    arrayFilters = [{ 'todo._id': new ObjectId(todoList.todoId) }, { 'item._id': new ObjectId(todoList.itemId) }]
  }

  try {
    const result = await GET_DB()
      .collection(CARD_COLLECTION_NAME)
      .findOneAndUpdate({ _id: new ObjectId(cardId) }, updateCondition, {
        returnDocument: 'after',
        arrayFilters: arrayFilters ? arrayFilters : undefined
      })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const updateFileAttach = async (cardId, fileAttach) => {
  const updateCondition =
    fileAttach.action === 'add'
      ? { $push: { fileAttach: { $each: [fileAttach], $position: 0 } } }
      : { $pull: { fileAttach: { _id: new ObjectId(fileAttach._id) } } }

  try {
    const result = await GET_DB()
      .collection(CARD_COLLECTION_NAME)
      .findOneAndUpdate({ _id: new ObjectId(cardId) }, updateCondition, { returnDocument: 'after' })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

// xử lý cập nhập thêm hoặc xóa member ra khỏi card dựa theo action
// $push để thêm hoặc $pull để loại bỏ (trong mongodb $pull lấy 1 phần tử ra khỏi mảng rồi xóa nó đi)
const updateMembers = async (cardId, inComingMemberInfor) => {
  try {
    const updateCondition =
      inComingMemberInfor.action === CARD_MEMBER_ACTION.ADD
        ? { $push: { memberIds: new ObjectId(inComingMemberInfor.userId) } }
        : { $pull: { memberIds: new ObjectId(inComingMemberInfor.userId) } }

    const result = await GET_DB()
      .collection(CARD_COLLECTION_NAME)
      .findOneAndUpdate({ _id: new ObjectId(cardId) }, updateCondition, { returnDocument: 'after' })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const deleteById = async (cardId) => {
  try {
    const result = await GET_DB()
      .collection(CARD_COLLECTION_NAME)
      .deleteOne({ _id: new ObjectId(cardId) })
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
  deleteManyByColumnId,
  updateComment,
  updateTodoList,
  updateFileAttach,
  updateMembers,
  deleteById
}

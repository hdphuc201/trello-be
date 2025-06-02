import { ObjectId } from 'mongodb'

import { cardModel } from '~/models/cardModel'
import { columnModel } from '~/models/columnModel'

const create = async (reqBody) => {
  try {
    const newCard = {
      ...reqBody
    }

    const createdCard = await cardModel.create(newCard)
    const getNewCard = await cardModel.findOneById(createdCard.insertedId)

    if (getNewCard) {
      // Cập nhật mảng cardOrderIds trong collection boards
      await columnModel.pushCardOrderIds(getNewCard)
    }

    return getNewCard
  } catch (error) {
    throw error
  }
}

// làm theo anh Quân
const update = async (cardId, reqBody, updateObj) => {
  const { commentToAdd, inComingMemberInfor, fileAttach: fileAttachDeleted, todoList, date } = reqBody
  const { cover, fileAttach } = updateObj

  let attachFilesArray = []
  const card = await cardModel.findOneById(cardId)

  try {
    if (date) {
      return await cardModel.update(cardId, {
        date,
        updatedAt: Date.now()
      })
    }

    if (todoList) {
      if (todoList.action === 'add') {
        const newTodolist = {
          ...todoList,
          ...(todoList?._id ? {} : { _id: new ObjectId() })
        }
        todoList._id = new ObjectId()
        return await cardModel.updateTodoList(card._id, newTodolist)
      } else {
        return await cardModel.updateTodoList(card._id, todoList)
      }
    }

    if (commentToAdd) {
      if (commentToAdd.action === 'add') {
        const newComment = {
          ...commentToAdd,
          ...(commentToAdd?._id ? {} : { _id: new ObjectId() }),
          commentedAt: Date.now()
        }
        return await cardModel.updateComment(cardId, newComment)
      } else {
        return await cardModel.updateComment(cardId, commentToAdd)
      }
    }

    if (inComingMemberInfor) {
      return await cardModel.updateMembers(cardId, inComingMemberInfor)
    }

    if (fileAttach) {
      if (fileAttach.action === 'add') {
        const newFileAttach = {
          ...fileAttach,
          ...(fileAttach?._id ? {} : { _id: new ObjectId() })
        }
        return await cardModel.updateFileAttach(card._id, newFileAttach)
      } else {
        return await cardModel.updateFileAttach(card._id, fileAttach)
      }
    }

    const updateData = {
      ...reqBody,
      ...(cover ? { cover } : {}),
      ...(fileAttach ? { fileAttach: attachFilesArray } : {}),
      ...(fileAttachDeleted ? { fileAttach: fileAttachDeleted } : {}),
      updatedAt: Date.now()
    }
    const result = await cardModel.update(cardId, updateData)
    return result
  } catch (error) {
    throw error
  }
}

const deleteCard = async (cardId) => {
  try {
    const deleteCard = await cardModel.deleteById(cardId)
    return deleteCard
  } catch (error) {
    throw error
  }
}
export const cardService = {
  create,
  update,
  deleteCard
}

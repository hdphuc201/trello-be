import { ObjectId } from 'mongodb'

import { cardModel } from '~/models/cardModel'
import { columnModel } from '~/models/columnModel'
import { cloudinaryProvider } from '~/providers/cloudinaryProvider'

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
  const { commentToAdd, inComingMemberInfor, fileAttach: fileAttachDeleted } = reqBody
  const { cover, fileAttach, avatar } = updateObj

  let attachFilesArray = []
  const card = await cardModel.findOneById(cardId)

  if (fileAttach) {
    const updateFileAttach = {
      ...fileAttach,
      ...(fileAttach?._id ? {} : { _id: new ObjectId() })
    }
    if (card.fileAttach) {
      attachFilesArray = [...card.fileAttach, updateFileAttach]
    } else {
      attachFilesArray.push(updateFileAttach)
    }
  }

  try {
    if (commentToAdd) {
      const commentData = {
        ...commentToAdd,
        ...(commentToAdd?._id ? {} : { _id: new ObjectId() }),
        commentedAt: Date.now()
      }
      return await cardModel.pushComment(cardId, commentData)
    }
    if (inComingMemberInfor) {
      return await cardModel.updateMembers(cardId, inComingMemberInfor)
    }
    const updateData = {
      ...reqBody,
      avatar: avatar || null,
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
export const cardService = {
  create,
  update
}

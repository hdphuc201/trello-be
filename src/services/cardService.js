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
const update = async (cardId, reqBody, cover) => {
  const { commentToAdd } = reqBody
  let cardCover

  if (cover && typeof cover === 'object' && 'buffer' in cover) {
    cardCover = await cloudinaryProvider.handleImageUpload(cover.buffer, 'cards')
  } else {
    cardCover = cover || undefined
  }

  try {
    let updatedCard
    if (reqBody.commentToAdd) {
      const commentData = {
        ...commentToAdd,
        ...(commentToAdd?._id ? {} : { _id: new ObjectId() }),
        commentedAt: Date.now()
      }
      updatedCard = await cardModel.pushComment(cardId, commentData)
      return updatedCard
    }
    const updateData = {
      ...reqBody,
      ...(cover ? { cover: cardCover } : {}),
      updatedAt: Date.now()
    }
    updatedCard = await cardModel.update(cardId, updateData)
    return updatedCard
  } catch (error) {
    throw error
  }
}
export const cardService = {
  create,
  update
}

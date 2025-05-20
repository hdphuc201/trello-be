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

const update = async (cardId, reqBody, cardCover) => {
  let cover

  if (cardCover && typeof cardCover === 'object' && 'buffer' in cardCover) {
    cover = await cloudinaryProvider.handleImageUpload(cardCover.buffer, 'cards')
  } else {
    cover = cardCover ? cardCover : undefined
  }
  try {
    const updateData = {
      ...reqBody,
      cover,
      createAt: Date.now()
    }
    const updatedCard = await cardModel.update(cardId, updateData)
    return updatedCard
  } catch (error) {
    throw error
  }
}
export const cardService = {
  create,
  update
}

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


const update = async (cardId, reqBody) => {
  try {

    const updateData = {
      ...reqBody,
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

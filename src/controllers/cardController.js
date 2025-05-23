import { StatusCodes } from 'http-status-codes'

import { cardService } from '~/services/cardService'

const create = async (req, res, next) => {
  try {
    const newCard = await cardService.create(req.body)
    res.status(StatusCodes.CREATED).json(newCard)
  } catch (error) {
    next(error)
  }
}

const update = async (req, res, next) => {
  const cardId = req.params.id
  const cover = req.file || req.body.cover
  try {
    const updatedCard = await cardService.update(cardId, req.body, cover)
    res.status(StatusCodes.CREATED).json(updatedCard)
  } catch (error) {
    next(error)
  }
}
export const cardController = {
  create,
  update
}

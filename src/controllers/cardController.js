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
  const { originalname, type, action } = req.body

  let updateObj = {}

  // cover
  if (req.files?.cover?.[0]) {
    const file = req.files.cover[0]
    updateObj.cover = {
      filename: file.filename,
      originalname: file.originalname
    }
  }
  if (req.body.cover) {
    updateObj.cover = req.body.cover
  }

  //attach file
  if (req.files?.fileAttach?.[0] && action) {
    updateObj.fileAttach = {
      ...req.files.fileAttach[0],
      action
    }
  }

  if ((type, originalname)) {
    updateObj.fileAttach = {
      originalname,
      type,
      action
    }
  }

  try {
    const updatedCard = await cardService.update(cardId, req.body, updateObj)
    res.status(200).json(updatedCard)
  } catch (error) {
    next(error)
  }
}

const deleteCard = async (req, res, next) => {
  const cardId = req.params.id
  try {
    const deleteCard = await cardService.deleteCard(cardId)
    res.status(StatusCodes.OK).json(deleteCard)
  } catch (error) {
    next(error)
  }
}
export const cardController = {
  create,
  update,
  deleteCard
}

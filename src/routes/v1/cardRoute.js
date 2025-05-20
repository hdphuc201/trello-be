import express from 'express'

import { cardController } from '~/controllers/cardController'
import { authMiddleware } from '~/middlewares/authMiddleware'
import { multerUploadMiddleware } from '~/middlewares/multerUploadMiddleware'
import { cardValidation } from '~/validations/cardValidation'

const Router = express.Router()

Router.route('/').post(authMiddleware.authentication, cardValidation.create, cardController.create)
Router.route('/:id').put(
  authMiddleware.authentication,
  multerUploadMiddleware.upload.single('cardCover'),
  cardValidation.update,
  cardController.update
)

export const cardRoute = Router

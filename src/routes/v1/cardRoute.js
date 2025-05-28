import express from 'express'

import { cardController } from '~/controllers/cardController'
import { authMiddleware } from '~/middlewares/authMiddleware'
import { uploadFiles } from '~/middlewares/multerUploadMiddleware'
import { cardValidation } from '~/validations/cardValidation'

const Router = express.Router()

Router.route('/').post(authMiddleware.authentication, cardValidation.create, cardController.create)
Router.route('/:id').put(
  authMiddleware.authentication,
  cardValidation.update,
  uploadFiles,
  cardController.update
)

export const cardRoute = Router

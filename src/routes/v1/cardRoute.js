/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */

import express from 'express'
import { cardController } from '~/controllers/cardController'
import { cardValidation } from '~/validations/cardValidation'

const Router = express.Router()

Router.route('/').post(cardValidation.createNew, cardController.createNew)

export const cardRoute = Router

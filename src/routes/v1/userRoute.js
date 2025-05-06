

import express from 'express'

import { userController } from '~/controllers/userController'
import { userValidation } from '~/validations/userValidation'


const Router = express.Router()

// Router.route('/login').post(userValidation.login, userController.createNew)
Router.route('/register').post(userValidation.createNew, userController.createNew)
Router.route('/login').post(userValidation.createNew, userController.createNew)

export const userRoute = Router

import express from 'express'

import { boardRoute } from './boardRoute'
import { cardRoute } from './cardRoute'
import { columnRoute } from './columnRoute'
import { inviteRoute } from './inviteRoute'
import { requestRoute } from './requestRoute'
import { userRoute } from './userRoute'

const Router = express.Router()

Router.use('/boards', boardRoute)
Router.use('/columns', columnRoute)
Router.use('/cards', cardRoute)
Router.use('/users', userRoute)
Router.use('/invites', inviteRoute)
Router.use('/request-join', requestRoute)

export const APIs_V1 = Router

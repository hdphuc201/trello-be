import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'

import { env } from '~/config/environment'

const generateAccessToken = (user) => {
  return jwt.sign({ _id: user?._id, email: user?.email, jit: uuidv4() },
    env.ACCESS_TOKEN_SECRET,
    { expiresIn: '1h' })
}

const generateRefreshToken = (user) => {
  return jwt.sign({ _id: user?._id, email: user?.email, jit: uuidv4() }, 
    env.REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' })
}

const verifyToken = (token, secretSignature) => {
  return jwt.verify(token, secretSignature)
}
export const jwtService = {
  generateAccessToken,
  generateRefreshToken,
  verifyToken
}

import { StatusCodes } from 'http-status-codes'
import jwt from 'jsonwebtoken'
import ms from 'ms'

import { env } from '~/config/environment'
import { jwtService } from '~/providers/JwtProdiver'
import ApiError from '~/utils/ApiError'

const authentication = async (req, res, next) => {
  console.log('req', req)
  const token = req.cookies?.accessToken
  console.log('token', token)

  if (!token) {
    return next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized (token not found)'))
  }
  jwt.verify(token, env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      const refreshToken = req.cookies?.refreshToken
      if (!refreshToken) {
        return next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized (refresh token not found)'))
      }

      jwt.verify(refreshToken, env.REFRESH_TOKEN_SECRET, (refreshErr, decodedRefresh) => {
        if (refreshErr) {
          return next(new ApiError(StatusCodes.GONE, 'Unauthorized (refresh token expired)'))
        }

        // Tạo access token mới từ thông tin refresh token
        const newAccessToken = jwtService.generateAccessToken(decodedRefresh)

        res.cookie('accessToken', newAccessToken, {
          httpOnly: true,
          secure: true,
          sameSite: 'None',
          maxAge: ms('10 days') // đảm bảo set lại thời gian
        })
        req.user = decodedRefresh
        return next()
      })
      return
    }
    req.user = decoded
    return next()
  })
}

export const authMiddleware = {
  authentication
}

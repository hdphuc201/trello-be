/* eslint-disable no-console */

import { StatusCodes } from 'http-status-codes'
import Joi from 'joi'

import ApiError from '~/utils/ApiError'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

const create = async (req, res, next) => {
  const correctCondition = Joi.object({
    boardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    columnId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    title: Joi.string().required().min(1).max(50).trim().strict()
  })

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    const errorMessage = new Error(error).message
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

const update = async (req, res, next) => {
  const correctCondition = Joi.object({
    title: Joi.string().min(1).max(50).trim().strict(),
    description: Joi.string().optional().allow(''),
    cover: Joi.any().optional().allow(''),
    fileAttach: Joi.any().optional().allow('')
  })

  try {
    // abortEarly (hủy bỏ sớm) :mặc định là true (là nó gặp lỗi tới đâu log ra tới đó) video 52
    // Đối vs trường hợp update, cho phép Unknow để không đẩy 1 số field lên
    await correctCondition.validateAsync(req.body, {
      abortEarly: true,
      allowUnknown: true
    })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

export const cardValidation = {
  create,
  update
}

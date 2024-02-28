/* eslint-disable no-console */
/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */
import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { BOARD_TYPES } from '~/utils/constants'

const createNew = async (req, res, next) => {
  /**
   * - Note: Mặc định chúng ta không cần phải custom message ở phía BE làm gì
   *   vì để cho Frontend tự validate và custom phía FE cho đẹp
   * - Backend chỉ cần validate Đảm Bảo dữ liệu chính xác, và trả về message mặc định từ thư viện là được.
   * - Quan trọng: việc validate dữ liệu BẮC BUỘC phải ở phía Backend vì đây là điểm cuối để lưu trữ dữ liệu vào Database
   * - Và thông thường thực tế, điều tốt nhất cho hệ thống là hãy luôn validate dữ liệu ở BE và FE
   */

  const correctCondition = Joi.object({
    // trim().strict() phải đi chung vs nhau
    title: Joi.string().required().min(3).max(50).trim().strict().messages({
      // custom lỗi
      'any.required': 'Title is required (duyphucdev)',
      'string.empty': 'Title is not allowed to be empty (duyphucdev)',
      'string.min': 'Tối thiểu 3 ký tự',
      'string.max': 'Title length must be less than or equal to 5 characters long (duyphucdev)',
      'string.trim': 'Title kh được có khoảng trắng ở đầu và cuối (duyphucdev)'
    }),
    description: Joi.string().required().min(3).max(256).trim().strict(),
    type: Joi.string().valid(BOARD_TYPES.PUBLIC, BOARD_TYPES.PRIVATE).required()
  })

  try {
    // abortEarly (hủy bỏ sớm) :mặc định là true (là nó gặp lỗi tới đâu log ra tới đó) video 52
    // còn false là nó sẽ log ra hết lỗi 1 lần
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    // Validate hợp lệ, gửi request đi tiếp tới Controller (boardController.createNew file boardRoute line 18)
    next()
    // res.status(StatusCodes.CREATED).json({ message: 'POST from Validation: API create new board' })
  } catch (error) {
    const errorMessage = new Error(error).message
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}
const update = async (req, res, next) => {
  const correctCondition = Joi.object({
    // trim().strict() phải đi chung vs nhau
    title: Joi.string().min(3).max(50).trim().strict(),
    description: Joi.string().min(3).max(256).trim().strict(),
    type: Joi.string().valid(BOARD_TYPES.PUBLIC, BOARD_TYPES.PRIVATE)
  })

  try {
    // abortEarly (hủy bỏ sớm) :mặc định là true (là nó gặp lỗi tới đâu log ra tới đó) video 52
    // Đối vs trường hợp update, cho phép Unknow để không đẩy 1 số field lên
    await correctCondition.validateAsync(req.body, {
      abortEarly: false,
      allowUnknown: true
    })
    next()
  } catch (error) {
    const errorMessage = new Error(error).message
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}
export const boardValidation = {
  createNew,
  update
}

/* eslint-disable no-console */
/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */
import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'

const createNew = async (req, res, next) => {
  /**
   * - Note: Mặc định chúng ta không cần phải custom message ở phía BE làm gì
   *   vì để cho Frontend tự validate và custom phía FE cho đẹp
   * - Backend chỉ cần validate Đảm Bảo dữ liệu chính xác, và trả về message mặc định từ thư viện là được.
   * - Quan trọng: việc validate dữ liệu BẮC BUỘC phải ở phía Backend vì đây là điểm cuối để lưu trữ dữ liệu vào Database
   * - Và thông thường thực tế, điều tốt nhất cho hệ thống là hãy luôn validate dữ liệu ở BE và FE
   */

  const correctCondition = Joi.object({
    title: Joi.string().required().min(3).max(50).trim().strict().messages({
      'any.required': 'Title is required (duyphucdev)',
      'string.empty': 'Title is not allowed to be empty (duyphucdev)',
      'string.min': 'Tối thiểu 3 ký tự',
      'string.max': 'Title length must be less than or equal to 5 characters long (duyphucdev)',
      'string.trim': 'Title kh được có khoảng trắng ở đầu và cuối (duyphucdev)'
    }),
    description: Joi.string().required().min(3).max(256).trim().strict()
  })

  try {
    console.log('req.body', req.body)

    // abortEarly mặc định là true (là nó gặp lỗi tới đâu log ra tới đó) video 52
    // còn false là nó sẽ log ra hết lỗi 1 lần
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    // next()

    res.status(StatusCodes.CREATED).json({ message: 'POST from Validation: API create new board' })
  } catch (error) {
    console.log(error)
    res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
      errors: new Error(error).message
    })
  }
}

export const boardValidation = {
  createNew
}

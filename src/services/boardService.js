/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */

import ApiError from '~/utils/ApiError'
import { slugify } from '~/utils/formatters'

const createNew = async (reqBody) => {
  try {
    // xử lý logic dữ liệu tùy đặc thù dự án
    const newBoard = {
      ...reqBody,
      slug: slugify(reqBody.title)
    }

    // gọi cho tới tầng Model để xử lý lưu bản ghi newBoard vào trong Database
    // ...

    // Làm thêm các xử lý logic khác vs các collection khác tùy đặc thù dự án...
    // Bắn Email, notification về cho admin khi có 1 cái board mới được tạo...

    // trả kết quả về trong Service, luôn phải có return
    return newBoard
  } catch (error) {
    throw new Error(error)
  }
}

export const boardService = {
  createNew
}

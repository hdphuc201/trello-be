import { StatusCodes } from 'http-status-codes'
import { cloneDeep } from 'lodash'

import { boardModel } from '~/models/boardModel'
import { cardModel } from '~/models/cardModel'
import { columnModel } from '~/models/columnModel'
import ApiError from '~/utils/ApiError'
import { DEFAULT_ITEMS_PER_PAGE, DEFAULT_PAGE } from '~/utils/constants'
import { slugify } from '~/utils/formatters'

const createBoard = async (userId, reqBody) => {
  try {
    // xử lý logic dữ liệu tùy đặc thù dự án
    const newBoard = {
      ...reqBody,
      slug: slugify(reqBody.title)
    }

    // gọi cho tới tầng Model để xử lý lưu bản ghi newBoard vào trong Database
    const createdBoard = await boardModel.createBoard(userId, newBoard)

    // lấy bản ghi board sau khi gọi ( tùy mục đích dự án mà có cần bước này hay không)
    const getNewBoard = await boardModel.findOneById(createdBoard.insertedId)

    // Làm thêm các xử lý logic khác vs các collection khác tùy đặc thù dự án...
    // Bắn Email, notification về cho admin khi có 1 cái board mới được tạo...

    // trả kết quả về trong Service, luôn phải có return
    return getNewBoard
  } catch (error) {
    throw new Error(error)
  }
}

const getBoards = async (userId, page, itemsPerPage) => {
  try {
    if (!page) page = DEFAULT_PAGE
    if (!itemsPerPage) itemsPerPage = DEFAULT_ITEMS_PER_PAGE

    // +page và +itemsPerPage luôn ép về kiểu Number
    const boards = await boardModel.getBoards(userId, +page, +itemsPerPage)
    return boards
  } catch (error) {
    throw new Error(error)
  }
}
const getDetails = async (userId, boardId) => {
  try {
    // gọi cho tới tầng Model để xử lý lưu bản ghi newBoard vào trong Database
    const board = await boardModel.getDetails(userId,boardId)

    // board == null
    if (!board) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found')
    }

    // B1: Deep clone board ra một cái mới để xử lý, không ảnh hưởng tới board ban đầu, tùy mục đích về sau mà có cần
    // clone deep hay kh (video 63 giải thích)
    // https://www.javascripttutorial.net/javascript-primitive-vs-reference-values/
    const resBoard = cloneDeep(board)

    // B2: Đưa card về đúng column của nó
    resBoard.columns.forEach((column) => {
      // logic chỗ này hay nha
      // phải toString rồi mới so sánh (vì nó đang ở dạng ObjectId (check trong MongoDB Compass))
      // C1: Cách đơn giản hơn là conver ObjectId về string bằng hàm toString() của JavaScipt
      column.cards = resBoard.cards.filter((card) => card.columnId.toString() === column._id.toString())

      // C2: Cách dùng equals này là bởi vì chúng ta hiểu ObjectId trong MongoDB có support method .equals
      // column.cards = resBoard.cards.filter(card => card.columnId.equals(column._id))
    })

    // B3: xóa mảng cards khỏi board ban đầu
    delete resBoard.cards

    // trả kết quả về trong Service, luôn phải có return
    return resBoard
  } catch (error) {
    throw new Error(error)
  }
}

const update = async (boardId, reqBody) => {
  try {
    const updateData = {
      ...reqBody,
      updateAt: Date.now()
    }
    // gọi cho tới tầng Model để xử lý lưu bản ghi newBoard vào trong Database
    const updatedBoard = await boardModel.update(boardId, updateData)

    // trả kết quả về trong Service, luôn phải có return
    return updatedBoard
  } catch (error) {
    throw new Error(error)
  }
}
const moveCardToDifferentColumn = async (reqBody) => {
  try {
    // B1: Cập nhật mảng cardOrderIds của Column ban đầu chứa nó (hiểu bản chất là xóa đi _id của Card ra khỏi mảng)
    await columnModel.update(reqBody.prevColumnId, {
      cardOrderIds: reqBody.prevCardOrderIds,
      updateAt: Date.now()
    })
    // B2: Cập nhật mảng cardOrderIds của Column tiếp theo (hiểu bản chất là thêm _id của Card vào mảng)
    await columnModel.update(reqBody.nextColumnId, {
      cardOrderIds: reqBody.nextCardOrderIds,
      updateAt: Date.now()
    })
    // B3: Cập nhật lại trường columnId mới của cái card đã kéo
    await cardModel.update(reqBody.currentCardId, {
      columnId: reqBody.nextColumnId
    })

    return {
      updateResult: 'Successfully'
    }
    // eslint-disable-next-line no-unreachable
  } catch (error) {
    throw new Error(error)
  }
}
export const boardService = {
  getBoards,
  createBoard,
  getDetails,
  update,
  moveCardToDifferentColumn
}

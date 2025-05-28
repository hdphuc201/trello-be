import { StatusCodes } from 'http-status-codes'

import { boardModel } from '~/models/boardModel'
import { inviteModel } from '~/models/inviteModel'
import { userModel } from '~/models/userModel'
import ApiError from '~/utils/ApiError'
import { BOARD_INVITATION_STATUS, INVITATION_TYPES } from '~/utils/constants'
import { pickUser } from '~/utils/formatters'

const inviteUserToBoard = async (reqBody, inviterId) => {
  const { inviteeEmail, boardId } = reqBody
  // 1. Người gửi lời mời: là người đang request, nên chúng ta tìm theo id lấy từ token
  const inviter = await userModel.findOneById(inviterId)

  // 2. Người được mời: gửi email từ phía FE
  const invitee = await userModel.findOneByEmail(inviteeEmail)

  // 3. Tìm board mà người đó gửi lời mời vào
  const board = await boardModel.findOneById(boardId)

  // Nếu không tồn tại 1 trong 3 thì chúng ta thẳng tay reject
  if (!invitee || !inviter || !board) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Inviter, Invitee or Board not found!')
  }

  // Tạo data cần thiết để lưu vào trong DB
  // gồm các thứ như là: loại type, boardInvitation, status để test xem Model validate ok chưa.
  const newInvitationData = {
    inviterId,
    inviteeId: invitee._id.toString(), // chuyển từ ObjectId về String vì sang bên Model có check lại ở hàm create
    type: INVITATION_TYPES.BOARD_INVITATION,
    boardInvitation: {
      boardId: board._id.toString(),
      status: BOARD_INVITATION_STATUS.PENDING // default status
    }
  }
  // Gọi sang Model để lưu vào DB
  const createdInvitation = await inviteModel.createNewBoardInvitation(newInvitationData)
  const getInvitation = await inviteModel.findOneById(createdInvitation.insertedId.toString())

  // Ngoài thông tin của cái board invitation mới tạo thì trả về đủ cả luôn board, inviter, invitee cho FE thoải mái xử lý.
  const resInvitation = {
    ...getInvitation,
    board,
    inviter: pickUser(inviter),
    invitee: pickUser(invitee)
  }

  return resInvitation
}

const getInvitationsForInvitee = async (userId) => {
  // 1. Tìm board mà người đó gửi lời mời vào
  const invitations = await inviteModel.findInvitationsByInvitee(userId)
  // 2. Nếu không tồn tại thì trả về empty array
  if (!invitations) {
    return []
  }
  const resInvitations = invitations.map((invitation) => {
    return {
      ...invitation,
      board: invitation.board[0] || {},
      inviter: invitation.inviter[0] || {},
      invitee: invitation.inviter[0] || {}
    }
  })

  return resInvitations
}
const update = async (userId, status, invitationId) => {
  let Invitations = await inviteModel.findOneById(invitationId)
  // 2. Nếu không tồn tại thì trả về empty array
  if (!Invitations) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Invitation not found!')
  }

  const boardId = Invitations.boardInvitation.boardId
  const board = await boardModel.findOneById(boardId)

  if (!board) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found!')
  }
  const idOwnerAndMember = [...board.memberIds, ...board.ownerIds].toString()

  // nếu user nhấn accepct thì status sẽ là ACCEPTED
  // nếu user nhấn reject thì status sẽ là REJECTED
  // nếu user nhấn accept mà đã có trong mảng memberIds thì sẽ báo lỗi
  if (status === BOARD_INVITATION_STATUS.ACCEPTED && idOwnerAndMember.includes(userId)) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User already in board!')
  }

  const updateData = {
    board,
    boardInvitation: {
      ...Invitations.boardInvitation,
      status: status
    }
  }
  // cập nhật status trong bảng ghi
  const updateInvitation = await inviteModel.update(invitationId, updateData)

  if (updateInvitation.boardInvitation.status === BOARD_INVITATION_STATUS.ACCEPTED) {
    await boardModel.pushToBoard({
      type: 'memberIds',
      boardId: Invitations.boardInvitation.boardId,
      userId: Invitations.inviteeId
    })
  }
  return updateInvitation
}

const deleteInvite = async (userId) => {
  // 1. Tìm invitation theo inviteeId
  const result = await inviteModel.deleteInvitesByInvitee(userId)
  return result
}

export const inviteService = {
  getInvitationsForInvitee,
  update,
  deleteInvite,
  inviteUserToBoard
}

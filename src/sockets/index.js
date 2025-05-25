export const inviteToBoard = (socket) => {
  socket.on('invite_to_board', (invitation) => {
    socket.broadcast.emit('invite_to_board', invitation) // gửi lời mời đến tất cả client khác trừ client đã gửi lời mời
  })
}

export const userJoinBoard = (socket) => {
  socket.on('user_join_board', ({ boardId, user }) => {
    if (!boardId || !user?._id) return
    socket.join(boardId) // join room để sau này nhận các event của board này
    socket.to(boardId).emit('user_join_board', user) // Gửi cho tất cả user khác trong board biết là user mới vừa vào
  })
}
export const userLeaveBoard = (socket) => {
  socket.on('user_leave_board', ({ boardId, user }) => {
    socket.to(boardId).emit('user_leave_board', user)// Gửi cho các user khác biết trước khi leave
    socket.leave(boardId)
  })
}

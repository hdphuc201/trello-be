import { env } from '~/config/environment'

// Những domain được phép truy cập tới tài nguyên của server
export const WHITELIST_DOMAINS = ['http://localhost:3000', 'https://hdphuc-trello.vercel.app']

export const BOARD_TYPES = {
  PUBLIC: 'public',
  PRIVATE: 'private'
}

export const WEBSITE_DOMAIN =
  env.BUILD_MODE === 'production' ? env.WEBSITE_DOMAIN_PRODUCTION : env.WEBSITE_DOMAIN_DEVELOPMENT

export const DEFAULT_PAGE = 1
export const DEFAULT_ITEMS_PER_PAGE = 12

export const INVITATION_TYPES = {
  BOARD_INVITATION: 'BOARD_INVITATION',
  BOARD_REQUEST_JOIN: 'BOARD_REQUEST_JOIN'
}

export const BOARD_INVITATION_STATUS = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED'
}

export const CARD_MEMBER_ACTION = {
  ADD: 'ADD',
  REMOVE: 'REMOVE'
}

export const USER_ROLES = {
  CLIENT: 'client',
  ADMIN: 'admin'
}

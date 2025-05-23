// config/cloudinary.js

import { v2 as cloudinary } from 'cloudinary'
import streamifier from 'streamifier'

import { env } from '~/config/environment'

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET
})

const handleImageUpload = (fileBuffer, folder) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream({ folder }, (error, result) => {
      if (error) return reject(error)
      resolve(result.secure_url)
    })

    streamifier.createReadStream(fileBuffer).pipe(uploadStream)
  })
}
export const cloudinaryProvider = { handleImageUpload }


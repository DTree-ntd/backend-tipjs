'use strict'

const keytokenModel = require("../models/keytoken.model")
const { Types } = require('mongoose')

class KeyTokenService {
  static createKeyToken = async ({ userId, publicKey, privateKey, refreshToken }) => {
    try {
      const filter = { user: userId }
      const update = { publicKey, privateKey, refreshTokensUsed: [], refreshToken }
      const options = { upsert: true, new: true }

      const tokens = await keytokenModel.findOneAndUpdate(filter, update, options)

      return tokens ? tokens.publicKey : null
    } catch (error) {
      return error
    }
  }

  static findByUserId = async (userId) => {
    return await keytokenModel.findOne({user: Types.ObjectId(userId)}).lean()
  }

  static removeKeyById = async (id) => {
    return await keytokenModel.remove(id)
  }
}

module.exports = KeyTokenService
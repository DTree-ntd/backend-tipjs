'use strict'

const shopModel = require("../models/shop.model")
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const KeyTokenService = require("./keyToken.service")
const { createTokenPair } = require("../auth/authUtils")
const { getInfoData } = require("../utils")
const { BadRequestError, AuthFailureError } = require("../core/error.response")

const { findByEmail } = require('./shop.service')

const RoleShop = {
  SHOP: 'SHOP',
  WRITER: 'WRITER',
  EDITOR: 'EDITOR',
  ADMIN: 'ADMIN'
}

class AccessService {
  static signUp = async ({ name, email, password }) => {
      const holderShop = await shopModel.findOne({email}).lean()
      if (holderShop) {
        throw new BadRequestError('Error: shop already registered!')
      }

      const passwordHash = await bcrypt.hash(password, 10)

      const newShop = await shopModel.create({
        name, 
        email,
        password: passwordHash, 
        roles: [RoleShop.SHOP]
      })

      if (newShop) {
        // create privateKey, publicKey
        const privateKey =  crypto.randomBytes(64).toString('hex')
        const publicKey =  crypto.randomBytes(64).toString('hex')

        // save collection KeyStore
        const keyStore = await KeyTokenService.createKeyToken({
          userId: newShop._id,
          publicKey,
          privateKey
        })

        if (!keyStore) {
          throw new BadRequestError('Error: keyStore error')
        }

        // create token pair
        const tokens = await createTokenPair({userId: newShop._id, email}, publicKey, privateKey)

        return {
          code: 201,
          metadata: {
            shop: getInfoData({ fields: ['_id', 'name', 'email'], object: newShop }),
            tokens
          }
        }
      }

      return {
        code: 200,
        metadata: null
      }
  }

  static login = async ({ email, password, refreshToken = null }) => {
    const foundShop = await findByEmail({ email })
    if(!foundShop) throw new BadRequestError('Shop not exist')

    const match = await bcrypt.compare(password, foundShop.password)
    if(!match) throw new AuthFailureError('Authentication error')

    const privateKey =  crypto.randomBytes(64).toString('hex')
    const publicKey =  crypto.randomBytes(64).toString('hex')


    const tokens = await createTokenPair({ userId: foundShop._id, email}, publicKey, privateKey )
    await KeyTokenService.createKeyToken( {userId: foundShop._id, refreshToken: tokens.refreshToken, publicKey, privateKey })

    return {
      shop: getInfoData({ fields: ['_id', 'name', 'email'], object: foundShop }),
      tokens
    }
  }

  static logout = async(keyStore) => {
    return await KeyTokenService.removeKeyById(keyStore._id)
  }
}

module.exports = AccessService
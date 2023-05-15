'use strict'

const shopModel = require("../models/shop.model")
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const KeyTokenService = require("./keyToken.service")
const { createTokenPair } = require("../auth/authUtils")
const { getInfoData } = require("../utils")
const { BadRequestError } = require("../core/error.response")

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
        console.log(`Create token success`, tokens);

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
}

module.exports = AccessService
"use strict"

const { findById } = require("../models/apikey.model")

const HEADER = {
  API_KEY: 'x-api-key',
  AUTHORIZATION: 'authorization'
}

const apiKey = async (req, res, next) => {
  try {
    const key = req.header[HEADER.API_KEY]?.toString()

    if(!key) {
      return res.status(403).json({
        message: 'Forbidden Error'
      })
    }

    // check objKey
    const objKey = await findById(key)

    if (!objKey) {
      return res.status(403).json({
        message: 'Forbidden Error'
      })
    }

    req.objKey = objKey
    return next()
  } catch (error) {
    return error
  }
}

const permission = (permission) => {
  return (req, res, next) => {
    if(!req.objKey.permission) {
      return res.status(403).json({
        message: 'Permission Denied'
      })
    }

    console.log(`permission::`, permission);
    const validPermission = req.objKey.permissions.includes(permission)

    if (!validPermission) {
      return res.status(403).json({
        message: 'Permission Denied'
      })
    }

    return next()
  }
}

module.exports = {
  apiKey,
  permission
}
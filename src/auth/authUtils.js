'use strict'

const JWT = require('jsonwebtoken')

const createTokenPair = async ( payload, publicKey, privateKey ) => {
  try {
    console.log(`==============publicKey`, publicKey);
    console.log(`==============privateKey`, privateKey);
    // accessToken
    const accessToken = await JWT.sign( payload, privateKey, {
      expiresIn: '2 days',
      algorithm: 'RS256'
    })

    const refreshToken = await JWT.sign( payload, privateKey, {
      expiresIn: '7 days',
      algorithm: 'RS256'
    })

    console.log(`==============accessToken`, accessToken);
    console.log(`==============refreshToken`, refreshToken);

    JWT.verify( accessToken, publicKey, (err, decode) => {
      if(err){
        console.error(`error verify::`, err)
      } else{
        console.log(`decode verify::`, decode)
      }
    })

    return { accessToken, refreshToken}
  } catch (error) {
    console.log(`==========error`, error);
  }
}

module.exports = {
    createTokenPair
}
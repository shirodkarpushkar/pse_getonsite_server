import jwt from 'jsonwebtoken';
import CryptoJS from 'crypto-js';

const config = process.env;

export const tokenEncrypt = async (data) => {
  const token = await jwt.sign(
    {
      data: data
    },
    config.TOKEN_KEY,
    {
      expiresIn: 60 * 60 * 24
    }
  ); // Expires in 60 minutes

  return token;
};

export const tokenEncryptWithExpiry = async (data, expiry) => {
  const token = await jwt.sign(
    {
      data: data
    },
    config.TOKEN_KEY,
    {
      expiresIn: expiry
    }
  ); // Expires in 60 minutes

  return token;
};

export const tokenEncryptWithoutExpiry = async (data) => {
  const token = await jwt.sign(
    {
      data: data
    },
    config.TOKEN_KEY
  ); // never expires

  return token;
};

export const tokenDecrypt = async (data) => {
  try {
    const decode = await jwt.verify(data, config.TOKEN_KEY);

    return decode;
  } catch (error) {
    return error;
  }
};

export const decryptData = (data) => {
  const decrypted = CryptoJS.AES.decrypt(data, config.cryptokey);

  if (decrypted) {
    const userinfo = JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));

    return userinfo;
  } else {
    return {
      userinfo: {
        error: 'Please send proper token'
      }
    };
  }
};

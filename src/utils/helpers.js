import jwt from 'jsonwebtoken';
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

export const sendToken = (user, statusCode, message, res) => {
  const token = user.generateJWT();
  res
    .status(statusCode)
    .cookie("token", token, {
      expires: new Date(
        Date.now() +
          parseInt(process.env.COOKIE_EXPIRE, 10) * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
    })
    .json({
      success: true,
      message,
      user,
      token,
    });
};

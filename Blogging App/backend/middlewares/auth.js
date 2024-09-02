import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { UserModel } from "../models/userSchema.js";
import jwt from "jsonwebtoken";

// CHECK FOR AUTHENTICATED
export const isAuthenticated = catchAsyncErrors(async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return next(new ErrorHandler("User Is Not Authenticated!", 400));

  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

  req.user = await UserModel.findById(decoded.id);

  next();
});

// AUTHORIZATION
export const isAuthorized = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(
          `User with Role ${req.user.role} is Not Allowed to Access This Resource`,
          400
        )
      );
    }
    next();
  };
};

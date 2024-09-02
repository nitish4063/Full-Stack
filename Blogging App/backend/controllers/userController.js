import cloudinary from "cloudinary";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { UserModel } from "../models/userSchema.js";
import { sendToken } from "../utils/jwtToken.js";

// REGISTER A NEW USER || SIGNUP
export const register = catchAsyncErrors(async (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0)
    return next(new ErrorHandler("User Avatar Required!", 400));

  const { avatar } = req.files;
  const allowedFormats = ["image/png", "image/jpeg", "image/webp"];

  if (!allowedFormats.includes(avatar.mimetype))
    return next(new ErrorHandler("Please Provide A Valid Image Format!", 400));

  const { name, email, phone, education, role, password } = req.body;
  if (!name || !email || !phone || !education || !role || !password || !avatar)
    return next(new ErrorHandler("Please Fill Full Form", 400));

  const user = await UserModel.findOne({ email });
  if (user) return next(new ErrorHandler("User Already Exists", 400));

  const cloudinaryResponse = await cloudinary.uploader.upload(
    avatar.tempFilePath
  );

  if (!cloudinaryResponse || cloudinaryResponse.error)
    console.error(
      "Cloudinary Error: ",
      cloudinaryResponse.error || "Unknown Cloudinary Error!"
    );

  const newUser = await UserModel.create({
    name,
    email,
    phone,
    education,
    role,
    password,
    avatar: {
      public_id: cloudinaryResponse.public_id,
      url: cloudinaryResponse.secure_url,
    },
  });

  sendToken(newUser, 200, `A New ${role} Registered Successfully!`, res);
});

// LOGIN A USER
export const login = catchAsyncErrors(async (req, res, next) => {
  const { email, role, password } = req.body;
  if (!email || !role || !password)
    return next(new ErrorHandler("Please Fill Full Form", 400));

  const user = await UserModel.findOne({ email }).select("+password");
  if (!user) return next(new ErrorHandler("Invalid Email or Password!", 400));

  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched)
    return next(new ErrorHandler("Invalid Email or Password!", 400));

  if (user.role !== role)
    return next(new ErrorHandler(`User With ${role} Role Not Found!`, 400));

  sendToken(user, 200, `${role} Logged In Successfully!`, res);
});

// LOGOUT
export const logout = catchAsyncErrors((req, res, next) => {
  res
    .status(200)
    .cookie("token", "", {
      expires: new Date(Date.now()),
      httpOnly: true,
    })
    .json({
      success: true,
      message: "User LogOut Successfully!",
    });
});

// GET THE PROFILE OF USER WHO IS LOGGED IN
export const getMyProfile = catchAsyncErrors((req, res, next) => {
  const user = req.user;

  res.status(200).json({
    success: true,
    user,
  });
});

// GET DATA OF ALL AUTHORS
export const getAllAuthors = catchAsyncErrors(async (req, res, next) => {
  const allAuthors = await UserModel.find({ role: "Author" });
  res.status(200).json({
    success: true,
    allAuthors,
  });
});

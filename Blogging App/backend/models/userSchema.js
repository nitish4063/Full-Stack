import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minLength: [3, "Name Must Contain Atleast 3 Characters"],
    maxLength: [15, "Name Cannot Exceed 15 Characters"],
  },
  email: {
    type: String,
    required: true,
    validate: [validator.isEmail, "Please Provide A Valid Email"],
  },
  phone: {
    type: Number,
    required: true,
  },
  avatar: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  education: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
    enum: ["Reader", "Author"],
  },
  password: {
    type: String,
    required: true,
    minLength: [8, "Password Must Contain Atleast 8 Characters"],
    maxLength: [15, "Password Cannot Exceed 15 Characters"],
    select: false,
  },
  createdOn: {
    type: Date,
    default: Date.now(),
  },
});

// HASHING THE PASSWORD BEFORE SAVING IN THE DATABASE
userSchema.pre("save", async function () {
  if (!this.isModified("password")) next();

  this.password = await bcrypt.hash(this.password, 10);
});

// VALIDATING THE PASSWORD ENTERED BY USER WITH THE ACTUAL PASSWORD
// IT WILL EITHER RETURN TRUE OR FALSE
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// GENERATE JWT WHILE SIGNUP
userSchema.methods.generateJWT = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES,
  });
};

export const UserModel = mongoose.model("UserModel", userSchema);

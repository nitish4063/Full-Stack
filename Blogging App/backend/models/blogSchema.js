import mongoose from "mongoose";
import validator from "validator";

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    minLength: [10, "Blog Title Must Contain Atleast 10 Characters"],
    maxLength: [30, "Blog Title Cannot Exceed 30 Characters"],
  },
  mainImage: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  intro: {
    type: String,
    required: true,
    minLength: [250, "Blog Intro Must Contain Atleast 250 Characters"],
  },

  paraOneImage: {
    public_id: {
      type: String,
    },
    url: {
      type: String,
    },
  },
  paraOneDescription: {
    type: String,
    minLength: [100, "Description Must Contain Atleast 100 Characters"],
  },
  paraOneTitle: {
    type: String,
    minLength: [50, "Title Must Contain Atleast 50 Characters"],
  },

  paraTwoImage: {
    public_id: {
      type: String,
    },
    url: {
      type: String,
    },
  },
  paraTwoDescription: {
    type: String,
    minLength: [100, "Description Must Contain Atleast 100 Characters"],
  },
  paraTwoTitle: {
    type: String,
    minLength: [50, "Title Must Contain Atleast 50 Characters"],
  },

  category: {
    type: String,
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: "UserModel",
    required: true,
  },

  authorName: {
    type: String,
    required: true,
  },
  authorAvatar: {
    type: String,
    required: true,
  },

  published: {
    type: Boolean,
    default: false,
  },
});

export const BlogModel = mongoose.model("BlogModel", blogSchema);

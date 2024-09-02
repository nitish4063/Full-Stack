import cloudinary from "cloudinary";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { UserModel } from "../models/userSchema.js";
import { BlogModel } from "../models/blogSchema.js";
import { sendToken } from "../utils/jwtToken.js";

// CREATE A NEW BLOG
export const blogPost = catchAsyncErrors(async (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0)
    return next(new ErrorHandler("Blog Main Image is Mandatory!", 400));

  const { mainImage, paraOneImage, paraTwoImage } = req.files;
  if (!mainImage)
    return next(new ErrorHandler("Blog Main Image is Mandatory!", 400));

  const allowedFormats = ["image/png", "image/jpeg", "image/webp"];
  if (
    !allowedFormats.includes(mainImage.mimetype) ||
    (paraOneImage && !allowedFormats.includes(paraOneImage.mimetype)) ||
    (paraTwoImage && !allowedFormats.includes(paraTwoImage.mimetype))
  )
    return next(new ErrorHandler("Please Provide A Valid Image Format!", 400));

  const {
    title,
    intro,
    paraOneDescription,
    paraOneTitle,
    paraTwoDescription,
    paraTwoTitle,
    category,
    published,
  } = req.body;

  const user = req.user;

  const createdBy = user._id;
  const authorName = user.name;
  const authorAvatar = user.avatar.url;

  if (!title || !intro || !category)
    return next(new ErrorHandler("Please Fill Full Form!", 400));

  const uploadPromises = [
    cloudinary.uploader.upload(mainImage.tempFilePath),
    paraOneImage
      ? cloudinary.uploader.upload(paraOneImage.tempFilePath)
      : Promise.resolve(null),
    paraTwoImage
      ? cloudinary.uploader.upload(paraTwoImage.tempFilePath)
      : Promise.resolve(null),
  ];

  const [mainImageRes, paraOneImageRes, paraTwoImageRes] = await Promise.all(
    uploadPromises
  );

  if (
    !mainImageRes ||
    mainImageRes.error ||
    (paraOneImage && (!paraOneImageRes || paraOneImageRes.error)) ||
    (paraTwoImageRes && (!paraTwoImageRes || paraTwoImageRes.error))
  )
    return next(
      new ErrorHandler("Error Occured While Uploading One or More Images!", 500)
    );

  const blogData = {
    title,
    intro,
    category,
    published,
    paraOneDescription,
    paraOneTitle,
    paraTwoDescription,
    paraTwoTitle,
    createdBy,
    authorName,
    authorAvatar,
    mainImage: {
      public_id: mainImageRes.public_id,
      url: mainImageRes.secure_url,
    },
  };

  if (paraOneImageRes) {
    blogData.paraOneImage = {
      public_id: paraOneImageRes.public_id,
      url: paraOneImageRes.secure_url,
    };
  }

  if (paraTwoImageRes) {
    blogData.paraTwoImage = {
      public_id: paraTwoImageRes.public_id,
      url: paraTwoImageRes.secure_url,
    };
  }

  const blog = await BlogModel.create(blogData);
  res.status(200).json({
    success: "true",
    message: "Blog Uploaded!",
    blog,
  });
});

// DELETING A BLOG
export const deleteBlog = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  const blog = await BlogModel.findById(id);
  if (!blog) return next(new ErrorHandler("Blog Not Found!", 404));

  //   await BlogModel.deleteOne(id);
  await blog.deleteOne();

  res.status(200).json({
    success: true,
    message: "Blog Deleted!",
  });
});

// GET ALL BLOGS
export const getAllBlogs = catchAsyncErrors(async (req, res, next) => {
  const allBlogs = await BlogModel.find({ published: true });

  res.status(200).json({
    success: true,
    allBlogs,
  });
});

// GET A SINGLE BLOG
export const getSingleBlog = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const blog = await BlogModel.findById(id);
  if (!blog) return next(new ErrorHandler("Blog Does not Exists!", 404));

  res.status(200).json({
    success: true,
    blog,
  });
});

// GET BLOGS CREATED BY ME
export const getMyBlogs = catchAsyncErrors(async (req, res, next) => {
  const createdBy = req.user._id;
  const blogs = await BlogModel.find({ createdBy });

  res.status(200).json({
    success: true,
    blogs,
  });
});

// UPDATE A BLOG
export const updateBlog = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  let blog = BlogModel.findById(id);
  if (!blog) return next(new ErrorHandler("Blog Not Found!", 404));

  const newBlogData = {
    title: req.body.title,
    intro: req.body.intro,
    category: req.body.category,
    paraOneTitle: req.body.paraOneTitle,
    paraOneDescription: req.body.paraOneDescription,
    paraTwoTitle: req.body.paraTwoTitle,
    paraTwoDescription: req.body.paraTwoDescription,
    published: req.body.published,
  };

  if (req.files) {
    const { mainImage, paraOneImage, paraTwoImage } = req.files;
    const allowedFormats = ["image/png", "image/jpeg", "image/webp"];
    if (
      (mainImage && !allowedFormats.includes(mainImage.mimetype)) ||
      (paraOneImage && !allowedFormats.includes(paraOneImage.mimetype)) ||
      (paraTwoImage && !allowedFormats.includes(paraTwoImage.mimetype))
    )
      return next(new ErrorHandler("Please Provide A Valid Image Format", 400));

    if (req.files && mainImage) {
      const blogMainImageId = blog.mainImage.public_id;
      await cloudinary.uploader.destroy(blogMainImageId);
      const newBlogMainImage = await cloudinary.uploader.upload(
        mainImage.tempFilePath
      );
      newBlogData.mainImage = {
        public_id: newBlogMainImage.public_id,
        url: newBlogMainImage.secure_url,
      };
    }

    if (req.files && paraOneImage) {
      if (blog.paraOneImage) {
        const blogParaOneImageId = blog.paraOneImage.public_id;
        await cloudinary.uploader.destroy(blogParaOneImageId);
      }
      const newBlogParaOneImage = await cloudinary.uploader.upload(
        paraOneImage.tempFilePath
      );
      newBlogData.paraOneImage = {
        public_id: newBlogParaOneImage.public_id,
        url: newBlogParaOneImage.secure_url,
      };
    }

    if (req.files && paraTwoImage) {
      if (blog.paraTwoImage) {
        const blogParaTwoImageId = blog.paraTwoImage.public_id;
        await cloudinary.uploader.destroy(blogParaTwoImageId);
      }
      const newBlogParaTwoImage = await cloudinary.uploader.upload(
        paraTwoImage.tempFilePath
      );
      newBlogData.paraTwoImage = {
        public_id: newBlogParaTwoImage.public_id,
        url: newBlogParaTwoImage.secure_url,
      };
    }
  }

  blog = await BlogModel.findByIdAndUpdate(id, newBlogData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    message: "Blog Updated!",
    blog,
  });
});

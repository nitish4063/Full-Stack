class ErrorHandler extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const errorMiddleware = (err, req, res, next) => {
  err.message = err.message || "INTERNAL SERVER ERROR";
  err.statusCode = err.statusCode || 500;

  // UNABLE TO CONNECT TO DATABASE OR TYPE OF DATA PROVIDED DOES NOT MATCH WITH REQUIRED TYPE
  if (err.name === "CastError") {
    const message = `Invalid Resource Not Found: ${err.path}`;
    err = new ErrorHandler(message, 404);
  }

  return res.status(err.statusCode).json({
    success: false,
    message: err.message,
    testing: "Hello from Error Middleware",
  });
};

export default ErrorHandler;

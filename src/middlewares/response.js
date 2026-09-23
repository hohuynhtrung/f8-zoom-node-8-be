const responseMiddleware = (req, res, next) => {
  res.success = (data = null, status = 200, message = "Success") => {
    return res.status(status).json({
      status: "success",
      message,
      data,
    });
  };

  res.error = (
    message = "Internal Server Error",
    status = 500,
    errors = null,
  ) => {
    return res.status(status).json({
      status: "error",
      message,
      errors,
    });
  };
  next();
};

module.exports = responseMiddleware;

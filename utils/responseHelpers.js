const sendError = (res, message = "حدث خطأ غير متوقع", status = 500) => {
  return res.status(status).json({ message });
};

module.exports = { sendError };

//backend\utils\imagekit.js
const ImageKit = require("imagekit");

const imagekit = new ImageKit({
  publicKey: "public_jDYvxg7atHgKBiE7QaFF2k/jZj4=",
  privateKey: "private_TDYqLT1KjOUtOSpdKqtTBcO2tVw=",
  urlEndpoint: "https://ik.imagekit.io/idbeilkk4"
});

module.exports = imagekit;

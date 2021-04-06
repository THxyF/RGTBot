const fs = require("fs");
const fetch = require("node-fetch");
const post = require("../func/post.js");

exports.cMain = async function cMain(arg, msg) {
  let text = fs.readFileSync("./text/cmdHelp.txt", "utf8");

  post.post(text, msg.channel);
  
  return 0;
};

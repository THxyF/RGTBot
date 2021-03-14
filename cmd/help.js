const fs = require("fs");
const fetch = require("node-fetch");
exports.cMain = async function cMain(arg, msg) {
  let text = fs.readFileSync("./text/cmdHelp.txt", "utf8");

  while (text.length >= 1800) {
    msg.channel.send(text.slice(0, 1800));
    text = text.slice(1800, text.length);
  }
  msg.channel.send(text);
  
  return 0;
};

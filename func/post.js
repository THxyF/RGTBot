const consts = require("../func/const.js");
const fs = require("fs");

exports.post = (src, ch) => {
  let text = fs.readFileSync(src, "utf8");

  while (text.length >= 1900) {
    ch.send(text.slice(0, 1900));
    text = text.slice(1900, text.length);
  }
  ch.send(text);

  return 0;
};

exports.edit = (src, msg) => {
  let text = fs.readFileSync(src, "utf8");

  if(text.length >= 2000) throw "too Long Src:" + text.length;
  else msg.edit(text).then(m => console.log(m.content)).catch(err => {throw err});

  return 0;
}
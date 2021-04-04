const fetch = require("node-fetch");
const post = require("../func/post.js");

exports.cMain = async function cMain(arg, msg) {
  const lang = encodeURIComponent(arg.shift());
  const word = encodeURIComponent(arg.join(" "));
  const url = `https://${lang}.wikipedia.org/w/index.php?search=${word}`;
  post.post(url, msg.channel);
};

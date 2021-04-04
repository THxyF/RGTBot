const fetch = require("node-fetch");
const post = require("../func/post.js");

exports.cMain = async function cMain(arg, msg) {
  let text = encodeURIComponent(arg[0]);

  for (let i = 1; i < arg.length; ++i) text += "+" + encodeURIComponent(arg[i]);

  post.post(`https://www.google.com/search?q=${text}`, msg.channel);
};

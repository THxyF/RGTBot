const fetch = require("node-fetch");
exports.cMain = async function cMain(arg, msg) {
  let text = encodeURIComponent(arg[0]);

  for (let i = 1; i < arg.length; ++i) text += "+" + encodeURIComponent(arg[i]);

  msg.channel.send(`https://www.google.com/search?q=${text}`);
};

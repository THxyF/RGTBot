const fetch = require("node-fetch");
exports.cMain = async function cMain(arg, msg) {
  const lang = encodeURIComponent(arg.shift());
  const word = encodeURIComponent(arg.join(" "));
  const url = `https://${lang}.wikipedia.org/w/index.php?search=${word}`;
  msg.channel.send(url);
};

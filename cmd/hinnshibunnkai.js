const fetch = require("node-fetch");
const util = require("../func/util.js");
const post = require("../func/post.js");

const appId = "dj00aiZpPVIxQlhNY0xKbUhDbiZzPWNvbnN1bWVyc2VjcmV0Jng9NmE-"

exports.cMain = async function cMain(arg, msg) {
  let req = `https://jlp.yahooapis.jp/MAService/V1/parse?appid=${appId}&results=ma&sentence=${encodeURIComponent(arg[0])}`
  
  let content = await fetch(req).then(res => res.text());
  
  post.post(content, msg.channel);
};

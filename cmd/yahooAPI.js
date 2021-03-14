const fetch = require("node-fetch");
const util = require("../func/util.js");

const appId = "dj00aiZpPVIxQlhNY0xKbUhDbiZzPWNvbnN1bWVyc2VjcmV0Jng9NmE-"

exports.cMain = async function cMain(arg, msg) {
  let req = `https://jlp.yahooapis.jp/MAService/V1/parse?appid=${appId}&results=ma&sentence=${encodeURIComponent(arg[0])}&response=reading`
  
  let content = await fetch(req).then(res => res.text());
  
  let arr = content.match(/<reading>.*?<\/reading>/g);
  
  arr.forEach((el,i) => arr[i] = el.slice(9, el.length - 10));
  
  await util.sleep(500);
  
  content = arr.join("");
  msg.channel.send(content)
};

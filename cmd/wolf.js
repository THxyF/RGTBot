const consts=require("../func/const.js");
const fetch = require("node-fetch");
const post = require("../func/post.js");

exports.cMain = async function cMain(arg, msg) {
  let tex = encodeURIComponent(arg.shift());
  while (arg.length !== 0) {
    tex = tex + "%20" + encodeURIComponent(arg.shift());
  }
  console.log(tex);
  const src = await fetch(
    `http://api.wolframalpha.com/v1/query?input=${tex}&appid=${consts.wolfAppId}&format=image&output=json&width=200`
  ).then(res => {
    return res.json();
  });

  if (src.queryresult.err === true || src.queryresult.success === false) {
    msg.channel.send("err");
    return 0;
  }

  let arr = [],
    title = [];

  await src.queryresult.pods.forEach(async (pod, i) => {
    await pod.subpods.forEach((subpod, j) => {
      arr.push({
        attachment: subpod.img.src,
        name: `result_${pod.title}${j}.png`
      });
    });
    title.push(pod.title);
  });

  title.forEach(t => {
    let a = arr.filter(ar => {
      return new RegExp(t).test(ar.name);
    });
    post.post(t, msg.channel, msg.id, { files: a });
  });
  return 0;
};

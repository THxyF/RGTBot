const post = require("../func/post.js");

exports.cMain = async function cMain(arg, msg) {
  if (arg.length === 0) return 0;
  if (arg.length === 1) arg.push(800);
  if (arg.length === 2) arg.push(400);

  const url = `http://new-c1ccccc1-34.ics.uci.edu:8081/arrow-webapp/ArrowWebService?action=smi2png&smiles=${encodeURIComponent(
    arg[0]
  )}&width=${encodeURIComponent(arg[1])}&height=${encodeURIComponent(
    arg[2]
  )}&arrowdesc=&extraImageSetting=amap`;
  post.post("", msg.channel, msg.id, { files: [{ attachment: url, name: `smiles.png` }] });
  return 0;
};

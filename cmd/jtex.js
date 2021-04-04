const fetch = require("node-fetch");
const post = require("../func/post.js");

exports.cMain = async function cMain(arg, msg) {
  let tex = encodeURIComponent(arg.shift());
  while (arg.length !== 0) {
    tex = tex + "%20" + encodeURIComponent(arg.shift());
  }
  let backslash = encodeURIComponent("\\");
  let begin = encodeURIComponent("begin{jarticle*}");
  let noindent = encodeURIComponent("noindent");
  let end = encodeURIComponent("end{jarticle*}");
  tex = backslash + begin + backslash + noindent + tex + backslash + end;
  const url = `https://texclip.marutank.net/render.php/tex.png?s=${tex}&f=c&r=1200&m=p&b=f&k=t`;
  post.post("",msg.channel, msg.id, { files: [{ attachment: url, name: tex.png }] });
  return 0;
};

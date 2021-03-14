exports.description = "日本語を英語に翻訳します。"; //このコマンドの説明文
exports.format = "<Japanese>"; //このコマンドの書き方([]で囲むと任意,<>で囲むと必須,|で区切ると選択式)
//()の内部は付記,{}で囲むとブロック化

const fs = require("fs");
const datPath = "./json/ttt.json";

function make(p = 2, q = 3) {
  let buf0 = [false, false],
    buf1 = [];

  for (let m = 0; m < p; ++m) {
    for (let n = 0; n < q; ++n) buf1.push(buf0);
    buf0 = buf1;
    buf1 = [];
  }

  return buf0;
}

exports.cMain = async function cMain(arg, msg) {
  let dat = await new make(arg[0], arg[1]);
  let members = [msg.author.id];

  let gameDat = JSON.parse(fs.readFileSync(datPath, "utf8"));

  if (arg.length === 0) arg[0] = 2;
  if (arg.length === 1) arg[1] = 3;

  if (gameDat.members.length != 0) return 0;

  fs.writeFileSync(
    datPath,
    JSON.stringify({
      field: dat,
      members: members,
      dim: [Number(arg[0]), Number(arg[1])],
      now:[]
    })
  );
  
  msg.channel.send(`made ${arg[0]}次元${arg[1]}目並べ`);
  //console.log(dat);
};

exports.description = "日本語を英語に翻訳します。"; //このコマンドの説明文
exports.format = "<Japanese>"; //このコマンドの書き方([]で囲むと任意,<>で囲むと必須,|で区切ると選択式)
//()の内部は付記,{}で囲むとブロック化

const fs = require("fs");
const datPath = "./json/ttt.json";

exports.cMain = async function cMain(arg, msg) {
  let gameDat = JSON.parse(fs.readFileSync(datPath, "utf8"));
  let w = "white:\n";
  let b = "black:\n";

  gameDat.now
    .filter(str => str[1])
    .forEach(str => {
      b += str[0] + "\n";
      if (b.length > 1500) {
        msg.channel.send(b);
        b = ".";
      }
    });

  msg.channel.send(b);

  gameDat.now
    .filter(str => !str[1])
    .forEach(str => {
      w += str[0] + "\n";
      if (w.length > 1500) {
        msg.channel.send(w);
        w = ".";
      }
    });

  msg.channel.send(w);
};

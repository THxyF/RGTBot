exports.description = "日本語を英語に翻訳します。"; //このコマンドの説明文
exports.format = "<Japanese>"; //このコマンドの書き方([]で囲むと任意,<>で囲むと必須,|で区切ると選択式)
//()の内部は付記,{}で囲むとブロック化

const fs = require("fs");
const datPath = "./json/ttt.json";

exports.cMain = async function cMain(arg, msg) {
  fs.writeFileSync(
    datPath,
    JSON.stringify({ field: [], members: [], dim: [], now: [] })
  );
  msg.channel.send("deleted");
};

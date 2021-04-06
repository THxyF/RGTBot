const fs = require("fs");

const gameDatPath = "./json/nabla/gameDat.json";
const srcPath = "./json/nabla/src.json";

exports.cMain = async function cMain(arg, msg) {
  try {
    let gameDat = JSON.parse(fs.readFileSync(gameDatPath, "utf8"));
    let src = JSON.parse(fs.readFileSync(srcPath, "utf8"));

    let index = gameDat.games.findIndex(
      game => game.guildId === msg.guild.id && game.channelId === msg.channel.id
    );
    if (index === -1) throw "err";

    let out = "";

    for (let i = 0; i < 2; ++i) {
      out += `<@!${gameDat.games[index].playersId[i]}>:\n`;
      gameDat.games[index].game.field[i].forEach((str,i) => out += "    ["+i+"]"+str+"\n");
    }

    msg.channel.send(out);
  } catch (err) {
    msg.channel.send("err:"+err);
    console.log(
      "a defined error happened while executing a command:(" + err + ")"
    );
    return -1;
  }
};

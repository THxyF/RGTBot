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
    let player = Number(msg.author.id === gameDat.games[index].playersId[1]);

    let out = "";

    //console.log(index)
    //console.log(player)

    if (index === -1) throw "err";

    gameDat.games[index].game.hand[player].forEach((count, i) => {
      if (count !== 0) out += `(${src.imgs[i].name})\\*${count},\n`;
    });

    msg.author.send(out);
  } catch (err) {
    msg.channel.send("err:"+err);
    console.log(
      "a defined error happened while executing a command:(" + err + ")"
    );
    return -1;
  }
};

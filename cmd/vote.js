const consts=require("../func/const.js");
const fs = require("fs");

exports.cMain = async function cMain(arg, msg) {
  if (msg.channel.type === "dm") throw "このコマンドはDMでは使えません。";
  if (msg.guild.id !== consts.guildId) throw "このコマンドはGSS以外では使えません。";
  
  let path = `../cmd/vote/${arg.shift()}.js`;
  if (fs.existsSync(path)) {
    let access = require(path);

    try {
      if (access.cMain(arg, msg) === 0)
        console.log(`command:${path} ${arg} is successfully completed.`);
    } catch (err) {
      console.log(
        "a defined error happened while executing a command:(" + err + ")"
      );
      return -1;
    }
  } else {
    console.log("couldn't find command file(" + path + ")");
  }
};

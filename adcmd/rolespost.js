const consts = require("../func/const.js");
const fs = require("fs");

exports.cMain = async function cMain(arg, msg) {
  let rolesCh = msg.guild.channels.cache.find(ch => ch.id === consts.rulesChId);

  let rolesText = fs.readFileSync("./text/roles-text3.txt", "utf8");

  while (rolesText.length >= 1900) {
    rolesCh.send(rolesText.slice(0, 1900));
    rolesText = rolesText.slice(1900, rolesText.length);
  }
  rolesCh.send(rolesText);

  return 0;
};

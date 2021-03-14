const consts = require("../func/const.js");

exports.flagToLang = (flag) => {
  let foundFlag = consts.flagAndLang.find(set => set[0] === flag);
  if (foundFlag !== undefined) return foundFlag[1];
  else return undefined;
}

exports.emojiToRole = (list, emoji, guild) =>  {
  let roleName;
  roleName = list.find(set => set[0] === emoji.name);

  if (roleName === undefined) {
    console.log(`couldn't be find in 'list'`);
    return undefined;
  }
  if (guild === undefined) {
    console.log("err in 'list': arg err: 'guild' is undefined");
    return undefined;
  }
  if (guild.id !== consts.guildId) {
    console.log("please use this in 'Gathering of Science Students'");
    return undefined;
  }

  let theRole = guild.roles.cache.find(role => role.name === roleName[1]);
  return theRole;
}
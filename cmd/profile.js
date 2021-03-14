const consts=require("../func/const.js");
exports.cMain = async function cMain(arg, msg) {
    if (msg.channel.type === "dm") return 0;
    if (msg.guild.id !== consts.guildId) return 0;
  
    let user;
    Array.isArray(arg) ? user = arg[0] : user = arg;
  
    let access = require("../func/file.js");
    let profile = access.read("."+consts.ProPath);
    let users = [];

    let regExp = new RegExp(`^${user}`);
    console.log("0:" + user);
  
    if (profile.members.some(mem => regExp.test(mem.name))) {
      users = profile.members.filter(mem => regExp.test(mem.name));
      //console.log("1:" + users.length);
    } else if (profile.members.some(mem => regExp.test(mem.nickname))){
      users = profile.members.filter(mem => regExp.test(mem.nickname));
      //console.log("2:" + users.length);
    }
  
    //users = [];
  
    if (users.length === 0 || user.length === 0) {
      msg.channel.send("couldn't find such user(s).");
      return 0;
    }
    for (let i = 0; users !== undefined && i < users.length; ++i) {
      msg.channel.send(
        "<username> : " +
          users[i].name +
          "\n<nickname> : " +
          users[i].nickname +
          "\n<points> : " +
          users[i].point +
          "\n<profile>\n" +
          users[i].profile
      );
    }
  return 0;
}
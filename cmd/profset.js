const consts=require("../func/const.js");
const fs = require("fs");
let access = require("../func/file.js");


exports.cMain = async function cMain(arg, msg) {
    if (msg.channel.type === "dm") return 0;
    if (msg.guild.id !== consts.guildId) return 0;
    let newmember = consts.member;
    let profile;

    //プロフィール読み込み
    
    profile = access.read("."+consts.ProPath);

    newmember.name = msg.author.tag;
    newmember.id = msg.author.id;
    newmember.nickname = arg.shift();
    newmember.profile = arg.shift();
    while (arg.length !== 0) {
      newmember.profile = newmember.profile + " " + arg.shift();
    }
    let huge = profile.members.findIndex(member => member.id === newmember.id);

    //既存かどうかの分岐
    if (huge === -1) {
      newmember.point = 0;
      profile.members.push(newmember);
      msg.channel.send("added your profile to the list!");
    } else {
      newmember.point = profile.members[huge].point;
      profile.members[huge] = newmember;
      msg.channel.send("rewrote your profile on the list!");
    }

    //プロフィール書き込み
    if (fs.existsSync(".."+consts.ProPath)) {
      fs.writeFileSync(".."+consts.ProPath, JSON.stringify(profile));
    }
}
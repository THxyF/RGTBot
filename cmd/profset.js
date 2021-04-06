const consts=require("../func/const.js");
const fs = require("fs");
const access = require("../func/jsonlib.js");
const post = require("../func/post.js");


exports.cMain = async function cMain(arg, msg) {
    if (msg.channel.type === "dm") return 0;
    if (msg.guild.id !== consts.guildId) return 0;
    let newmember = consts.member;
    let profile;

    //プロフィール読み込み
    
    profile = await access.read("."+consts.ProPath);

    newmember.name = msg.author.tag;
    newmember.id = msg.author.id;
    newmember.nickname = arg.shift();
    newmember.profile = arg.join(" ");
    let huge = profile.members.findIndex(member => member.id === newmember.id);

    //既存かどうかの分岐
    if (huge === -1) {
      newmember.point = 0;
      profile.members.push(newmember);
      post.post("added your profile to the list!", msg.channel);
    } else {
      newmember.point = profile.members[huge].point;
      profile.members[huge] = newmember;
      post.post("rewrote your profile on the list!", msg.channel);
    }

    //プロフィール書き込み
    access.write("."+consts.ProPath, profile)
}
const consts = require("."+"/func/const.js");//定数表
const http = require("http");
const querystring = require("querystring");
const discord = require("discord.js");
const fetch = require("node-fetch");
const fs = require("fs");

let preStr = ";";
let ready = false;

const client = new discord.Client({
  partials: ["MESSAGE", "CHANNEL", "REACTION"]
});

http
  .createServer(function(req, res) {
    if (req.method == "POST") {
      var data = "";
      req.on("data", function(chunk) {
        data += chunk;
      });
      req.on("end", function() {
        if (!data) {
          res.end("No post data");
          return;
        }
        var dataObject = querystring.parse(data);
        console.log("post:" + dataObject.type);
        if (dataObject.type == "wake") {
          console.log("Woke up in post");
          res.end();
          return;
        }
        res.end();
      });
    } else if (req.method == "GET") {
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end("Discord Bot is active now\n");
    }
  })
  .listen(3000);

function isSameTime(time1, time2) {
  let date1 = new Date(time1);
  let date2 = new Date(time2);

  if (date1.getFullYear() !== date2.getFullYear()) return false;
  if (date1.getMonth() !== date2.getMonth()) return false;
  if (date1.getDate() !== date2.getDate()) return false;
  if (date1.getHours() !== date2.getHours()) return false;
  if (date1.getMinutes() !== date2.getMinutes()) return false;
  return true;
}

function flagToLang(flag) {
  let foundFlag = consts.flagAndLang.find(set => set[0] === flag);
  if (foundFlag !== undefined) return foundFlag[1];
  else return undefined;
}

function emojiToRole(list, emoji, guild) {
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

function sendReply(message, text) {
  message
    .reply(text)
    .then(console.log("リプライ送信: " + text))
    .catch(console.error);
}

function sendMsg(channelId, text, option = {}) {
  client.channels
    .fetch(channelId)
    .send(text, option)
    .then(console.log("メッセージ送信: " + text + JSON.stringify(option)))
    .catch(console.error);
}

let timeCheck = async () => {
  if (ready === false) return 0;

  try {
    const japanStandardTime = new Date().toLocaleString("ja-JP", {
      timeZone: "Asia/Tokyo"
    });
    const jnow = new Date(japanStandardTime);

    if (
      jnow.getMonth() + 1 === 1 &&
      jnow.getDate() === 1 &&
      jnow.getHours() === 0 &&
      jnow.getMinutes() === 0 &&
      jnow.getSeconds() === 0
    ) {
      console.log("A");
      client.guilds.cache
        .find(guild => guild.id === consts.guildId)
        .channels.cache.find(ch => ch.id === consts.loungeChId)
        .send(
          "Happy New Year!!!!!今年も理学徒の集いをよろしくお願いします!!!!"
        );
    }
    if (
      jnow.getDate() === 1 &&
      jnow.getHours() === 0 &&
      jnow.getMinutes() === 0 &&
      jnow.getSeconds() === 0
    ) {
      let profile = await JSON.parse(fs.readFileSync("." + consts.ProPath, "utf8"));
      profile.members.forEach(mem => {
        mem.MP[0] = mem.MP[1];
        mem.MP[1] = 0;
      });
      if (fs.existsSync("." + consts.ProPath)) {
        fs.writeFileSync("." + consts.ProPath, JSON.stringify(profile));
      } else throw "dir(ProPath) err in monthlyCheck";
    }
  } catch (err) {
    console.log(err);
  }
};

let mentionCheck = async () => {
  if (ready === false) return 0;

  try {
    const japanStandardTime = new Date().toLocaleString("ja-JP", {
      timeZone: "Asia/Tokyo"
    });
    const jnow = new Date(japanStandardTime);

    if (jnow.getSeconds() !== 0) return 0;

    let mentionsDat = await JSON.parse(
      fs.readFileSync("." + consts.scheduleTimePath, "utf8")
    );

    if (mentionsDat.mentions.length === 0) return 0;

    for (let i = 0; i < consts.reminderTime; ++i)
      jnow.setMinutes(jnow.getMinutes() + 1);
    console.log(jnow);

    if (mentionsDat.mentions.some(mention => isSameTime(mention.time, jnow))) {
      let nowMentions = await mentionsDat.mentions.filter(mention =>
        isSameTime(mention.time, jnow)
      );
      let otherMentions = await mentionsDat.mentions.filter(
        mention => !isSameTime(mention.time, jnow)
      );

      await nowMentions.forEach(async men => {
        let nextTime = new Date(men.time);
        for (let i = 0; i < 7; ++i) nextTime.setDate(nextTime.getDate() + 1);
        men.time = nextTime.toISOString();
      });

      mentionsDat.mentions = await otherMentions.concat(nowMentions);
      console.log(mentionsDat);

      if (fs.existsSync("." + consts.scheduleTimePath)) {
        fs.writeFileSync("." + consts.scheduleTimePath, JSON.stringify(mentionsDat));
      } else throw "dir(scheduleTimePath) err in mentionCheck";

      nowMentions.forEach(men => {
        let scheduleDat = JSON.parse(
          fs.readFileSync("." + consts.schedulePath, "utf8")
        );

        scheduleDat.schedule[men.id].participants.forEach(mem => {
          console.log(mem.id);
          client.users.cache
            .find(user => user.id === mem.id)
            .send(
              `${scheduleDat.schedule[men.id].name}の${consts.reminderTime}分前だよ!`
            );
        });
      });
    } else return 0;
  } catch (err) {
    console.log(
      "a defined error happened while executing the function timeCheck:(" +
        err +
        ")"
    );

    return 1;
  }
  return 0;
};

setInterval(mentionCheck, 1000);
setInterval(timeCheck, 1000);

client.on("ready", message => {
  console.log("Bot準備完了");
  client.user.setPresence({ name: "理学徒の集い運営" });

  ready = true;
});

client.on("message", async message => {
  console.log("start");
  if (message.author === client.user) {
    if (consts.deleteBanedChList.includes(message.channel.id)) return;
    message.react("🗑️");
    return;
  }
  if (message.author.bot) {
    return;
  }
  if (message.channel.type === "text") {
    if (message.guild.id === consts.guildId) {
      let pointmember = consts.member; //初期値代入
      let access = require("./func/file.js"); //プロフィール読み込み準備
      let profile = access.read("." + consts.ProPath); //プロフィール読み込み
      pointmember.id = message.author.id; //idを送信者のidに変更
      let hoge = profile.members.findIndex(
        member => member.id === pointmember.id
      );

      //既存かどうかの分岐
      if (
        hoge === -1 //member.id==pointmember.idとなるようなmemberが存在しない
      ) {
        pointmember.name = message.author.tag; //nameを送信者に変更
        pointmember.nickname = message.author.username; //idを送信者のusernameに変更
        pointmember.point = 1; //pointを初期化
        profile.members.push(pointmember); //pointmemberを追加
      } else {
        //member.id==pointmember.idとなるようなmemberが存在する
        pointmember.name = profile.members[hoge].name;
        pointmember.nickname = profile.members[hoge].nickname;
        pointmember.profile = profile.members[hoge].profile;
        pointmember.point = profile.members[hoge].point + 1;
        if (profile.members[hoge].MP !== undefined) {
          pointmember.MP[1] = profile.members[hoge].MP[1] + 1;
          let memberRole = message.guild.roles.cache.find(
            r => r.id === consts.memberRoleId
          );
          if (memberRole === undefined) return 0;

          if (
            pointmember.MP[0] + pointmember.MP[1] >
            consts.memberRoleThreshold
          ) {
            message.member.roles.add(memberRole);
          } else {
            if (
              message.member.roles.cache.some(r => r.id === consts.memberRoleId)
            )
              message.member.roles.remove(memberRole);
          }
        }
        profile.members[hoge] = pointmember; //member.id==pointmember.idとなるようなmemberのprofileにpointmemberを代入
      }
      if (!message.member.roles.cache.has("805783022749614081")) {
        if (pointmember.point > 9) {
          message.member.roles.add("805783022749614081");
        }
      }
      if (fs.existsSync("." + consts.ProPath)) {
        //ファイルの存在判定
        fs.writeFileSync("." + consts.ProPath, JSON.stringify(profile)); //profileをpropathに書き込み
      }
    }
  }

  //コマンド処理
  if (message.content.startsWith(preStr)) {
    try {
      let args = message.content.split(" ");
      console.log(args);
      let prefix = args.shift().substr(preStr.length);
      let cmdPath = `./cmd/${prefix}.js`;
      let adCmdPath = `./adcmd/${prefix}.js`;

      console.log(args);

      if (fs.existsSync(cmdPath)) {
        if (require(cmdPath).cMain(args, message) === 0)
          console.log(`command:${cmdPath} ${args} is successfully completed.`);
      } else if (fs.existsSync(adCmdPath)) {
        //command by admin
        if (message.member.roles.cache.has("755279225702842468")) {
          //Management
          if (require(adCmdPath).cMain(args, message) === 0)
            console.log(
              `command:${adCmdPath} ${args} is successfully completed.`
            );
        } else message.channel.send("権限が足りません。");
      } else {
        message.reply(cmdPath + "は存在しません。");
        console.log("couldn't find command file(" + cmdPath + ")");
      }
    } catch (err) {
      console.log(
        "a defined error happened while executing a command:(" + err + ")"
      );
      return -1;
    }
  }

  console.log("end");
});

client.on("messageReactionAdd", async (reaction, user) => {
  if (user === client.user) return 0;

  let member = client.guilds.cache
    .find(g => g.id === consts.guildId)
    .members.cache.find(m => m.id === user.id);

  //console.log(member);

  if (reaction.partial) {
    await reaction
      .fetch()
      .then(res => (reaction = res))
      .catch(err => console.log(err));
  }
  if (reaction.message.partial) {
    await reaction.message
      .fetch()
      .then(res => (reaction.message = res))
      .catch(err => console.log(err));
  }

  console.log(`${user.tag} added:${reaction.emoji.name}`);

  const text = encodeURIComponent(reaction.message.content);

  let offender;

  if (reaction.message.channel.type === "text") {
    if (reaction.message.guild.id === consts.guildId) {
      offender = reaction.message.guild.roles.cache.find(
        role => role.name === "Offender"
      );
    }
  }

  switch (reaction.emoji.name) {
    case "caution":
      if (reaction.count === consts.maxCautionCount) {
        reaction.message.author.send(
          `警告:下記のメッセージに要注意リアクションが${consts.maxCautionCount}つ付いています。\n${reaction.message.content}`
        );
        reaction.message.guild.members.cache
          .filter(
            member =>
              member.roles.cache.find(role => role.name === "wasaseki") !==
              undefined
          )
          .each(member =>
            member.send(
              `New Offender:<@!${reaction.message.author.id}> , ${reaction.message.content}`
            )
          );
        if (offender === undefined) break;
        reaction.message.member.roles.add(offender);
        if (reaction.message.member.roles.cache.has("755279225702842468")) {
          //Management
          reaction.message.member.roles.remove("755279225702842468"); //Management
        }

        if (reaction.message.member.roles.cache.has("734340291024388096")) {
          //Management
          reaction.message.member.kick();
          reaction.message.author.send(
            `報告:Ex-Convictが付いていたためあなたはキックされました。\n`
          );
        }
      }
      break;
    case "🗑️":
      if (reaction.message.author === client.user) {
        reaction.message.delete();
      }
      break;
    default:
      let tgt = flagToLang(reaction.emoji.name);
      let role = emojiToRole(
        consts.emojiAndRoles,
        reaction.emoji,
        reaction.message.guild
      );
      let role2 = emojiToRole(
        consts.emojiAndRoles2,
        reaction.emoji,
        reaction.message.guild
      );
      let role3 = emojiToRole(
        consts.emojiAndRoles3,
        reaction.emoji,
        reaction.message.guild
      );

      if (tgt !== undefined) {
        const content = await fetch(
          `https://script.google.com/macros/s/AKfycbweJFfBqKUs5gGNnkV2xwTZtZPptI6ebEhcCU2_JvOmHwM2TCk/exec?text=${text}&source=&target=${tgt}`
        ).then(res => res.text());

        if (/^<!DOCTYPE html>/.test(content)) {
          reaction.message.channel.send("Error");
        } else {
          reaction.message.channel.send(content);
        }
        //rulesのロール取得
      } else if (role !== undefined) {
        if (reaction.message.id !== consts.rolingMsgId)
          console.log("Not Here.");
        else if (!member.roles.cache.some(r => r.id === role.id))
          member.roles.add(role);
        else console.log("The member already has the role.");
      }
      //rulesの一番興味のある学問ロール取得
      if (role2 !== undefined) {
        let theName = consts.RolesAndRoles.find(el => el[1] === role2.name);
        //console.log(theName);
        theName === undefined
          ? (theName = member.roles.cache.some(
              r => consts.emojiAndRoles.some(el => el[1] === r.name) //すでにロールがついている場合
            ))
          : (theName = theName[0]);

        console.log(theName);

        if (reaction.message.id !== consts.rolingMsgId2)
          console.log("Not Here.");
        else if (
          member.roles.cache.some(
            r => consts.emojiAndRoles2.some(el => el[1] === r.name) //すでにロールがついている場合
          )
        ) {
          member.send("二個目はつけられません!\nrulesの参照をお願いします。");
          await reaction.users.remove(user); //二個目のロールのリアクションを削除
        } else if (
          !member.roles.cache.some(r => r.name === theName) &&
          theName !== true
        ) {
          member.send(
            "先にInterest Roleをお願いします!\nrulesの参照をお願いします。"
          );
          await reaction.users.remove(user); //二個目のロールのリアクションを削除
        } else {
          await member.roles.add(role2); //一個目のリアクションならロール付与
        }
      } else console.log("It's non-specific emoji.");
      if (role3 !== undefined) {
        if (reaction.message.id !== consts.rolingMsgId3)
          console.log("Not Here.");
        else if (!member.roles.cache.some(r => r.id === role3.id))
          member.roles.add(role3);
        else console.log("The member already has the role.");
      }
  }
});

client.on("messageReactionRemove", async (reaction, user) => {
  if (user === client.user) return 0;

  let member = client.guilds.cache
    .find(g => g.id === consts.guildId)
    .members.cache.find(m => m.id === user.id);

  if (reaction.partial) {
    await reaction
      .fetch()
      .then(res => (reaction = res))
      .catch(err => console.log(err));
  }
  if (reaction.message.partial) {
    await reaction.message
      .fetch()
      .then(res => (reaction.message = res))
      .catch(err => console.log(err));
  }

  console.log(`${user.tag} deleted:${reaction.emoji.name}`);

  switch (reaction.emoji.name) {
    default:
      let role = emojiToRole(
        consts.emojiAndRoles,
        reaction.emoji,
        reaction.message.guild
      );
      let role2 = emojiToRole(
        consts.emojiAndRoles2,
        reaction.emoji,
        reaction.message.guild
      );
      let role3 = emojiToRole(
        consts.emojiAndRoles3,
        reaction.emoji,
        reaction.message.guild
      );

      if (role !== undefined) {
        if (reaction.message.id !== consts.rolingMsgId)
          console.log("Not Here.");
        else if (member.roles.cache.some(r => r.id === role.id))
          member.roles.remove(role);
        else console.log("The member yet don't has the role.");
      } else console.log("It's non-specific emoji.");
      if (role2 !== undefined) {
        if (reaction.message.id !== consts.rolingMsgId2)
          console.log("Not Here.");
        else if (member.roles.cache.some(r => r.id === role2.id))
          member.roles.remove(role2);
        else console.log("The member yet don't has the role.");
      } else console.log("It's non-specific emoji.");
      if (role3 !== undefined) {
        if (reaction.message.id !== consts.rolingMsgId3)
          console.log("Not Here.");
        else if (member.roles.cache.some(r => r.id === role3.id))
          member.roles.remove(role3);
        else console.log("The member yet don't has the role.");
      } else console.log("It's non-specific emoji.");
  }
});

client.on("voiceStateUpdate", (oldStat, newStat) => {
  let vac = oldStat.guild.channels.cache.find(ch => ch.id === consts.vcAnnId);

  if (oldStat.channel !== newStat.channel) {
    if (newStat.channel !== null) {
      if (newStat.channel.parent.id === consts.vcCatId) {
        if (newStat.channel.members.array().length === 1) {
          vac.send(
            `started by ${newStat.member.user.tag} in <#${newStat.channel.id}>`
          );
          console.log("start");
        }
      }
    }
    if (oldStat.channel !== null) {
      if (oldStat.channel.parent.id === consts.vcCatId) {
        if (oldStat.channel.members.array().length === 0) {
          vac.send(
            `ended by ${oldStat.member.user.tag} in <#${oldStat.channel.id}>`
          );
          console.log("end");
        }
      }
    }
  }
});

client.on("guildMemberAdd", member => {
  let lounge = member.guild.channels.cache.find(
    ch => ch.id === consts.loungeChId
  );
  lounge.send(
    `ようこそ<@!${member.id}>!\n<#${consts.rulesChId}>をよく読んでね!`
  );

  let text = fs.readFileSync("./post.txt", "utf8");
  let outs = [];

  while (text.length >= 1900) {
    outs.push(text.slice(0, 1900));
    text = text.slice(1900, text.length);
  }
  outs.push(text);

  for (let i = 0; i < outs.length; ++i) member.send(outs[i]);
});

if (process.env.DISCORD_BOT_TOKEN == undefined) {
  console.log("DISCORD_BOT_TOKENが設定されていません。");
  process.exit(0);
}

client.login(process.env.DISCORD_BOT_TOKEN);

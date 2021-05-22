const consts = require("./func/const.js"); //定数表
const timeLib = require("./func/time.js"); //
const util = require("./func/util.js"); //
const post = require("./func/post.js"); //
const emojiLib = require("./func/emoji.js"); //
let jsonLib = require("./func/jsonlib.js"); //プロフィール読み込み準備

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
      let profile = await jsonLib.read("." + consts.ProPath);
      profile.members.forEach(mem => {
        mem.MP[0] = Number(mem.MP[1]);
        mem.MP[1] = 0;
      });

      await jsonLib.write("." + consts.ProPath, profile);
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

    let mentionsDat = await jsonLib.read("." + consts.scheduleTimePath);

    if (mentionsDat.mentions.length === 0) return 0;

    for (let i = 0; i < consts.reminderTime; ++i)
      jnow.setMinutes(jnow.getMinutes() + 1);

    if (
      mentionsDat.mentions.some(mention =>
        timeLib.isSameTime(mention.time, jnow)
      )
    ) {
      let nowMentions = await mentionsDat.mentions.filter(mention =>
        timeLib.isSameTime(mention.time, jnow)
      );
      let otherMentions = await mentionsDat.mentions.filter(
        mention => !timeLib.isSameTime(mention.time, jnow)
      );

      await nowMentions.forEach(async men => {
        let nextTime = new Date(men.time);
        for (let i = 0; i < 7; ++i) nextTime.setDate(nextTime.getDate() + 1);
        men.time = nextTime.toISOString();
      });

      mentionsDat.mentions = await otherMentions.concat(nowMentions);
      console.log(mentionsDat);

      await jsonLib.write("." + consts.scheduleTimePath, mentionsDat);

      nowMentions.forEach(async men => {
        let scheduleDat = await jsonLib.read("." + consts.schedulePath);

        scheduleDat.schedule[men.id].participants.forEach(mem => {
          client.users.cache
            .find(user => user.id === mem.id)
            .send(
              `${scheduleDat.schedule[men.id].name}の${consts.reminderTime}分前だよ!`
            ); //caution
        });
      });
    } else return 0;
  } catch (err) {
    console.log(
      "a defined error happened while executing the function mentionCheck:(" +
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

  client.ws.on("INTERACTION_CREATE", async interaction => {
    const command = interaction.data.name.toLowerCase();
    const args = interaction.data.options;
    client.guilds.fetch("695274768974348320").then(guild => {
      guild.members.fetch().then(mems => {
        mems.cache
          .filter(member => {
            console.log(
              member.user.username + ":" + member.roles.cache.first().name
            );
            return member.roles.cache.first().name === "@everyone";
          })
          .each(member => member.roles.add("843896831217893408"));
      });
    });
    if (command === "test") {
      client.api.interactions(interaction.id, interaction.token).callback.post({
        data: {
          type: 4,
          data: {
            content: `Hello World!`
          }
        }
      });
    }
  });

  ready = true;
});

let commandProcess = message => {
  if (message.content.startsWith(preStr)) {
    try {
      let args = message.content.split(" ");
      //console.log(args);
      let prefix = args.shift().substr(preStr.length);
      let cmdPath = `./cmd/${prefix}.js`;
      let adCmdPath = `./adcmd/${prefix}.js`;

      //console.log(args);

      if (fs.existsSync(cmdPath)) {
        if (require(cmdPath).cMain(args, message) === 0) {
          console.log(`command:${cmdPath} ${args} successfully completed.`);
        }
      } else if (fs.existsSync(adCmdPath)) {
        //command by admin
        if (message.member.roles.cache.has(consts.adminRoleId)) {
          //caution
          //Management
          if (require(adCmdPath).cMain(args, message) === 0)
            console.log(`command:${adCmdPath} ${args} successfully completed.`);
        } else message.channel.send("権限が足りません。");
      } else {
        let text = fs.readFileSync("./text/cmdHelp.txt", "utf8");

        post.post(text, message.author);
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
  return 0;
};

client.on("message", async message => {
  //console.log("start");
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

      let profile = await jsonLib.read("." + consts.ProPath); //プロフィール読み込み
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
          pointmember.MP[1] = Number(profile.members[hoge].MP[1]) + 1;

          if (
            Number(pointmember.MP[0]) + Number(pointmember.MP[1]) >
            consts.memberRoleThreshold
          ) {
            message.member.roles.add(consts.memberRoleId);
          } else {
            if (
              message.member.roles.cache.some(r => r.id === consts.memberRoleId)
            )
              message.member.roles.remove(consts.memberRoleId);
          }
        }
        profile.members[hoge] = pointmember; //member.id==pointmember.idとなるようなmemberのprofileにpointmemberを代入
      }
      await jsonLib.write("." + consts.ProPath, profile);
    }
  }

  //コマンド処理

  return commandProcess(message);
});

client.on("messageReactionAdd", async (reaction, user) => {
  if (user === client.user) return 0;

  let member = client.guilds.cache
    .find(g => g.id == consts.guildId)
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

  switch (reaction.emoji.name) {
    case "caution":
      if (reaction.count === consts.maxCautionCount) {
        reaction.message.author.send(
          `警告:下記のメッセージに要注意リアクションが${consts.maxCautionCount}つ付いています。\n${reaction.message.content}`
        );
        reaction.message.guild.members.cache
          .filter(mem => mem.roles.cache.has(consts.adminRoleId))
          .each(mem =>
            mem.send(
              `New Offender:<@!${reaction.message.author.id}> , ${reaction.message.content}`
            )
          );

        member.roles.add(consts.offenderRoleId);
        if (member.roles.cache.has(consts.adminRoleId)) {
          //Management
          member.roles.remove(consts.adminRoleId); //Management
        }

        if (member.roles.cache.has(consts.exConvictRoleId)) {
          //Management
          member.kick();
          user.send(
            `報告:Ex-Convictが付いていたためあなたはキックされました。\n`
          );
        }
      }
      break;
    case "🗑️":
      if (
        reaction.message.author.id === client.user.id &&
        user.id !== client.user.id
      ) {
        reaction.message.delete();
      }
      break;
    default:
      let tgt = emojiLib.flagToLang(reaction.emoji.name);
      let role = emojiLib.emojiToRole(
        consts.emojiAndRoles,
        reaction.emoji,
        reaction.message.guild
      );
      let role2 = emojiLib.emojiToRole(
        consts.emojiAndRoles2,
        reaction.emoji,
        reaction.message.guild
      );
      let role3 = emojiLib.emojiToRole(
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
      }
      if (role !== undefined) {
        if (reaction.message.id !== consts.rolingMsgId) {
          //console.log("Not Here.");
        } else if (!member.roles.cache.some(r => r.id === role.id)) {
          member.roles.add(role);
        } else {
          //console.log("The member already has the role.");
        }
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

        if (reaction.message.id !== consts.rolingMsgId2) {
          //console.log("Not Here.");
        } else if (
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
          await reaction.users.remove(user); //ロールのリアクションを削除
        } else {
          await member.roles.add(role2); //一個目のリアクションならロール付与
        }
      }
      if (role3 !== undefined) {
        if (reaction.message.id !== consts.rolingMsgId3) {
          //console.log("Not Here.");
        } else if (!member.roles.cache.some(r => r.id === role3.id))
          member.roles.add(role3);
        else {
          //console.log("The member already has the role.");
        }
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
      let role = emojiLib.emojiToRole(
        consts.emojiAndRoles,
        reaction.emoji,
        reaction.message.guild
      );
      let role2 = emojiLib.emojiToRole(
        consts.emojiAndRoles2,
        reaction.emoji,
        reaction.message.guild
      );
      let role3 = emojiLib.emojiToRole(
        consts.emojiAndRoles3,
        reaction.emoji,
        reaction.message.guild
      );

      if (role !== undefined) {
        if (reaction.message.id !== consts.rolingMsgId) {
          //console.log("Not Here.");
        } else if (member.roles.cache.some(r => r.id === role.id)) {
          member.roles.remove(role);
        } else {
          //console.log("The member yet doesn't have the role.");
        }
      } else {
        //console.log("It's non-specific emoji.");
      }

      if (role2 !== undefined) {
        if (reaction.message.id !== consts.rolingMsgId2) {
          //console.log("Not Here.");
        } else if (member.roles.cache.some(r => r.id === role2.id)) {
          member.roles.remove(role2);
        } else {
          //console.log("The member yet doesn't have the role.");
        }
      } else {
        //console.log("It's non-specific emoji.");
      }

      if (role3 !== undefined) {
        if (reaction.message.id !== consts.rolingMsgId3) {
          //console.log("Not Here.");
        } else if (member.roles.cache.some(r => r.id === role3.id)) {
          member.roles.remove(role3);
        } else {
          //console.log("The member yet don't has the role.");
        }
      } else {
        //console.log("It's non-specific emoji.");
      }
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

  let enRules1 = fs.readFileSync("./text/rules-en1.txt", "utf8");
  let enRules2 = fs.readFileSync("./text/rules-en2.txt", "utf8");
  let jaRules = fs.readFileSync("./text/rules-ja.txt", "utf8");

  post.post(enRules1 + enRules2 + jaRules, member);
});

if (process.env.DISCORD_BOT_TOKEN == undefined) {
  console.log("DISCORD_BOT_TOKENが設定されていません。");
  process.exit(0);
}

client.on("messageUpdate", async (oldMsg, newMsg) => {
  let dat = await jsonLib.read("./json/msgList.json");
  let index = dat.list.findIndex(l => l.parentId === oldMsg.id);

  if (index === -1) return 0;

  dat.list[index].childrenId.forEach(id => {
    oldMsg.channel.messages.fetch(id).then(msg => msg.delete());
  });
  dat.list.splice(index, 1);

  await jsonLib.write("./json/msgList.json", dat);

  return commandProcess(newMsg);
});

client.login(process.env.DISCORD_BOT_TOKEN);

const consts = require("../func/const.js");
const util = require("../func/util.js");


class MyReaction {
  constructor() {
    this.users = [];
  }

  async init(msgReaction) {
    this.emoji = msgReaction.emoji.name;

    await msgReaction.users.fetch({ limit: 100 }).then(users => {
      users.forEach(user => {
        if (!user.bot) this.users.push(user.id);
        //console.log(user.id)
      });
    }); //.then(u => {console.log("users:" + this.users)});

    //console.log(this);
    return this;
  }
}

//MyReaction = {emoji:"emoijName", users:["userId"]}

class MyMessage {
  constructor() {
    this.reactions = [];
  }
  async init(msg) {
    this.id = msg.id;

    await msg.reactions.cache.forEach(async reaction => {
      await new MyReaction().init(reaction).then(res => {
        //console.log("res1");
        this.reactions.push(res);
      });
      //console.log("res2");
    });
    //console.log("reactions:" + this.reactions);

    await util.sleep(3000);
    //console.log("res3");
    //console.log(this);
    return this;
  }
}

//MyMessage = {id:"MessageId", reactions:[{MyReaction}]}

class MyUserDat {
  //member = {discord.GuildMember}
  //messages = [{MyMessage}]
  constructor() {
    this.emojis = [[], [], []];
    this.roles = [[], [], []];
    this.delete = [];
    this.add = [];
  }
  async init(member, messages) {
    this.id = member.id;
    this.name = member.user.username;
    this.nickname = member.nickname;

    await member.roles.cache.forEach(r => {
      let x = consts.emojiAndRoles.find(el => el[1] === r.name);
      let y = consts.emojiAndRoles2.find(el => el[1] === r.name);
      let z = consts.emojiAndRoles3.find(el => el[1] === r.name);

      if (x !== undefined) {
        this.roles[0].push(x[0]);
      }
      if (y !== undefined) {
        this.roles[1].push(y[0]);
      }
      if (z !== undefined) {
        this.roles[2].push(z[0]);
      }
    });

    await messages.forEach((myMsg, i) => {
      myMsg.reactions.forEach(myRct => {
        if (myRct.users.includes(this.id)) this.emojis[i].push(myRct.emoji);
      });
    });
    await util.sleep(100);

    //console.log("aia");
    /*console.log(
      `${member.user.username}:"${this.id}"\n        [${this.emojis[0]}]vs[${
        this.roles[0]
      }]\n        [${this.emojis[1]}]vs[${this.roles[1]}]\n        [${
        this.emojis[2]
      }]vs[${this.roles[2]}]`
    );*/

    return this;
  }

  async check() {
    let err = [],
      flag = -1;
    this.emojis.forEach((e, i) => {
      flag = util.arraysEqual(e, this.roles[i]);
      console.log(`stat of ${this.name}[${i}]:${flag}`);

      if (flag === 0) {
        err.push(
          `${this.name}(${this.nickname})[${i}]:emojis[${e}] vs roles[${this.roles[i]}]`
        );
      } else if (flag === 2) {
        err.push(
          `${this.name}(${this.nickname})[${i}]: emojis[${e}] vs roles[${this.roles[i]}]`
        );
      } else if (flag === -2) {
        err.push(
          `${this.name}(${this.nickname})[${i}]: emojis[${e}] vs roles[${this.roles[i]}]`
        );
      }
    });

    return err;
  }
}

exports.cMain = async function cMain(arg, msg) {
  let targetCh = msg.guild.channels.cache.find(
    ch => ch.id === consts.rulesChId
  );
  if (targetCh === undefined)
    throw "couldn't find the Ch by ID:" + consts.rulesChId;

  let users = [],
    targetMsg = [[], [], []];

  msg.channel.send("処理中...(role encoding)");

  await targetCh.messages.fetch(consts.rolingMsgId).then(async message => {
    await new MyMessage().init(message).then(res => (targetMsg[0] = res));
  });
  await targetCh.messages.fetch(consts.rolingMsgId2).then(async message => {
    await new MyMessage().init(message).then(res => (targetMsg[1] = res));
  });
  await targetCh.messages.fetch(consts.rolingMsgId3).then(async message => {
    await new MyMessage().init(message).then(res => (targetMsg[2] = res));
  });
  if (targetMsg.includes(undefined))
    throw "couldn't find the Msg by ID:" + targetMsg;

  msg.guild.members.cache.forEach(mem => {
    new MyUserDat().init(mem, targetMsg).then(res => {
      users.push(res);
    });
  });

  msg.channel.send("処理中...(+12s)");

  await util.sleep(12000);
  let eFlag = false;

  users.forEach(user => {
    user.check().then(errs => {
      if (errs.length !== 0) {
        errs.forEach(err => msg.channel.send(err));
        eFlag = true;
      }
    });
  });

  await util.sleep(5000);
  if (!eFlag) msg.channel.send("オールオッケー!");
  //console.log(users)
};

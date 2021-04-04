const consts = require("./const.js");

const discord = require("discord.js");
const client = new discord.Client();

exports.arraysEqual = (a, b) => {
  if (a.length > b.length) return 2;
  if (a.length < b.length) return -2;

  for (var i = 0; i < a.length; ++i) {
    if (!b.includes(a[i])) return 0;
  }
  return 1;
};

exports.sleep = time => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, time);
  });
};

exports.randInt = (a, b = 0) => {
  let max = Math.max(a, b),
    min = Math.min(a, b);

  let result = min + Math.floor(Math.random() * (max - min + 1));

  if (result === max + 1) --result;

  return result;
};

exports.reacts = async (msg, reactions) => {
  let promise = Promise.resolve();

  for (const reaction of reactions) {
    promise = promise.then(() => msg.react(reaction));
  }

  return msg;
};

exports.reacts2 = async (msg, reactions) => {
  await Promise.all(reactions.map(r => msg.react(r)));

  return msg;
};

exports.reactSelection = async (msg, rts, uss) => {
  let filter = (reaction, user) =>
    rts.some(r => r === reaction.emoji.name) && uss.some(u => u === user.id);

  return this.reacts(msg, rts)
    .then(m => m.awaitReactions(filter, { max: 1, time: 300000 }))
    .then(c => rts.findIndex(r => r === c.first().emoji.name))
    .catch(err => {
      console.log(`err in reactSelection(${msg}, ${rts}, ${uss})`);
    });
};

exports.cutAndEvenUpArray = (arr, max) => {
  let newArr = [],
    a = arr;
  while (0 < a.length) newArr.push(a.splice(0, max));

  return newArr;
};

exports.genRTs = (newArr, page) => {
  let rts = [];
  rts = rts.concat(consts.numRTs.slice(0, newArr[page].length));

  if (page > 0) rts = [consts.arrowRTs[0]].concat(rts);
  if (page < newArr.length - 1) rts.push(consts.arrowRTs[1]);

  console.log("rts:" + rts);
  return rts;
};

exports.genMsg = (newArr, page) => {
  let out = "select:\n";

  for (let i = 0; i < newArr[page].length; ++i)
    out += `  ${consts.numRTs[i]}:${newArr[page][i]}\n`;

  out += "\n";

  if (page > 0) out += `  ${consts.arrowRTs[0]}:previous page\n`;
  if (page < newArr.length - 1) out += `  ${consts.arrowRTs[1]}:next page\n`;

  out += `--------page: ${page + 1}/${newArr.length}--------`;

  return out;
};

exports.selectArrByRTs = async (msg, arr) => {
  let newArr = this.cutAndEvenUpArray(arr, 10),
    page = 0,
    selected = -1;
  let rts = this.genRTs(newArr, page),
    out = this.genMsg(newArr, page),
    p = msg.channel.send(out);

  while (selected === -1) {
    p = Promise.resolve(
      await p
        .then(message => {
          return this.reactSelection(message, rts, [msg.author.id])
            .then(res => {
              if (page > 0) --res;

              switch (res) {
                case -1:
                  --page;
                  break;
                case newArr[page].length:
                  ++page;
                  break;
                default:
                  selected = res;
                  return message;
              }
              rts = this.genRTs(newArr, page);
              out = this.genMsg(newArr, page);

              return message.edit(out).then(m => m.reactions.removeAll());
            })
            .catch(err => {
              console.log(
                `err in selectArrByRTs(${msg}, ${arr})-reactSelection`
              );
            });
        })
        .catch(err => {
          console.log(`err in selectArrByRTs(${msg}, ${arr})-p:${p}`);
        })
    );

    console.log(p);
  }

  return selected;
};

exports.userToMem = async (guildId, ...userIds) => {
  return client.guilds.cache
    .find(g => g.id === guildId)
    .members.cache.filter(m => userIds.includes(m.id));
};

exports.sumArr = (...arr) => {
  let res = 0;

  for (let e of arr) res += Number(e);

  return res;
};

exports.aveArr = (...arr) => this.sumArr(...arr) / arr.length;

exports.varArr = (...arr) => {
  let res = 0,
    ave = this.aveArr(...arr);

  for (let e of arr) res += (e - ave) ** 2;

  return res / arr.length;
};

exports.stdArr = (...arr) => Math.sqrt(this.varArr(...arr));

exports.roop = (func, max = 0, ...arg) =>
  Array(max)
    .fill(0)
    .map(() => func(...arg));

exports.deleteArr = (arr, targets) => {
  let newArr = [];

  arr.forEach((element, index) => {
    if (!targets.includes(index)) newwArr.push(element);
  });

  return newArr;
};

exports.mulSelectArrByRTs = async (inputMsg, arr, min, max) => {
  let newArr = this.cutAndEvenUpArray(arr, consts.numRTs.length);
  let page = 0;
  let selected = [];
  let entered = false;
  let collector;
  let filter1 = (reaction, user) =>
    consts.numRTs.includes(reaction.emoji.name) && user.id === inputMsg.author.id;
  let filter2 = (reaction, user) =>
    consts.arrowRTs.includes(reaction.emoji.name) && user.id === inputMsg.author.id;
  let rts = this.mulGenRTs(newArr, page, selected);
  let out = this.mulGenMsg(newArr, page, selected);
  let p = inputMsg.channel.send(out).then(m => {
    collector = m.createReactionCollector(filter1, { time: 60000 });
    return this.reacts2(m, rts);
  });

  while (!entered) {
    p = Promise.resolve(
      await p
        .then(m => m.awaitReactions(filter2, { max: 1, time: 60000 }))
        .then(async r => {
          console.log(selected);
          console.log(collector.collected);
          if (collector.total > 0) {
            collector.collected
              .map(
                el =>
                  consts.numRTs.findIndex(e => e === el.emoji.name) +
                  page * consts.numRTs.length
              )
              .forEach(async el => {
                let i = selected.findIndex(e => e === el);
                console.log(`[${i}]:${el}`);
                if (i !== -1) selected.splice(i, 1);
                else if (selected.length < max) selected.push(el);
                else await r.first().users.remove(inputMsg.author.id);
              });
          }
          

          switch (consts.arrowRTs.findIndex(e => e === r.first().emoji.name)) {
            case 0:
              --page;
              break;
            case 1:
              ++page;
              break;
            case 2:
              if (selected.length >= min){ entered = true;return 0;}
              else await r.first().users.remove(inputMsg.author.id);

              
              break;
          }

          rts = this.mulGenRTs(newArr, page, selected);
          out = this.mulGenMsg(newArr, page, selected);

          return r.first().message.edit(out);
        })
        .then(async m => {
          if (m === 0) return 0;
          collector.stop();
          collector = m.createReactionCollector(filter1, { time: 60000 });
          await m.reactions.removeAll();
          return this.reacts2(m, rts);
        })
    );
  }
};

exports.mulGenRTs = (newArr, page) => {
  let rts = [];
  rts = rts.concat(consts.numRTs.slice(0, newArr[page].length));

  if (page > 0) rts = [consts.arrowRTs[0]].concat(rts);
  if (page < newArr.length - 1) rts.push(consts.arrowRTs[1]);

  rts.push(consts.arrowRTs[2]);

  console.log("rts:" + rts);
  return rts;
};

exports.mulGenMsg = (newArr, page, selected) => {
  let out = "select:\n";

  for (let i = 0; i < newArr[page].length; ++i) {
    out += `  ${consts.numRTs[i]}: ${newArr[page][i]}`;
    if (selected.includes(page * 10 + i)) out += "(selected)";
    out += "\n";
  }

  out += "\n";

  if (page > 0) out += `  ${consts.arrowRTs[0]}:previous page\n`;
  if (page < newArr.length - 1) out += `  ${consts.arrowRTs[1]}:next page\n`;

  out += `  ${consts.arrowRTs[2]}:enter\n`;

  out += "\n";

  out += `--------page: ${page + 1}/${newArr.length}--------`;

  return out;
};

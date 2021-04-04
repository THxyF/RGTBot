const fs = require("fs");
const util = require("../../func/util.js");

const gameDatPath = "./json/nabla/gameDat.json";
const srcPath = "./json/nabla/src.json";

const src = JSON.parse(fs.readFileSync(srcPath, "utf8"));

//const numRTs = ["0️⃣","1️⃣","2️⃣","3️⃣","4️⃣","5️⃣","6️⃣","7️⃣","8️⃣","9️⃣"];
//const arrowRTs = ["◀️","▶️"]


async function useType0(dat, msg, operationId) {
  let arr = [], operationName = src.imgs[operationId].name;

  dat.playersId.forEach(id => arr.push(`<@!${id}>\'s field.`));

  await util.selectArrByRTs(msg, arr)
    .then(target => {
      dat.game.field[target].push(operationName);

      return msg.channel.send(
        `added ${operationName} to ${arr[target]}`
      );
    });
}//functions(0,1,x,x^2 etc)

//completed
async function useType1(dat, msg, operationId) {
  let arr = [], operationName = src.imgs[operationId].name;

  dat.playersId.forEach(id => arr.push(`<@!${id}>\'s field.`));

  await util.selectArrByRTs(msg, arr)
    .then(async target => {
      let out = "";

      dat.game.field[target].forEach((str, i) => {
        out += `calulate!!:${operationName}(${str})\n`;
        dat.game.field[target][
          i
        ] = `<@!${msg.author.id}> is calculating \"${operationName}(${str})\"`;
      });

      msg.channel.send(out);

      await util.sleep(100);
    });
}//nabla laplacian

//completed
async function useType2(dat, msg, operationId) {
  let arr = [], field = 0, player = Number(msg.author.id === dat.playersId[1]);
  let count = 1, out = "", operationName = src.imgs[operationId].name;

  dat.playersId.forEach(id => arr.push(`<@!${id}>\'s field.`));

  await util.selectArrByRTs(msg, arr)
    .then(f => {
      field = f;
      arr = [];

      dat.game.field[field].forEach(val => arr.push(val));
      return util.selectArrByRTs(msg, arr)
    }).then(async target => {
      arr = [];
      await msg.channel.send("how many?:");

      if(dat.game.hand[player][operationId]>1){
        for(let i = 1;i <= dat.game.hand[player][operationId];++ i)arr.push(i);

        count = await util.selectArrByRTs(msg, arr) + 1;
      }

      for(let i = 0; i < count; ++ i) out += `${operationName}(`;
      out += dat.game.field[field][target];
      for(let i = 0; i < count; ++ i) out += `)`;

      msg.channel.send(`calulate!!:${out}\n`);

      dat.game.field[field][target] = `<@!${msg.author.id}> is calculating \"${out}\"`;

      await util.sleep(100);
    })
}//d/dx integral

//completed
async function useType3(dat, msg, operationId) {
  let arr = [], field = 0, player = Number(msg.author.id === dat.playersId[1]);
  let out = "", operationName = src.imgs[operationId].name;

  dat.playersId.forEach(id => arr.push(`<@!${id}>\'s field.`));

  await util.selectArrByRTs(msg, arr)
    .then(f => {
      field = f;
      arr = [];

      dat.game.field[field].forEach(val => arr.push(val));
      return util.mulSelectArrByRTs(msg, arr, 2, dat.game.hand[player][operationId] + 1)
  }).then(async targets => {
      out = targets.map(target => dat.game.field[field][target]).join(operationName);
    
      msg.channel.send(`calulate!!:${out}\n`);

      dat.game.field[field][targets.shift()] = `<@!${msg.author.id}> is calculating \"${out}\"`;
      dat.game.field[field] = deleteArr(dat.game.field[field], targets);

      await util.sleep(100);
    })
}//* /

//completed
async function useType4(dat, msg, operationId) {
  let arr = [];
  let operationName = src.imgs[operationId].name;

  dat.playersId.forEach(id => arr.push(`<@!${id}>\'s field.`));

  await util.selectArrByRTs(msg, arr)
    .then(field => {
      dat.game.field[field].forEach(val => arr.push(val));
      return util.selectArrByRTs(msg, arr)
        .then(async target => {
          msg.channel.send(`calulate!!:${operationName}(${dat.game.field[field][target]})\n`);

          dat.game.field[field][target] = `<@!${msg.author.id}> is calculating \"${operationName}(${dat.game.field[field][target]})\"`;

          await util.sleep(100);
        })
      })
}//the others(lim )

exports.cMain = async function cMain(arg, msg) {
  try {
    let gameDat = JSON.parse(fs.readFileSync(gameDatPath, "utf8"));

    let index = gameDat.games.findIndex(
      game => game.guildId === msg.guild.id && game.channelId === msg.channel.id
    );
    let player = Number(msg.author.id === gameDat.games[index].playersId[1]);
    if (index === -1) throw "err";

    console.log(arg);
    if (typeof arg[0] !== "string") throw "invalid　arg";

    let used = src.imgs.findIndex(img => img.name === arg[0]);

    if (used === -1) throw "invalid caed";
    if (gameDat.games[index].game.hand[player][used] <= 0)
      throw "you dont have that.";

    switch (src.imgs[used].type) {
      case 0:
        await useType0(gameDat.games[index], msg, used);
        break;
      case 1:
        await useType1(gameDat.games[index], msg, used);
        break;
      case 2:
        await useType2(gameDat.games[index], msg, used);
        break;
      case 3:
        await useType3(gameDat.games[index], msg, used);
        break;
      case 4:
        await useType4(gameDat.games[index], msg, used);
        break;
      default:
    }
    --gameDat.games[index].game.hand[player][used];

    msg.channel.send(
      `<@!${gameDat.games[index].playersId[player]}> used ${src.url +
        src.imgs[used].img}`
    );
    fs.writeFileSync(gameDatPath, JSON.stringify(gameDat));
  } catch (err) {
    msg.channel.send("err:" + err);
    console.log(
      "a defined error happened while executing a command:(" + err + ")"
    );
    return -1;
  }
};

exports.description = "日本語を英語に翻訳します。"; //このコマンドの説明文
exports.format = "<Japanese>"; //このコマンドの書き方([]で囲むと任意,<>で囲むと必須,|で区切ると選択式)
//()の内部は付記,{}で囲むとブロック化

const fs = require("fs");
const datPath = "./json/ttt.json";

function check(arg, msg, gameDat) {
  let a = gameDat.members[0] === msg.author.id;
  let m = [true, a];

  console.log(gameDat);
  console.log("len:" + arg.length);
  console.log("dim:" + gameDat.dim[0]);
  console.log(arg.length != gameDat.dim[0]);

  if (arg.some(a => !(0 <= a && a < gameDat.dim[1])))
    return "arg should be between 0 and " + (gameDat.dim[1] - 1);
  if (arg.length != gameDat.dim[0])
    return "arg.length should be " + gameDat.dim[0];

  switch (gameDat.dim[0]) {
    case 1:
      if (gameDat.field[arg[0]][0]) return "the place is already full.";
      gameDat.field[arg[0]] = m;
      for (let i = 0; i < gameDat.dim[1]; ++i) {
        if (!gameDat.field[i][0]) break;
        if (gameDat.field[i][1] !== a) break;
        if (i === gameDat.dim[1] - 1) return 1;
      }
      return gameDat;
    case 2:
      if (gameDat.field[arg[0]][arg[1]][0]) return "the place is already full.";
      gameDat.field[arg[0]][arg[1]] = m;
      for (let i = 0; i < gameDat.dim[1]; ++i) {
        if (!gameDat.field[arg[0]][i][0]) break;
        if (gameDat.field[arg[0]][i][1] !== a) break;
        if (i === gameDat.dim[1] - 1) return 1;
      }
      for (let i = 0; i < gameDat.dim[1]; ++i) {
        if (!gameDat.field[i][arg[1]][0]) break;
        if (gameDat.field[i][arg[1]][1] !== a) break;
        if (i === gameDat.dim[1] - 1) return 1;
      }
      if (arg[0] == arg[1]) {
        for (let i = 0; i < gameDat.dim[1]; ++i) {
          if (!gameDat.field[i][i][0]) break;
          if (gameDat.field[i][i][1] !== a) break;
          if (i === gameDat.dim[1] - 1) return 1;
        }
      }
      if (arg[0] == gameDat.dim[1] - arg[1] - 1) {
        for (let i = 0; i < gameDat.dim[1]; ++i) {
          if (!gameDat.field[i][gameDat.dim[1] - i - 1][0]) break;
          if (gameDat.field[i][gameDat.dim[1] - i - 1][1] !== a) break;
          if (i === gameDat.dim[1] - 1) return 1;
        }
      }
      return gameDat;
    case 3:
      if (gameDat.field[arg[0]][arg[1]][arg[2]][0])
        return "the place is already full.";
      gameDat.field[arg[0]][arg[1]][arg[2]] = m;
      for (let i = 0; i < gameDat.dim[1]; ++i) {
        if (!gameDat.field[arg[0]][arg[1]][i][0]) break;
        if (gameDat.field[arg[0]][arg[1]][i][1] !== a) break;
        if (i === gameDat.dim[1] - 1) return 1;
      }
      for (let i = 0; i < gameDat.dim[1]; ++i) {
        if (!gameDat.field[arg[0]][i][arg[2]][0]) break;
        if (gameDat.field[arg[0]][i][arg[2]][1] !== a) break;
        if (i === gameDat.dim[1] - 1) return 1;
      }
      for (let i = 0; i < gameDat.dim[1]; ++i) {
        if (!gameDat.field[i][arg[1]][arg[2]][0]) break;
        if (gameDat.field[i][arg[1]][arg[2]][1] !== a) break;
        if (i === gameDat.dim[1] - 1) return 1;
      }
      if (arg[0] == arg[1]) {
        for (let i = 0; i < gameDat.dim[1]; ++i) {
          if (!gameDat.field[i][i][arg[2]][0]) break;
          if (gameDat.field[i][i][arg[2]][1] !== a) break;
          if (i === gameDat.dim[1] - 1) return 1;
        }
      }
      if (arg[0] == gameDat.dim[1] - arg[1] - 1) {
        for (let i = 0; i < gameDat.dim[1]; ++i) {
          if (!gameDat.field[i][gameDat.dim[1] - i - 1][arg[2]][0]) break;
          if (gameDat.field[i][gameDat.dim[1] - i - 1][arg[2]][1] !== a) break;
          if (i === gameDat.dim[1] - 1) return 1;
        }
      }
      if (arg[1] == arg[2]) {
        for (let i = 0; i < gameDat.dim[1]; ++i) {
          if (!gameDat.field[arg[0]][i][i][0]) break;
          if (gameDat.field[arg[0]][i][i][1] !== a) break;
          if (i === gameDat.dim[1] - 1) return 1;
        }
      }
      if (arg[1] == gameDat.dim[1] - arg[2] - 1) {
        for (let i = 0; i < gameDat.dim[1]; ++i) {
          if (!gameDat.field[arg[0]][i][gameDat.dim[1] - i - 1][0]) break;
          if (gameDat.field[arg[0]][i][gameDat.dim[1] - i - 1][1] !== a) break;
          if (i === gameDat.dim[1] - 1) return 1;
        }
      }
      if (arg[0] == arg[2]) {
        for (let i = 0; i < gameDat.dim[1]; ++i) {
          if (!gameDat.field[i][arg[1]][i][0]) break;
          if (gameDat.field[i][arg[1]][i][1] !== a) break;
          if (i === gameDat.dim[1] - 1) return 1;
        }
      }
      if (arg[0] == gameDat.dim[1] - arg[2] - 1) {
        for (let i = 0; i < gameDat.dim[1]; ++i) {
          if (!gameDat.field[i][arg[1]][gameDat.dim[1] - i - 1][0]) break;
          if (gameDat.field[i][arg[1]][gameDat.dim[1] - i - 1][1] !== a) break;
          if (i === gameDat.dim[1] - 1) return 1;
        }
      }
      return gameDat;
    case 4:
      if (gameDat.field[arg[0]][arg[1]][arg[2]][arg[3]][0])
        return "the place is already full.";
      gameDat.field[arg[0]][arg[1]][arg[2]][arg[3]] = m;

      for (let i = 0; i < gameDat.dim[1]; ++i) {
        if (!gameDat.field[i][arg[1]][arg[2]][arg[3]][0]) break;
        if (gameDat.field[i][arg[1]][arg[2]][arg[3]][1] !== a) break;
        if (i === gameDat.dim[1] - 1) return 1;
      }
      for (let i = 0; i < gameDat.dim[1]; ++i) {
        if (!gameDat.field[arg[0]][i][arg[2]][arg[3]][0]) break;
        if (gameDat.field[arg[0]][i][arg[2]][arg[3]][1] !== a) break;
        if (i === gameDat.dim[1] - 1) return 1;
      }
      for (let i = 0; i < gameDat.dim[1]; ++i) {
        if (!gameDat.field[arg[0]][arg[1]][i][arg[3]][0]) break;
        if (gameDat.field[arg[0]][arg[1]][i][arg[3]][1] !== a) break;
        if (i === gameDat.dim[1] - 1) return 1;
      }
      for (let i = 0; i < gameDat.dim[1]; ++i) {
        if (!gameDat.field[arg[0]][arg[1]][arg[2]][i][0]) break;
        if (gameDat.field[arg[0]][arg[1]][arg[2]][i][1] !== a) break;
        if (i === gameDat.dim[1] - 1) return 1;
      }

      if (arg[0] == arg[1]) {
        for (let i = 0; i < gameDat.dim[1]; ++i) {
          if (!gameDat.field[i][i][arg[2]][arg[3]][0]) break;
          if (gameDat.field[i][i][arg[2]][arg[3]][1] !== a) break;
          if (i === gameDat.dim[1] - 1) return 1;
        }
      }
      if (arg[0] == gameDat.dim[1] - arg[1] - 1) {
        for (let i = 0; i < gameDat.dim[1]; ++i) {
          if (!gameDat.field[i][gameDat.dim[1] - i - 1][arg[2]][arg[3]][0])
            break;
          if (gameDat.field[i][gameDat.dim[1] - i - 1][arg[2]][arg[3]][1] !== a)
            break;
          if (i === gameDat.dim[1] - 1) return 1;
        }
      }

      if (arg[0] == arg[2]) {
        for (let i = 0; i < gameDat.dim[1]; ++i) {
          if (!gameDat.field[i][arg[1]][i][arg[3]][0]) break;
          if (gameDat.field[i][arg[1]][i][arg[3]][1] !== a) break;
          if (i === gameDat.dim[1] - 1) return 1;
        }
      }
      if (arg[0] == gameDat.dim[1] - arg[2] - 1) {
        for (let i = 0; i < gameDat.dim[1]; ++i) {
          if (!gameDat.field[i][arg[1]][gameDat.dim[1] - i - 1][arg[3]][0])
            break;
          if (gameDat.field[i][arg[1]][gameDat.dim[1] - i - 1][arg[3]][1] !== a)
            break;
          if (i === gameDat.dim[1] - 1) return 1;
        }
      }

      if (arg[0] == arg[3]) {
        for (let i = 0; i < gameDat.dim[1]; ++i) {
          if (!gameDat.field[i][arg[1]][arg[2]][i][0]) break;
          if (gameDat.field[i][arg[1]][arg[2]][i][1] !== a) break;
          if (i === gameDat.dim[1] - 1) return 1;
        }
      }
      if (arg[0] == gameDat.dim[1] - arg[3] - 1) {
        for (let i = 0; i < gameDat.dim[1]; ++i) {
          if (!gameDat.field[i][arg[1]][arg[2]][gameDat.dim[1] - i - 1][0])
            break;
          if (gameDat.field[i][arg[1]][arg[2]][gameDat.dim[1] - i - 1][1] !== a)
            break;
          if (i === gameDat.dim[1] - 1) return 1;
        }
      }

      if (arg[1] == arg[2]) {
        for (let i = 0; i < gameDat.dim[1]; ++i) {
          if (!gameDat.field[arg[0]][i][i][arg[3]][0]) break;
          if (gameDat.field[arg[0]][i][i][arg[3]][1] !== a) break;
          if (i === gameDat.dim[1] - 1) return 1;
        }
      }
      if (arg[1] == gameDat.dim[1] - arg[2] - 1) {
        for (let i = 0; i < gameDat.dim[1]; ++i) {
          if (!gameDat.field[arg[0]][i][gameDat.dim[1] - i - 1][arg[3]][0])
            break;
          if (gameDat.field[arg[0]][i][gameDat.dim[1] - i - 1][arg[3]][1] !== a)
            break;
          if (i === gameDat.dim[1] - 1) return 1;
        }
      }

      if (arg[1] == arg[3]) {
        for (let i = 0; i < gameDat.dim[1]; ++i) {
          if (!gameDat.field[arg[0]][i][arg[2]][i][0]) break;
          if (gameDat.field[arg[0]][i][arg[2]][i][1] !== a) break;
          if (i === gameDat.dim[1] - 1) return 1;
        }
      }
      if (arg[1] == gameDat.dim[1] - arg[3] - 1) {
        for (let i = 0; i < gameDat.dim[1]; ++i) {
          if (!gameDat.field[arg[0]][i][arg[2]][gameDat.dim[1] - i - 1][0])
            break;
          if (gameDat.field[arg[0]][i][arg[2]][gameDat.dim[1] - i - 1][1] !== a)
            break;
          if (i === gameDat.dim[1] - 1) return 1;
        }
      }

      if (arg[2] == arg[3]) {
        for (let i = 0; i < gameDat.dim[1]; ++i) {
          if (!gameDat.field[arg[0]][arg[1]][i][i][0]) break;
          if (gameDat.field[arg[0]][arg[1]][i][i][1] !== a) break;
          if (i === gameDat.dim[1] - 1) return 1;
        }
      }
      if (arg[2] == gameDat.dim[1] - arg[3] - 1) {
        for (let i = 0; i < gameDat.dim[1]; ++i) {
          if (!gameDat.field[arg[0]][arg[1]][i][gameDat.dim[1] - i - 1][0])
            break;
          if (gameDat.field[arg[0]][arg[1]][i][gameDat.dim[1] - i - 1][1] !== a)
            break;
          if (i === gameDat.dim[1] - 1) return 1;
        }
      }

      return gameDat;

    default:
      return "dimention err:dimention should be between 1 and 4";
  }
}

exports.cMain = async function cMain(arg, msg) {
  try {
    let gameDat = JSON.parse(fs.readFileSync(datPath, "utf8"));
    let a = check(arg, msg, gameDat);
    console.log(a);

    if (typeof a === "string" || a < 0) throw a;
    else if (a === 1) {
      msg.channel.send("you win <@!" + msg.author.id + ">");
      a = { field: [], members: [], dim: [], now:[]};
    }else{
      msg.channel.send("put:(" + arg.toString() + ").");
      a.now.push(["(" + arg.toString() + ")", gameDat.members[0] === msg.author.id]);
    }
    fs.writeFileSync(datPath, JSON.stringify(a));
  } catch (err) {
    msg.channel.send(err);
    console.log("err:" + err);
  }
};

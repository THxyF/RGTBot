const fs = require("fs");
exports.read = function read(path){
  if (fs.existsSync(path))
      return JSON.parse(fs.readFileSync(path, "utf-8"));
}
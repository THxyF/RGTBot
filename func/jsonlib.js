const fs = require("fs");
exports.read = async function read(path){
  if (fs.existsSync(path))
      return JSON.parse(fs.readFileSync(path, "utf-8"));
  else throw new Error('unknown file!!:'+path);
}

exports.write = async function write(path, object){
  if (fs.existsSync(path))
      return fs.writeFileSync(path, JSON.stringify(object));
  else throw new Error('unknown file!!:'+path);
}
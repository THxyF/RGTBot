const util = require("../func/util.js");

exports.diceRoll = (x = 6, y = "auto") => {
    if(y === "auto"){
        y = x;x = 1;
    }
    
    return util.roop(util.randInt, x, y, 1);
}
exports.rollDice = function (diceNumber, diceType, callback) {
  var result = 1;

  if(diceNumber !== undefined && diceNumber !== null
    && diceType !== undefined && diceType !== null)
    {
      for (var i = 0; i < diceNumber; i++) {
        result = result + (Math.floor(Math.random() * diceType) + 1)
      }
    }
    callback(result);
};

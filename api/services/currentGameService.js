exports.getCurrentGame = function (idUser, callback) {
  User.findOne({id: idUser})
      .populate('currentGame')
      .exec(function (err, user) {
        //If the user isn't connected to any game just send an empty array
        if (user.currentGame === null || user.currentGame === undefined) {
          return callback([]);
        }
        Game.find(user.currentGame.id)
            .populate('listPlayers')
            .populate('listChar')
            .exec(function (err, game) {
              //remove password from json
              _.each(game[0].listPlayers, function(player){
                delete player.password;
              });
              var cpt = 0;
              _.each(game[0].listChar, function (character, index) {
                Character.findOne(character.id).populate('myPos')
                .exec(function (err, char) {
                  game[0].listChar[index] = char;
                  cpt++;
                  if (cpt === game[0].listChar.length) {
                    callback(game[0]);
                  }
                })
              })
            })
      })
};

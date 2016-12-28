exports.getCurrentGame = function (idUser, callback) {
  User.findOne({id: idUser})
      .populate('currentGame')
      .exec(function (err, user) {
        Game.find(user.currentGame.id)
            .populate('listPlayers')
            .populate('listChar')
            .exec(function (err, game) {
              //remove password from json
              _.each(game[0].listPlayers, function(player){
                delete player.password;
              });
              _.each(game[0].listChar, function (character, index) {
                Character.findOne(character.id).populate('myPos')
                .exec(function (err, char) {
                  //console.log(char);
                  game[0].listChar[index] = char;
                  //console.log('/////////////////////////////////////');
                  //console.log(character);
                })
              })
              //console.log('Inside Service' + game[0]);
              console.log(game[0].listChar);
              callback(game[0]);
            })
      })
};

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
              //console.log('Inside Service' + game[0]);
              callback(game[0]);
            })
      })
};

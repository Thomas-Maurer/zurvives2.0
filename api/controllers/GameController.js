/**
 * GameController
 *
 * @description :: Server-side logic for managing games
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

  create: function (req, res) {
    if (!req.isSocket) {
      var players = [];
      var listChars = [];
      var creator = User.findOne({id: req.session.me})
        .populate('characters')
        .exec(function (err, me) {
          if (err) {
            return res.negotiate(err);
          }
          if (!me) {
            return res.json(404, null);
          }
          delete me.password;
          sails.log('Found "%s"', me.email);
          return res.json(me);
        });

      players.push(creator);
      Game.create({
        name: 'test',
        listPlayers: players,
        listChar: listChars
      }).exec(function (err, game) {
        if (err) {
          return res.negotiate(err);
        }
        if (!game) {
          return res.json(404, null);
        }

        return res.ok();
      })

    } else {
      
    }
  },
  getGamesRunning: function (req,res) {
    if (!req.isSocket) {
      Game.find()
        .populate('listPlayers')
        .exec(function(err, games){
          _.each(games, function(game){
          });
          return res.json(games);
      });
    } else {

    }
  }
	
};


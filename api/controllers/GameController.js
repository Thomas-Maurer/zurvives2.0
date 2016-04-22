/**
 * GameController
 *
 * @description :: Server-side logic for managing games
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

  create: function (req, res) {
    if (req.isSocket) {
      Game.create({
        name: req.param('name'),
        listPlayers: req.param('listPlayers'),
        listChar: req.param('listChar')
      }).exec(function (err, game) {
        if (err) {
          return res.negotiate(err);
        }
        if (!game) {
          return res.json(404, null);
        }
        //suscribe the creator of the Game to the room
        sails.sockets.join(req, req.param('name'));
        //send to all clients that a game has been created
        sails.sockets.blast('newGameCreated');
        //return the game object
        return res.json(game);
      })

    } else {
      
    }
  },
  joinGame: function (req,res) {

  },
  getGamesRunning: function (req,res) {
    if (!req.isSocket) {
      Game.find()
        .populate('listPlayers')
        .populate('listChar')
        .exec(function(err, games){
          _.each(games, function(game){

          });
          return res.json(games);
      });
    } else {

    }
  }
	
};


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
  mapLoaded: function (req, res) {
    //console.log(req);
  },
  joinGame: function (req,res) {
    console.log(req.param('gameName'));
    if (req.isSocket) {

      Game.find({name: req.param('gameName')}).exec(function (err, game) {
        User.update({id: req.session.me}, {currentGame: game.id}).exec(function (err, data) {
          sails.sockets.join(req, req.param('gameName'));
        });
      });
    }else {
    }
  },
  getGamebyName: function (req,res) {

  },
  getCurrentGame: function (req,res) {
    User.findOne({id: req.session.me})
        .populate('currentGame')
        .exec(function (err, user) {
          //console.log(user);
          return res.json(user);
        })
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


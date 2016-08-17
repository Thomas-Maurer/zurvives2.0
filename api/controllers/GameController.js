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
        guid: req.param('guid'),
        name: req.param('name'),
        listPlayers: req.param('listPlayers'),
        listChar: req.param('listChar'),
        turnof: req.param('listPlayers')[0].email
      }).exec(function (err, game) {
        if (err) {
          return res.negotiate(err);
        }
        if (!game) {
          return res.json(404, null);
        }
        //suscribe the creator of the Game to the room
        sails.sockets.join(req, req.param('guid'));
        //send to all clients that a game has been created
        sails.sockets.blast('newGameCreated');
        //return the game object
        return res.json(game);
      })

    } else {

    }
  },
  mapLoaded: function (req, res) {
    console.log(req.param('game'));
  },
  joinGame: function (req,res) {
    if (req.isSocket) {
      Game.find({guid: req.param('gameGuid')}).exec(function (err, game) {
        User.update({id: req.session.me}, {currentGame: game.id}).exec(function (err, data) {
          sails.sockets.join(req, req.param('gameGuid'));
            sails.sockets.broadcast(req.param('gameGuid'), 'newPlayerJoin', {user: 'test'})
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
          Game.find(user.currentGame.id)
              .populate('listPlayers')
              .populate('listChar')
              .exec(function (err, game) {
                //remove password from json
                _.each(game[0].listPlayers, function(player){
                  delete player.password;
                });
                return res.json(game[0]);
              })
        })
  },
  getGamesRunning: function (req,res) {
    if (!req.isSocket) {
      Game.find()
        .populate('listPlayers')
        .populate('listChar')
        .exec(function(err, games){
          _.each(games, function(game){
            _.each(game.listPlayers, function(player){
              delete player.password;
            });
          });
          return res.json(games);
      });
    } else {

    }
  },
  checkPlayerTurn: function (req, res) {
    if (req.isSocket) {
      var playerTurnEmail,
      currentPlayer;
      currentGameService.getCurrentGame(req.session.me, function callback(user) {
        currentPlayer = user.email;
      });
      currentGameService.getCurrentGame(req.session.me, function callback(game) {
        playerTurnEmail = game.turnof;
      })
      return res.json({'playerTurn': currentPlayer === playerTurnEmail})
    }
  }
};

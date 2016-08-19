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
        sails.sockets.join(req, req.param('guid'), function(err) {
        if (err) {
          return res.serverError(err);
          console.log(err);
        }
        //send to all clients that a game has been created
        sails.sockets.blast('newGameCreated');
        //return the game object
        return res.json(game);
      });
      })

    } else {

    }
  },
  joinGame: function (req, res) {
      if (req.isSocket) {
          Game.find({guid: req.param('gameGuid')})
          .populate('listPlayers')
          .populate('listChar')
          .exec(function (err, game) {
            game = game[0];
            delete req.param('newPlayer').characters;
            //add new player and char to the gameInfo
            game.listPlayers.add(req.param('newPlayer'));
            game.listChar.add(req.param('charSelected'));

            game.save(function afterUpdate(err) {
              if (err) {
                //log the error
                //TODO Create Log Class
                console.log(err);
              } else {
                res.ok();
              }
            });
          });
      }
  },
  newPlayer: function (req, res) {
    console.log('newPlayer ' + sails.sockets.getId(req));
    //suscribe the new user to the gameRoom
    sails.sockets.join(req, req.param('gameGuid'));
    //tell the others of the room a new player join them
    sails.sockets.broadcast(req.param('gameGuid'), 'newPlayerJoin', {user: req.param('newPlayer')});
    res.ok(req.param('gameGuid'));
  },
  mapLoaded: function (req, res) {
    console.log(req.param('game'));
  },
  getGamebyName: function (req,res) {

  },
  getCurrentGame: function (req,res) {
    console.log(sails.sockets.getId(req));
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

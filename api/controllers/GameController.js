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
        sails.sockets.join(sails.sockets.getId(req), req.param('guid'));
        //send to all clients that a game has been created
        sails.sockets.blast('newGameCreated');
        //return the game object
        return res.json(game);
      });

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
                //tell the others of the room a new player join them
                sails.sockets.broadcast(req.param('gameGuid'), 'Games:newPlayerJoin', {user: req.param('newPlayer')});
                //suscribe the new user to the gameRoom
                sails.sockets.join(sails.sockets.getId(req), req.param('gameGuid'));
                res.ok();
              }
            });
          });
      }else {
        return res.redirect('/user/dashboard');
      }
  },
  mapLoaded: function (req, res) {
    //console.log(req.param('game'));
    //Fire an event when the map is fully loaded for a player
    //Allow him to play after the map is loaded
    sails.sockets.broadcast(sails.sockets.getId(req), 'Games:mapLoaded');
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
  leaveGame: function (req, res) {
    if (req.isSocket) {
      Game.find({guid: req.param('gameGuid')})
      .populate('listPlayers')
      .populate('listChar')
      .exec(function (err, game) {
        game = game[0];
        delete req.param('player').characters;
        //delete new player and char to the gameInfo
        game.listPlayers.remove(req.param('player').id);
        game.listChar.remove(_.where(game.listChar,{user: req.param('player').id})[0].id);
        game.save(function afterUpdate(err, game) {
          if (err) {
            //log the error
            //TODO Create Log Class
            console.log(err);
          } else {
            //unsuscribe the user to the gameRoom
            sails.sockets.leave(sails.sockets.getId(req), req.param('gameGuid'));
            //tell the others of the room a player left them
            sails.sockets.broadcast(req.param('gameGuid'), 'Games:playerLeave', {user: req.param('player')});
            res.ok();
          }
        });
      });
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

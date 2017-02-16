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
        turnof: req.param('listPlayers')[0].email,
        maxPlayers: req.param('maxPlayers')
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
                //send to all clients that a game has been updated
                sails.sockets.blast('gameUpdated');
                req.param('newPlayer').socketID = sails.sockets.getId(req);
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
    return res.json('{"success": "true"}');
  },
  getGamebyName: function (req,res) {

  },
  getLootFromLootTable: function (req, res) {
    if (req.isSocket) {
      var totalWeight = 0;
      var rangeWeightItems = [];
      LootTable.find()
      .where({name: 'noobZone'})
      .populate('items')
      .then(function(lootTable) {
        _.each(lootTable[0].items, function(item){
          totalWeight = totalWeight + item.weight;
        });
        //return array of weight
        rangeWeightItems = _.pluck(lootTable[0].items, 'weight');
        var playerRoll = _.random(0, totalWeight);
        var indexItemLooted = _.sortedIndex(rangeWeightItems, playerRoll);

          console.log(lootTable[0].items[indexItemLooted]);
          console.log(playerRoll);

          if(lootTable[0].items[indexItemLooted] === undefined) {
            //return item null
            Item.findOne({name: null}).exec(function (err, item) {
              if (err) {
                res.badRequest();
              }
              res.ok(item);
            });
          } else {
            res.ok(lootTable[0].items[indexItemLooted]);
          }

      });
      }
  },
  getCurrentGame: function (req,res) {
    currentGameService.getCurrentGame(req.session.me, function callback(game) {
      return res.json(game);
    });
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
        var currentGame = game[0];
        delete req.param('player').characters;

        currentGame.listPlayers = _.reject(currentGame.listPlayers, function (player) {
          return player.id === req.param('player').id;
        });

        //Check if the game is empty
        if (currentGame.listPlayers.length === 0) {
          Game.destroy(currentGame.id).exec(function (err) {
            //log the error
            //TODO Create Log Class
            if (err) {
              res.serverError(err);
            }
          });
        } else {
          //delete new player and char to the gameInfo
          currentGame.listPlayers.remove(req.param('player').id);
          currentGame.listChar.remove(_.where(currentGame.listChar,{user: req.param('player').id})[0].id);
          currentGame.save();
        }
        //send to all clients that a game has been created/Updated
        sails.sockets.blast('gameUpdated');
        //unsuscribe the user to the gameRoom
        sails.sockets.leave(sails.sockets.getId(req), req.param('gameGuid'));
        //tell the others of the room a player left them
        sails.sockets.broadcast(req.param('gameGuid'), 'Games:playerLeave', {user: req.param('player')});
        res.ok();
      });
    }
  },
  checkPlayerTurn: function (req, res) {
    if (req.isSocket) {
      var playerTurnEmail,
      currentPlayer;

      currentGameService.getCurrentGame(req.session.me, function callback(game) {
        currentPlayer = User.findOne({id: req.session.me}).email;
        playerTurnEmail = game.turnof;
        currentUserService.getCurrentUser(req.session.me, function callback(user){
          currentPlayer = user.email;
          return res.json({'playerTurn': currentPlayer === playerTurnEmail})
        })
      });
    }
  },
  //End the player turn
  //TODO Maybe tell the next player it's his turn ?
  endPlayerTurn: function (req, res) {
    if (req.isSocket) {
      var currentPlayer,
          nextPlayer,
          tempPlayerList;
      currentGameService.getCurrentGame(req.session.me, function callback(game) {
        tempPlayerList = _.reject(game.listPlayers, function (player) {
          return player.id === req.session.me;
        });
        //If the game only possess one player just set the tempPlayerList to the currentGame player list
        if (tempPlayerList === undefined || tempPlayerList === null) {
          tempPlayerList = game.listPlayers;
        }
        game.turnof = tempPlayerList[0].email;
        game.save();
      });
    }
  },
  movePlayer: function (req, res) {
    if (req.isSocket) {
      var player = req.param('player');

      currentGameService.getCurrentGame(player.id, function (game) {
        var charWhoMoved = _.find(game.listChar, function (char) {
          return char.user == player.id;
        });
        //Update character pos serverSide
        Position.findOne().where({'charPos': charWhoMoved.id}).exec(function (err, position) {
          if (err) {
            console.log("ERROR : ");
            console.log(err);
            res.serverError(err);
          } else {
            //if position doesn't exist then the charac just enter the game so we need to init his position
            if (position === undefined || position === null) {
              charWhoMoved.myPos = {x :player.x, y: player.y, Zone: player.Zone, charPos: charWhoMoved.id};
              charWhoMoved.save();
            } else {
              position.x = player.x;
              position.y = player.y;
              position.Zone = player.Zone;
              position.save(console.log('New position saved'));
              charWhoMoved.myPos = {x :player.x, y: player.y, Zone: player.Zone, charPos: charWhoMoved.id};
            }
            //Tell the other one player move exept the current player
            sails.sockets.broadcast(req.param('gameGuid'), 'Games:playerMove', charWhoMoved, req);
            res.ok();
          }
        })
      });
    }
  }
};

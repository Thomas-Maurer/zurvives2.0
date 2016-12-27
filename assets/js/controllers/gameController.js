
zurvives.controller('gameController', function ($scope, $location, $http, $q, userServices, toastr, $state) {
    $scope.players = [];
    $scope.listplayer = [];
    $scope.listZombies = [];
    $scope.yourTurn = false;
    $scope.actions = 3;
    $scope.alreadyMove = false;
    $scope.alreadyLoot = false;
    $scope.mapfullyload = false;

    $scope.$on('$destroy', function() {
      io.socket.removeAllListeners();
    });

    toastr.options = {
      "closeButton": false,
      "debug": false,
      "newestOnTop": false,
      "progressBar": true,
      "positionClass": "toast-top-center",
      "preventDuplicates": false,
      "onclick": null,
      "showDuration": "300",
      "hideDuration": "1000",
      "timeOut": "5000",
      "extendedTimeOut": "1000",
      "showEasing": "swing",
      "hideEasing": "linear",
      "showMethod": "fadeIn",
      "hideMethod": "fadeOut"
    };

    //Return Game informations
    $scope.getCurrentGameInfo = function () {
      var defer = $q.defer();
      $http({
        method: 'GET',
        url: '/games/getCurrentGame'
      }).then(function successCallback(response) {
        defer.resolve(response);
      }, function errorCallback(response) {
        defer.resolve(response);
      });
      return defer.promise;
    };

    //Send informations from the current game to the client
    $scope.getCurrentGameInfo().then(function (currentGame){
      userServices.then(function (currentUser){
        $scope.user = currentUser.data;
      });
      $scope.players = currentGame.data.listPlayers;
      $scope.currentGame = currentGame.data;
    });
//Return true if its the player turn
    $scope.checkIfPlayerTurn = function () {
      var defer = $q.defer();
        io.socket.get('/games/checkPlayerTurn', function (currentPlayerTurn, jwres){
          defer.resolve(currentPlayerTurn.playerTurn);
        });
        return defer.promise;
    };

    $scope.canPerformAction = function () {
        return $scope.actions > 0;
    };
    //End the currentPlayer Turn
    $scope.endTurn = function () {
      $scope.checkIfPlayerTurn().then(function (currentPlayerTurn) {
        if (currentPlayerTurn) {
            $scope.actions = 0;
            var indexOfCurrentPlayer =_.findIndex($scope.players, _.findWhere($scope.players, {email: $scope.user.email}));
            var data = {currentplayer: indexOfCurrentPlayer, guid: $scope.currentGame.guid, actionsLeft: $scope.actions};
            //socket.emit('game:player:endturn', data);
            console.log(indexOfCurrentPlayer);
            toastr["info"]("Turn ended");
        } else {
            toastr["warning"]("You can't end your turn when it's not your turn GENIUS");
            //flashService.emit("You can't end your turn when it's not your turn GENIUS");
        }
      });
    };
    //leave the game
    $scope.leaveGame = function () {
      io.socket.post('/games/leaveGame', {player: $scope.user, gameGuid: $scope.currentGame.guid}, function (data) {
        //Leave the current Game
        $state.go('userDashboard');
      })
    };

    /* == Socket Actions =*/
    io.socket.on('Games:newPlayerJoin', function (newPlayer) {
      $scope.color = '#'+(Math.random()*0xFFFFFF<<0).toString(16);
      newPlayer = newPlayer.user;
      if(_.findIndex($scope.players, {email: newPlayer.email}) === -1) {
        toastr["info"]("New player : " + newPlayer.email + " has joined the game");
        var condensedPlayers = [];
        _.each($scope.listplayer, function (player) {
          var condensedPlayer = {};
          condensedPlayer.name = player.name;
          condensedPlayer.x = player.x;
          condensedPlayer.Zone = player.Zone;
          condensedPlayer.y = player.y;
          condensedPlayers.push(condensedPlayer);
        });
        io.socket.post('/games/sendExistedPlayers', {existedPlayers: condensedPlayers, playerTosend: newPlayer.socketID}, function (res) {
          $scope.players.push(newPlayer);
        });
        $scope.initPlayer($scope.color, newPlayer.email);
      }
    });

    io.socket.on('Games:playerLeave', function (Player) {
      Player = Player.user;
      if(_.findIndex($scope.players, {email: Player.email}) !== -1) {
        toastr["info"]("Player : " + Player.email + " has leave the game");
        $scope.players = _.reject($scope.players, {id: Player.id});
      }
    });

    io.socket.on('Games:mapLoaded', function (Player) {
      $scope.color = '#'+(Math.random()*0xFFFFFF<<0).toString(16);
      $scope.initPlayer($scope.color, $scope.user.email);
      _.each($scope.tempListPlayers, function (player) {
        $scope.color = '#'+(Math.random()*0xFFFFFF<<0).toString(16);
        $scope.initPlayerToMap($scope.color, player.name, player.x, player.y, player.Zone);
      });
      $scope.mapfullyload = true;
      $scope.$apply();
    });

    io.socket.on('Games:addExistPlayerTotheGame', function (Players) {
      console.log(Players);
      $scope.tempListPlayers = Players;
    });

    io.socket.on('Games:playerMove', function (Player) {
      toastr['info']("Player : " + Player.name + " has mooved");debugger;
      var playerToMove = _.findWhere($scope.listplayer, {name: Player.name});
      $scope.moveToBroadcast(playerToMove, Player.x, Player.y);
    });

    /* == Movements = */
    $scope.canMoveTo = function canMoveTo(e) {
      $scope.checkIfPlayerTurn().then(function (currentPlayerTurn) {
        if (currentPlayerTurn && $scope.canPerformAction()) {
          var player = _.findWhere($scope.listplayer, {name: $scope.user.email});
          if (!$scope.alreadyMove && !$scope.alreadyLoot){
            var indexOfCurrentPlayer =_.findIndex($scope.players, _.findWhere($scope.players, {email: $scope.user.email}));
            var isNeighboor = $.inArray(parseInt(e.currentTarget.Zone), eval('$scope.neighboorZones[' + player.Zone + ']'));

            if(e.currentTarget.Zone && e.currentTarget.Zone !== player.Zone && isNeighboor !== -1 ) {
              var currentZone = _.findWhere($scope.zones, {Zone: player.Zone.toString()});
              currentZone.noise--;

              player.Zone = e.currentTarget.Zone;

              currentZone = _.findWhere($scope.zones, {Zone: player.Zone.toString()});
              currentZone.noise++;
              $scope.moveTo(player, (e.currentTarget.x/$scope.tileSize), (e.currentTarget.y/$scope.tileSize));

              var data = {player: {name: player.name, x: player.x, y: player.y, Zone: player.Zone}, gameGuid: $scope.currentGame.guid};

              //Tell the server the player moove
              io.socket.post('/games/player/move', data, function (res) {
                //Tell himself he mooves
                toastr['info']("You have moove");
              });

            } else {
                toastr['info']('You shall not pass');
            }
          }else {
              toastr['info']('You are trying to loot');
            $scope.lootIfYouCan(e.currentTarget.Zone, player.Zone);
          }
        }else {
            toastr['info']('cannot move not your turn');
        }
      });
    };

    /* == Loot = */

    $scope.lootIfYouCan = function (ZoneWhereYouWantToLoot, playerZone) {
        if (!$scope.alreadyLoot) {
            if (ZoneWhereYouWantToLoot === playerZone){
              io.socket.get('/games/zone/loot', {}, function (item) {
                if (item === null || item.name === null || item === undefined) {
                  toastr['info']("You have loot nothing ");
                } else {
                  toastr['info']("You have loot : " + item.name);
                  //TODO tell the server the player have loot something
                }
                $scope.alreadyLoot = true;
              });

            }else {
                toastr['info']("You are to far to loot");
            }
        }else {
            toastr['info']('You have already loot dont be so greedy !');

        }
    };

});


zurvives.controller('gameController', function ($scope, $location, $http) {
    $scope.players = [];
    $scope.listplayer = [];
    $scope.listZombies = [];
    $scope.actions = 3;
    $scope.alreadyMove = false;
    $scope.alreadyLoot = false;


    $scope.$on('$destroy', function (event) {
        socket.removeAllListeners();
    });

    $scope.checkIfPlayerTurn = function () {
        return $scope.currentGame.turnof === $scope.user.email;
    };

    $scope.canPerformAction = function () {
        return $scope.actions > 0;
    };

    $scope.endTurn = function () {
        if ($scope.currentGame.turnof === $scope.user.email) {
            $scope.actions = 0;
            var indexOfCurrentPlayer =_.findIndex($scope.players, _.findWhere($scope.players, {email: $scope.user.email}));
            var data = {currentplayer: indexOfCurrentPlayer, slug: $scope.slug, actionsLeft: $scope.actions};
            socket.emit('game:player:endturn', data);
        } else {
            flashService.emit("You can't end your turn when it's not your turn GENIUS");
        }
    };


    /* == Movements = */


    /* == Loot = */

    $scope.lootIfYouCan = function (ZoneWhereYouWantToLoot, playerZone) {
        if (!$scope.alreadyLoot) {
            if (ZoneWhereYouWantToLoot === playerZone){
                $http.get('/api/equipment/random_equip').
                success(function(data, status, headers, config) {
                    $scope.alreadyLoot = true;
                    $scope.actions--;

                    equipmentService.create(data.equipments.id, $scope.currentChar.id);
                    //TODO Reload current char to update in html inventory
                    flashService.broadcast('Char ' + $scope.user.email + ' has looted '+ data.equipments.name);
                    flashService.emit('Char ' + $scope.user.email + ' has looted '+ data.equipments.name);

                    socket.emit('player:loot:addinvotory', {user: $scope.user.email, loot: data.equipments, slug: $scope.slug} );
                }).
                error(function(data, status, headers, config) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                });
            }else {
                flashService.emit("You are to far to loot");
            }
        }else {
            flashService.emit('You have already loot dont be so greedy !');

        }
    };

});
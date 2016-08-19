zurvives.controller('LobbyController', function($scope, $http, toastr, $q, $window, $uibModal, $state){
  $scope.listCurrentGames = [];
  $scope.selectedChar = {};
  $scope.connectedUser = {};
  $scope.myCharactersList = [];

//Load All data we need before load other function
  $scope.init = function () {
    var defer = $q.defer();
    $scope.getConnectedUserInfo().then(function (data){
      if (data.data !== null && data.data !== undefined) {
        $scope.connectedUser = data.data;
        angular.forEach($scope.connectedUser.characters, function (character, key) {
          $scope.myCharactersList.push(character);
        });
        $scope.logged = true;
      } else {
        //Redirect the user to the Homepage if he is not logged
        io.socket.get('/me', function (resData, jwres){
          console.log(resData);
        });
      }
      defer.resolve(true);
    });
    $scope.getlistGames().then(function (data){
      if (data.data !== null && data.data !== undefined) {
        $scope.listCurrentGames = data.data;
      }
      defer.resolve(true);
    });
    return defer.promise;
  };

  //Return all games
  $scope.getlistGames = function () {
    var defer = $q.defer();
    $http({
      method: 'GET',
      url: '/games/getGamesRunning'
    }).then(function successCallback(response) {
      defer.resolve(response);
    }, function errorCallback(response) {
      defer.resolve(response);
    });
    return defer.promise;
  };

  //Get user info
  //Return user information
  $scope.getConnectedUserInfo = function () {
    var defer = $q.defer();
    $http({
      method: 'GET',
      url: '/me'
    }).then(function successCallback(response) {
      defer.resolve(response);
    }, function errorCallback(response) {
      defer.resolve(response);
    });
    return defer.promise;
  };

//create Game
  $scope.openModalChooseChar = function () {
    var modalInstance = $uibModal.open({
      animation: true,
      templateUrl: '/currentGame/gameConfig',
      controller: 'ModalSelectChar',
      size: 'lg',
      scope: $scope
    });
    modalInstance.result.then(function (selectedChar) {
      //Do stuff after we close the modal
      if (selectedChar !== null) {
        //get the char the user choose
        $scope.selectedChar = selectedChar;
        var gameGuid = guid();
        console.log($scope.connectedUser);
        io.socket.post('/games/create',{guid: gameGuid, name: 'gameName', listChar: [$scope.selectedChar], listPlayers: [$scope.connectedUser]} ,function (resData, jwres){
          //Connect the user to the game he creates
          //$window.location.href = "/games/play/" + gameGuid;
          $state.go('currentGame', {gameGuid: gameGuid});
        });
      }

    });
  };

  //Generate Unique Guid
  function guid() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}

  //Need to rework !
  $scope.joinGame = function (gameGuid) {
    var modalInstance = $uibModal.open({
      animation: true,
      templateUrl: '/currentGame/gameConfig',
      controller: 'ModalSelectChar',
      size: 'lg',
      scope: $scope
    });
    modalInstance.result.then(function (selectedChar) {
      //Do stuff after we close the modal
      if (selectedChar !== null) {
        //get the char the user choose
        $scope.selectedChar = selectedChar;
        io.socket.post('/games/joinGame/', {gameGuid: gameGuid, charSelected: $scope.selectedChar, newPlayer: $scope.connectedUser},function (resData, jwres){
          io.socket.get('/games/newPlayer/', {gameGuid: gameGuid, newPlayer: $scope.connectedUser}, function (resData, jwres){
            $state.go('currentGame', {gameGuid: gameGuid});
          });

        });
      }

    });
  };

  $scope.connectToRoom = function (name) {

  };

  $scope.init().then(function(data) {
    //Stuff we want to do after we Load the current connected user
  });

  io.socket.on('userLogin', function () {
    console.log("User login");
    $scope.init();
  });

  io.socket.on('userLogout', function () {
    console.log("User logout");
    $window.location.href = "/";
  });

  //On new game refresh the lobby
  io.socket.on('newGameCreated', function () {
    console.log("new Game Created");
    $scope.myCharactersList = [];
    $scope.init();
  });

});

zurvives.controller('ModalSelectChar', ['$scope', '$uibModalInstance', function ($scope, $uibModalInstance, scope) {

  $scope.listChars = $scope.$parent.myCharactersList;
  $scope.selectedChar = null;

  $scope.ok = function () {
    $uibModalInstance.close($scope.listChars[$scope.selectedChar]);
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
}]);

zurvives.controller('LobbyController', function($scope, $http, toastr, $q, $window, $uibModal){
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
        io.socket.post('/games/create',{name: 'TestGame', listChar: [$scope.selectedChar], listPlayers: [$scope.connectedUser]} ,function (resData, jwres){
          console.log(resData);
        });
      }

    });
  };

  //Need to rework !
  $scope.joinGame = function (gameName) {
    io.socket.get('/games/play/' + gameName ,function (resData, jwres){
      $window.location.href = "/games/play/" + gameName;
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

zurvives.controller('UserController', function($scope, $http, toastr, $q, $window){
  $scope.characterInfo = {};
  $scope.myCharactersList = [];
  $scope.connectedUser = {};
  $scope.logged = false;
  $scope.Stats = [];
  $scope.characterInfo.stats = [];
  $scope.characterInfo.life = 100;
  $scope.characterInfo.nbPointsStats = 10;

  $scope.createCharacter = function () {
    if ($scope.characterInfo.nbPointsStats === 0) {
      $scope.characterInfo.stats = $scope.Stats;
      $http.post('/character', $scope.characterInfo)
        .then(function onSuccess (){
          // tell the user his new char is created
          toastr.success('Character fully created', 'Success', {
            closeButton: true
          });
        })
        .catch(function onError(sailsResponse) {

          // Handle known error type(s).
          // Invalid username / password combination.
          if (sailsResponse.status === 400 || 404) {
            // $scope.loginForm.topLevelErrorMessage = 'Invalid email/password combination.';
            //
            toastr.error('Invalid parameters combination.', 'Error', {
              closeButton: true
            });
            return;
          }

          toastr.error('An unexpected error occurred, please try again.', 'Error', {
            closeButton: true
          });
          return;

        })
    }else {
      toastr.error('You need to spend all the points before you can create your character', 'Error');
    }
  };

  $scope.increaseStat = function (statId) {
    if ($scope.characterInfo.nbPointsStats - 1 >= 0){
      var index = _.findIndex($scope.Stats, function(o) { return o.id == statId; });
      $scope.Stats[index].value = $scope.Stats[index].value + 1;
      //if we increase vitality, increase the total life of our character
      if ($scope.Stats[index].name === 'vitality') {
        $scope.characterInfo.life = $scope.characterInfo.life + $scope.Stats[index].value * 10;
      }
      if ($scope.Stats[index].value < 0 ) {
        $scope.Stats[index].value = 0
      } else {
        $scope.characterInfo.nbPointsStats --;
      }
    } else {
      toastr.error('You don\'t have any points to spare', 'Error');
    }
  };

  $scope.decreaseStat = function (statId) {
    if ($scope.characterInfo.nbPointsStats +1 <= 10){
      var index = _.findIndex($scope.Stats, function(o) { return o.id == statId; });
      //if we increase vitality, increase the total life of our character
      if ($scope.Stats[index].name === 'vitality') {
        $scope.characterInfo.life = $scope.characterInfo.life - $scope.Stats[index].value * 10;
      }

      $scope.Stats[index].value = $scope.Stats[index].value - 1;
      if ($scope.Stats[index].value < 0 ) {
        $scope.Stats[index].value = 0
      } else {
        $scope.characterInfo.nbPointsStats ++;
      }
    } else {
      toastr.error('You don\'t have any points to take away', 'Error');
    }
  };

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
    $scope.getAllStats().then(function (data) {
      if (data.data !== null && data.data !== undefined) {
        _.forEach(data.data, function (value, key) {
          value.value = 0;
        });
        $scope.Stats = data.data;
      } else {

      }
      defer.resolve(true);
    });
    return defer.promise;
  };

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
  //Return Stats informations
  $scope.getAllStats = function () {
    var defer = $q.defer();
    $http({
      method: 'GET',
      url: '/stat/getAll'
    }).then(function successCallback(response) {
      defer.resolve(response);
    }, function errorCallback(response) {
      defer.resolve(response);
    });
    return defer.promise;
  };

  $scope.init().then(function(data) {
    //Stuff we want to do after we Load the current connected user
  });

//dashboard Feature
$scope.goToGameLobby = function (){
  $window.location.href = "/games/lobby";
};


  io.socket.on('userLogin', function () {
    console.log("User login");
    $scope.init();
  });

  io.socket.on('userLogout', function () {
    console.log("User logout");
    $window.location.href = "/";
  });

});

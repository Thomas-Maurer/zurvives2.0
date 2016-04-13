zurvives.controller('UserController', function($scope, $http, toastr, $q){
  $scope.characterInfo = {};
  $scope.myCharactersList = [];

  $scope.createCharacter = function () {
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

  $scope.init().then(function(data) {
    //Stuff we want to do after we Load the current connected user
  });

  io.socket.on('userLogin', function () {
    console.log("User login");
    $scope.init();
  });

  io.socket.on('userLogout', function () {
    console.log("User logout");
    $scope.init();
  });

});

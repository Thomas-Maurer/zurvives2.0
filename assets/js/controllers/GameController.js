zurvives.controller('GameController', function($scope, $http, toastr, $q, $window, $uibModal){
  $scope.listCurrentGames = [];
  $scope.selectedChar = {};

//Load All data we need before load other function
  $scope.init = function () {
    var defer = $q.defer();
    $scope.getlistGames().then(function (data){
      if (data.data !== null && data.data !== undefined) {
        $scope.listCurrentGames = data.data;
      }
      defer.resolve(true);
    });
    return defer.promise;
  };

  //Return user information
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

  $scope.openModalChooseChar = function () {
    var modalInstance = $uibModal.open({
      animation: true,
      templateUrl: 'myModalContent.html',
      controller: 'ModalSelectChar',
      size: size,
      resolve: {
        scope: function () {
          return $scope;
        }
      }
    });
    modalInstance.result.then(function (selectedChar) {
      $scope.selectedChar = selectedChar;
    });
  };
  //Return Stats informations

  $scope.init().then(function(data) {
    //Stuff we want to do after we Load the current connected user
    console.log($scope.listCurrentGames);
  });

  io.socket.on('userLogin', function () {
    console.log("User login");
    $scope.init();
  });

  io.socket.on('userLogout', function () {
    console.log("User logout");
    $window.location.href = "/";
  });

});

zurvives.controller('ModalSelectChar', function ($scope, $uibModalInstance, scope) {

  $scope.ok = function () {
    $uibModalInstance.close($scope.selected.item);
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
});

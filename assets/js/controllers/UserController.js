zurvives.controller('UserController', function($scope, $http){
  $http.get('/user')
    .success(function(data){
      $scope.users = data;
    });

});

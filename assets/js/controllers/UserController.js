zurvives.controller('UserController', function($scope, $http){
  $http.get('/user')
    .success(function(data){
      $scope.users=data;
      console.log($scope.users);
    });

});

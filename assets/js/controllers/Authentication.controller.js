zurvives.controller('AuthenticationController', function($scope, $http, toastr, $q){

  $scope.loginForm = {};
  $scope.loginForm.loading = false;
  $scope.logged = false;
  $scope.connectedUser = {};

//Load All data we need before load other function
  $scope.init = function () {
    var defer = $q.defer();
    $scope.getConnectedUserInfo().then(function (data){
      $scope.connectedUser = data;
      $scope.logged = true;

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

  $scope.submitLoginForm = function () {
    // Set the loading state (i.e. show loading spinner)
    $scope.loginForm.loading = true;

    // Submit request to Sails.
    $http.put('/login', {
      email: $scope.loginForm.email,
      password: $scope.loginForm.password
    })
      .then(function onSuccess (){
        // Refresh the page now that we've been logged in.
        $scope.logged = true;
        window.location = '/';
      })
      .catch(function onError(sailsResponse) {

        // Handle known error type(s).
        // Invalid username / password combination.
        if (sailsResponse.status === 400 || 404) {
          // $scope.loginForm.topLevelErrorMessage = 'Invalid email/password combination.';
          //
          toastr.error('Invalid email/password combination.', 'Error', {
            closeButton: true
          });
          return;
        }

        toastr.error('An unexpected error occurred, please try again.', 'Error', {
          closeButton: true
        });
        return;

      })
      .finally(function eitherWay(){
        $scope.loginForm.loading = false;
      });
  };


  $scope.init().then(function(data) {
    //Stuff we want to do after we Load the current connected user
  });
});

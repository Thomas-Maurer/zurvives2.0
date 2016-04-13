zurvives.controller('AuthenticationController', function($window ,$scope, $http, toastr, $q){

  $scope.loginForm = {};
  $scope.logoutForm = {};
  $scope.signupForm = {};
  $scope.loginForm.loading = false;
  $scope.logoutForm.loading = false;
  $scope.signupForm.loading = false;
  $scope.logged = false;


  //Return user information to check if he is connected or not
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

  $scope.getConnectedUserInfo().then(function (data){
    if (data.data !== null && data.data !== undefined) {
      //User Connected
      $scope.logged = true;
    } else {

    }
  });

  $scope.submitLoginForm = function () {
    // Set the loading state (i.e. show loading spinner)
    $scope.loginForm.loading = true;

    // Submit request to Sails.
    $http.put('/login', {
      email: $scope.loginForm.email,
      password: $scope.loginForm.password
    })
      .then(function onSuccess (data){
        $scope.logged = true;
        // Refresh the page now that we've been logged in.
        io.socket.put('/login', function (resData, jwres){
          console.log(resData);
        });
      })
      .catch(function onError(sailsResponse) {

        // Handle known error type(s).
        // Invalid username / password combination.
        if (sailsResponse.status === 400 || 404) {

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

  $scope.submitLogoutForm = function () {
    // Set the loading state (i.e. show loading spinner)
    $scope.logoutForm.loading = true;

    // Submit request to Sails.
    $http.get('/logout')
      .then(function onSuccess (){
        // Refresh the page now that we've been logged out.
        $scope.logged = false;
        // Refresh the page now that we've been logged out.
        io.socket.get('/logout', function (resData, jwres){
          console.log(resData);
        });
      })
      .catch(function onError(sailsResponse) {

        // Handle known error type(s).
        // Invalid username / password combination.
        if (sailsResponse.status === 400 || 404) {
          // $scope.loginForm.topLevelErrorMessage = 'Invalid email/password combination.';
          //
          toastr.error('Logout failed', 'Error', {
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
        $scope.logoutForm.loading = false;
      });
  };

  $scope.submitSignUpForm = function () {
    // Set the loading state (i.e. show loading spinner)
    $scope.signupForm.loading = true;

    // Submit request to Sails.
    $http.post('/signup', {
          email: $scope.signupForm.email,
          password: $scope.signupForm.password,
          name: $scope.signupForm.name
        })
        .then(function onSuccess (){
          toastr.success('Successfully signup', 'Success', {
            closeButton: true
          });
          $window.location.href = "/";

        })
        .catch(function onError(sailsResponse) {


          // Handle known error type(s).
          // Invalid username / password combination.
          if (sailsResponse.status === 400 || 404) {
            // $scope.loginForm.topLevelErrorMessage = 'Invalid email/password combination.';
            //
            //todo Add others Errors
            toastr.error(sailsResponse.data.Errors.email[0].message, 'Error', {
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
          $scope.signupForm.loading = false;
        });
  };

});

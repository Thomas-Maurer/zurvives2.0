zurvives.controller('AuthenticationController', function($window ,$scope, $http, toastr, $q){

  $scope.loginForm = {};
  $scope.logoutForm = {};
  $scope.signupForm = {};
  $scope.loginForm.loading = false;
  $scope.logoutForm.loading = false;
  $scope.signupForm.loading = false;
  $scope.logged = false;
  $scope.connectedUser = {};


//Load All data we need before load other function
  $scope.init = function () {
    var defer = $q.defer();
    $scope.getConnectedUserInfo().then(function (data){
      if (data.data !== null && data.data !== undefined) {
        $scope.connectedUser = data;
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

  $scope.submitLogoutForm = function () {
    // Set the loading state (i.e. show loading spinner)
    $scope.logoutForm.loading = true;

    // Submit request to Sails.
    $http.get('/logout')
      .then(function onSuccess (){
        // Refresh the page now that we've been logged out.
        $scope.logged = false;
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
    $http.post('user/create', {
          email: $scope.signupForm.email,
          password: $scope.signupForm.password,
          name: $scope.signupForm.name
        })
        .then(function onSuccess (){

          $scope.loginForm.email = $scope.signupForm.email;
          $scope.loginForm.password = $scope.signupForm.password;
          // Call submitLogin to log our new user
          $scope.submitLoginForm();
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


  $scope.init().then(function(data) {
    //Stuff we want to do after we Load the current connected user

    io.socket.on('test', function () {
      console.log('test');
    });
  });
});

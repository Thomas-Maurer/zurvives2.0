zurvives.controller('UserController', function($scope, $http, toastr){
  $scope.characterInfo = {};

  $scope.createCharacter = function () {
    $http.post('/character', {

    })
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
  }

});

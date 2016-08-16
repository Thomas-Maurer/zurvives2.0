zurvives.factory('userServices', function($http, $q){
  var defer = $q.defer();
  function getConnectedUserInfo () {
    $http({
      method: 'GET',
      url: '/me',
      cache: true
    }).then(function successCallback(response) {
      defer.resolve(response);
    }, function errorCallback(response) {
      defer.resolve(response);
    });
    return defer.promise;
  };

  return getConnectedUserInfo();

});

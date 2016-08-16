zurvives.controller('HomePageController', function($scope, $window){

    $scope.play = function () {
        $window.location.href = '/games/lobby'
    }

});

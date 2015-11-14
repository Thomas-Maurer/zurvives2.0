zurvives.controller('HomePageController', function($scope, $location){

    $scope.play = function () {
        $location.path('/play')
    }

});

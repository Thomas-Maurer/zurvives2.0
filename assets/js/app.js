'use strict';

var zurvives = angular.module('Zurvives', ['ngRoute', 'ui.bootstrap', 'toastr', 'ui.router'])
    .constant('_', window._);

zurvives.config(function($routeProvider, $locationProvider, $stateProvider) {
        // use the HTML5 History API
    $locationProvider.html5Mode({enabled: true, requireBase: false});

    $stateProvider
        .state('home', {
            url: "/",
            templateUrl: "/templates/homepage.ejs"
        })
        .state('userDashboard', {
          url: '/user/dashboard',
          templateUrl: '/templates/user/dashboard.ejs',
          onExit: removeAll
        })
        .state('gamesList', {
          url: '/games/lobby',
          templateUrl: '/templates/currentGame/listGames.ejs',
          onExit: removeAll
        })
        .state('currentGame', {
          url: "/games/play/:gameGuid",
          templateUrl: '/templates/currentGame/currentGame.ejs',
          controller: 'gameController',
          onExit: removeAll
        })
        ;

        var removeAll = function () {
          io.socket.removeAllListeners();
        };
});

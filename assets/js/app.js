'use strict';

var zurvives = angular.module('Zurvives', ['ngRoute', 'ui.bootstrap']);

zurvives.config(function($routeProvider, $locationProvider) {
        // use the HTML5 History API
    $locationProvider.html5Mode(true);
});
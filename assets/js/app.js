'use strict';

var zurvives = angular.module('Zurvives', ['ngRoute', 'ui.bootstrap', 'toastr'])
    .constant('_', window._);

zurvives.config(function($routeProvider, $locationProvider) {
        // use the HTML5 History API
    $locationProvider.html5Mode({enabled: true, requireBase: false});
});
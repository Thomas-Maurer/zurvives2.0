/**
 * grunt/pipeline.js
 *
 * The order in which your css, javascript, and template files should be
 * compiled and linked from your views and static HTML files.
 *
 * (Note that you can take advantage of Grunt-style wildcard/glob/splat expressions
 * for matching multiple files, and the ! prefix for excluding files.)
 */

// Path to public folder
var tmpPath = '.tmp/public/';

// CSS files to inject in order
//
// (if you're using LESS with the built-in default config, you'll want
//  to change `assets/styles/importer.less` instead.)
var cssFilesToInject = [
  'styles/**/*.css',
  'bower_components/bootstrap/dist/css/bootstrap.css',
  'bower_components/bootstrap-material-design/dist/css/material-fullpalette.css',
  'bower_components/bootstrap-material-design/dist/css/ripples.css',
  'bower_components/bootstrap-material-design/dist/css/roboto.css',
  'bower_components/angular-toastr/dist/angular-toastr.css'
];


// Client-side javascript files to inject in order
// (uses Grunt-style wildcard/glob/splat expressions)
var jsFilesToInject = [

  // Load sails.io before everything else
  'js/dependencies/sails.io.js',

  'bower_components/jquery/dist/jquery.js',
  'bower_components/angular/angular.js',
  'bower_components/angular-route/angular-route.js',
  'bower_components/angular-animate/angular-animate.js',
  'bower_components/bootstrap-material-design/dist/js/material.js',
  'bower_components/bootstrap-material-design/dist/js/ripples.js',
  'bower_components/bootstrap/dist/js/boostrap.js',
  'bower_components/angular-toastr/dist/angular-toastr.tpls.js',
  'bower_components/underscore/underscore.js',
  'bower_components/EaselJS/lib/easeljs-0.8.2.min.js',
  'bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js',

  // Dependencies like jQuery, or Angular are brought in here
  'js/dependencies/**/*.js',

  // All of the rest of your client-side js files
  // will be injected here in no particular order.
  'js/**/*.js',

  // Use the "exclude" operator to ignore files
  // '!js/ignore/these/files/*.js'
];


// Client-side HTML templates are injected using the sources below
// The ordering of these templates shouldn't matter.
// (uses Grunt-style wildcard/glob/splat expressions)
//
// By default, Sails uses JST templates and precompiles them into
// functions for you.  If you want to use jade, handlebars, dust, etc.,
// with the linker, no problem-- you'll just want to make sure the precompiled
// templates get spit out to the same file.  Be sure and check out `tasks/README.md`
// for information on customizing and installing new tasks.
var templateFilesToInject = [
  'templates/**/*.html'
];



// Prefix relative paths to source files so they point to the proper locations
// (i.e. where the other Grunt tasks spit them out, or in some cases, where
// they reside in the first place)
module.exports.cssFilesToInject = cssFilesToInject.map(transformPath);
module.exports.jsFilesToInject = jsFilesToInject.map(transformPath);
module.exports.templateFilesToInject = templateFilesToInject.map(transformPath);

// Transform paths relative to the "assets" folder to be relative to the public
// folder, preserving "exclude" operators.
function transformPath(path) {
  return (path.substring(0,1) == '!') ? ('!' + tmpPath + path.substring(1)) : (tmpPath + path);
}

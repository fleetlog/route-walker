# route-walker

Walks a route and does stuff.
[![Build Status](https://secure.travis-ci.org/jamesbloomer/node-walker.png?branch=master)](http://travis-ci.org/jamesbloomer/node-walker)

## Details
Calls Google Directions API for the given start and end point, decodes the polyline
passing through given waypoints and then calls a function for each point.

## Install
  npm install route-walker
  
## Usage
  ```javascript
  var walker = require('route-walker');

  var start = 'London,UK';
  var end = 'Birmingham,UK';
  
  walker.walk(start, end, function(location, done) {
      var lat = location.lat;
      var lng = location.lng;
      
      // Do your thing here...
      
      done();
  }, function(e) {
      // end of route...
  }
  , [waypoints]);
  ```
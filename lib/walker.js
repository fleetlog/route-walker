var util = require('util'),
request = require('request'),
async = require('async'),
qs = require("querystring");

var walker = {};

walker.walk = function(start, end, dostuff, done, waypoints) {
	var waypointsString = "";
	if (typeof waypoints == "object" && typeof waypoints.join == "function") {
		var waypointsCopy = waypoints.slice(0);
		for (var i = 0; i < waypoints.length; i++) {
			waypointsCopy[i] = "via:" + waypointsCopy[i];
		}
		waypointsString = waypointsCopy.join();
	}

	var directionsApiUrl = util.format('http://maps.googleapis.com/maps/api/directions/json?origin=%s&destination=%s&waypoints=optimize:true|%s', qs.escape(start), qs.escape(end), qs.escape(waypointsString));
	request(directionsApiUrl, function(error, response, body) {
		if(error) {
			done(error);
		}

		if(response.statusCode != 200) {
			done(response.statusCode);
		}

		var bodyObj = JSON.parse(body);
		if (bodyObj.error_message !== undefined) {
			done(bodyObj.error_message);
			return
		}
		var routes = bodyObj.routes;
		var legs = routes[0].legs;
		var steps = legs[0].steps;

		async.forEachSeries(steps, function(step, callback) {
			var points = step.polyline.points;
			var decodedPoints = walker.decodeLine(points);

			async.forEachSeries(decodedPoints, function(point, callback2) {
				dostuff({ lat: point[0], lng: point[1] }, callback2);
			}, callback);
		}, done);
	});
};

// This function is from Google's polyline utility
// Via http://facstaff.unca.edu/mcmcclur/GoogleMaps/EncodePolyline/decode.html
walker.decodeLine = function (encoded) {
	var len = encoded.length;
	var index = 0;
	var array = [];
	var lat = 0;
	var lng = 0;

	while (index < len) {
		var b;
		var shift = 0;
		var result = 0;

		do {
			b = encoded.charCodeAt(index++) - 63;
			result |= (b & 0x1f) << shift;
			shift += 5;
		} while (b >= 0x20);

		var dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
		lat += dlat;

		shift = 0;
		result = 0;

		do {
			b = encoded.charCodeAt(index++) - 63;
			result |= (b & 0x1f) << shift;
			shift += 5;
		} while (b >= 0x20);

		var dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
		lng += dlng;

		array.push([lat * 1e-5, lng * 1e-5]);
	}

	return array;
};

module.exports = walker;

/**
 * MapController
 *
 * @description :: Server-side logic for managing Maps
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var fs = require('fs'),
		path = require('path'),
		jf = require('jsonfile');
module.exports = {
	create: function (req, res) {
		fs.readFile('./assets/data/board.json', 'utf8', function (err, data) {
			currentMap = JSON.parse(data);
			tempMapData = currentMap;
			boardWidth = currentMap.width;
			currentLayer2d = [];
			layer2d = {};
			tempMapData.layers = [];
			//console.log(JSON.parse(JSON.parse(JSON.stringify(fs.readFileSync('./assets/data/board.json', 'utf8')))));
			//console.log(JSON.parse(data).layers);
			_.each(JSON.parse(data).layers, function (layer) {
				//console.log(layer);
				tempMapData.layers[layer.name] = layer.data;
			});

			console.log(tempMapData.layers);
			/*
			tempMapData.layers.forEach(function (name, tile) {
				var currentLine = [];
				for (var i = 0; i <= tile.length; i++) {
					if( i%boardWidth === 0 && i !== 0) {
						currentLayer2d.push(currentLine);
						currentLine = [];
					}
					currentLine.push(tile[i]);
				};
				layer2d[name] = currentLayer2d;
				currentLayer2d = [];
			})
*/

			res.json({map: tempMapData, layer2d: layer2d});
		});
	},

	getLayers: function (req, res) {
			var currentMap = req.body,
					tempMapData = currentMap;
			//console.log(currentMap);

			currentMap.layers.forEach(function(layer) {
				tempMapData.layers[layer.name] = layer.data;
			});

			res.json(tempMapData);

	}
};

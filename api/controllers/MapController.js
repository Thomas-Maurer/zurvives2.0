/**
 * MapController
 *
 * @description :: Server-side logic for managing Maps
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var fs = require('fs'),
		path = require('path'),
		bfj = require('bfj');
module.exports = {
	create: function (req, res) {
		var layer2d = {},
				currentLayer2d = [],
				tempMapData = {},
				boardWidth = 0;
				tempLayers = [];

		bfj.parse(fs.createReadStream('./assets/data/board.json'))
	  .then(data => {
			tempMapData = data;
			boardWidth = tempMapData.width;

			_.each(tempMapData.layers, function (layer) {
				tempLayers.push({'name': layer.name, 'tiles': layer.data});
			});

			tempLayers.forEach(function (layer) {
				var currentLine = [];
				for (var i = 0; i <= layer.tiles.length; i++) {
					if( i%boardWidth === 0 && i !== 0) {
						currentLayer2d.push(currentLine);
						currentLine = [];
					}
					currentLine.push(layer.tiles[i]);
				};
				layer2d[layer.name] = currentLayer2d;
				currentLayer2d = [];
			});
			console.log('sendJson');
			res.json({map: tempMapData, layer2d: layer2d});
	  })
	  .catch(error => {
			console.log('error');
			console.log(error);
			res.json(error);
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

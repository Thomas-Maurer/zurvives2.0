/**
 * MapController
 *
 * @description :: Server-side logic for managing Maps
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var fs = require('fs'),
		path = require('path'),
		bfj = require('bfj'),
		jf = require('jsonfile');
module.exports = {
	create: function (req, res) {
		var layer2d = {},
				currentLayer2d = [],
				tempMapData = {},
				boardWidth = 0;

		bfj.parse(fs.createReadStream('./assets/data/board.json'))
	  .then(data => {
			tempMapData = data;
			boardWidth = tempMapData.width;

			_.each(data.layers, function (layer) {
				tempMapData.layers[layer.name] = layer.data;
			});

			_.each(tempMapData.layers, function (name, tile) {
				console.log(name);
				console.log(tile);
				var currentLine = [];
				for (var i = 0; i <= layer.tile.length; i++) {
					if( i%boardWidth === 0 && i !== 0) {
						currentLayer2d.push(currentLine);
						currentLine = [];
					}
					currentLine.push(layer.tile[i]);
				};
				layer2d[name] = currentLayer2d;
				currentLayer2d = [];
			})

			res.json({map: data, layer2d: layer2d});
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

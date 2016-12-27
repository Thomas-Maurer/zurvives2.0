zurvives.factory('boardData', function($http, $q){
  return {
    setJson: function(data) {
      this.dataJson = data;
    },
    getJson: function(){
      var deferred = $q.defer();
      $http({method: 'GET', url: '/data/board.json'})
      .then(function successCallback(response) {
        deferred.resolve(response.data);
      }, function errorCallback(response) {
        deferred.reject(response);
      });
      return deferred.promise;
    },
    getLayers: function() {
      var that = this;
      this.layers = {};
      this.dataJson.layers.forEach(function(layer) {
        that.layers[layer.name] = layer.data;
      });
    },
    transformLayers: function() {
      var that = this;
      var boardWidth = this.dataJson.width;
      var currentLayer2d = [];
      this.layer2d = {};
      $.each(this.layers, function(name, tile) {
        var currentLine = [];
        for (var i = 0; i <= tile.length; i++) {
          if( i%boardWidth === 0 && i !== 0) {
            currentLayer2d.push(currentLine);
            currentLine = [];
          }
          currentLine.push(tile[i]);
        };
        that.layer2d[name] = currentLayer2d;
        currentLayer2d = [];
      });
    }
  }
});

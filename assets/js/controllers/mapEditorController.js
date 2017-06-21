zurvives.controller('mapEditorController', function ($scope, $location, $http, $q, userServices, toastr, $state) {

  /*

  Allows you to create custom maps for the classic board game HeroQuest.  Part of a full HTML5 game that has been 'coming soon' for several years. It is mostly an exercise in UI design and teaching myself JS web apps.
  (See: http://www.rockpapershotgun.com/2011/08/27/cardboard-children-heroquest)
  "My whole gaming life has been one long attempt to recapture the magic of Hero Quest." - Daiv (sums it up)

  */

  /*****************************

  POSSIBLE ENHANCEMENTS
  - auto save current map to cookie/local storage?
  - drag to re-size control panel
  - select specific single (floor) tile offset
  - review creature images
  - convert $scope.campaignData to JSON (probably not, data might change completely anyway in actual game)
  - zoom in and out with mouse wheel (just use Browser zoom, better, easier!)
  - BUG: control btns/swatches should not be selectable before tile swatches load

  ******************************/

  // DEPENDENCIES:
  //  jQuery (latest)
  //  Bootstrap (3.1.0, all components)
  //  Pt.js (Pen)
  //  $scope.campaignData.js (Pen)
  //  FileSaver.js (to save map files, https://github.com/eligrey/FileSaver.js)
  //  Panel UI (Pen)

  // Much of the JS below is written in a way that would make baby jesus cry, I acknowledge that and endeavour to improve on my next project :)

  //var UNIT = $scope.campaignData.campaignSettings.gridSize;
  var UNIT = 70;
  var Pt = function(x,y) {
  this.x = x;
  this.y = y;
  this.equalTo = function(pt) {
    if( this.x == pt.x && this.y == pt.y ) {
      return true;
    } else {
      return false;
    }
  };
};
  $scope.Main = {

    curCell: new Pt(0,0),
    offset: new Pt(0,0),
    curTileClass: null,
    curTileData: null,
    tileType: null,      // [ "floors", "walls", "triggers", "furniture", "creatures" ]
    paintMode: null,     // [ "random", x:y", "whole" ]
    rotationMode: null,  // [ "random", 0, 90, 180, 270 ]
    groupCounter: 0,

    cursor: {
      enable: function() {
        $("body").on( "mousemove", ".Grid", $scope.Main.cursor.run );
        $('.Grid').css( 'cursor', 'cell' );
        $(".Grid-selector").css({
          "left": ($scope.Main.curCell.x * UNIT) + $scope.Main.offset.x,
          "top":  ($scope.Main.curCell.y * UNIT) + $scope.Main.offset.y
        }).show();
      },
      disable: function() {
        $("body").off( "mousemove", ".Grid", $scope.Main.cursor.run );
        $(".Grid-selector").hide();
      },
      run: function(e) {
        var hoverCell = new Pt(
          Math.floor( (e.pageX - $scope.Main.offset.x) / UNIT ),
          Math.floor( (e.pageY - $scope.Main.offset.y) / UNIT )
        );
        var pos = new Pt(
          (e.pageX-$scope.Main.offset.x) - hoverCell.x*UNIT,
          (e.pageY-$scope.Main.offset.y) - hoverCell.y*UNIT
        );
        $(".Grid-selector").css({
          "left": (hoverCell.x * UNIT) + $scope.Main.offset.x,
          "top":  (hoverCell.y * UNIT) + $scope.Main.offset.y
        });
      },
      redraw: function() {
        //console.log( "cursor.redraw()" );
        if( $scope.Main.paintMode == "whole" ) {
          $(".Grid-selector").css({ "width":$scope.Main.curTileData.width, "height":$scope.Main.curTileData.height });
        } else {
          $(".Grid-selector").css({ "width":UNIT, "height":UNIT });
        }
        if( $scope.Main.rotationMode == "random" ) {
          $(".Grid-selector").css({ "transform":"rotate(0deg)" });
        } else {
          $(".Grid-selector").css({ "transform":"rotate("+parseInt($scope.Main.rotationMode)+"deg)" });
        }
      }
    },

    modify: {
      enable: function() {
        $(".Grid").on( "mousedown", $scope.Main.modify.start );
        $(".Grid").on( "mouseup", $scope.Main.modify.end );
        $(".Grid").on("contextmenu", function () { return false; });
      },
      disable: function() {
        $(".Grid").off( "mousedown", $scope.Main.modify.start );
        $(".Grid").off( "mousemove", $scope.Main.modify.run );
      },
      start: function(e) {
        var hoverCell = new Pt(
          Math.floor( (e.pageX - $scope.Main.offset.x) / UNIT ),
          Math.floor( (e.pageY - $scope.Main.offset.y) / UNIT )
        );
        $scope.Main.curCell = hoverCell;
        if( e.which == 1 ) {
          $scope.Main.addTiles($scope.Main.curTileClass, $scope.Main.getSet(), $scope.Main.paintMode, $scope.Main.rotationMode);
        } else if ( e.which == 3 ) {
          $(".Grid-selector").removeClass("addMode").addClass("deleteMode").hide().show(1);
          $scope.Main.deleteTiles($scope.Main.curTileClass, $scope.Main.getSet());
        }
        $(".Grid").on( "mousemove", $scope.Main.modify.run );
      },
      run: function(e) {
        var hoverCell = new Pt(
          Math.floor( (e.pageX - $scope.Main.offset.x) / UNIT ),
          Math.floor( (e.pageY - $scope.Main.offset.y) / UNIT )
        );
        if( !$scope.Main.curCell.equalTo(hoverCell) ) {
          $scope.Main.curCell = hoverCell;
          if( e.which == 1 ) {
            $scope.Main.addTiles($scope.Main.curTileClass, $scope.Main.getSet(), $scope.Main.paintMode, $scope.Main.rotationMode);
          } else if ( e.which == 3 ) {
            $scope.Main.deleteTiles($scope.Main.curTileClass, $scope.Main.getSet());
          }
        }
      },
      end: function(e) {
        $(".Grid-selector").removeClass("deleteMode").addClass("addMode").hide().show(1);
      }
    },

    pan: {
      lastPt: new Pt(0,0),
      enable: function() {
        $(document).on( "keydown", $scope.Main.pan.start );
        $(document).on( "keyup", $scope.Main.pan.disable );
      },
      disable: function(e) {
        if( e.which == 32 ) {
          e.preventDefault();
          $(".Grid").off( "mousedown", $scope.Main.pan.begin );
          $(".Grid").off( "mouseup", $scope.Main.pan.stop );
          $scope.Main.cursor.enable();
          $scope.Main.modify.enable();
        }
      },
      start: function(e) {
        if( e.which == 32 ) {
          e.preventDefault();
          $scope.Main.cursor.disable();
          $scope.Main.modify.disable();
          $('.Grid').css( 'cursor','all-scroll' );
          $(".Grid").on( "mousedown", $scope.Main.pan.begin );
          $(".Grid").on( "mouseup", $scope.Main.pan.stop );
        }
      },
      begin: function(e) {
        $scope.Main.pan.lastPt = new Pt(e.pageX,e.pageY);
        $(".Grid").on( "mousemove", $scope.Main.pan.run );
      },
      run: function(e) {
        $scope.Main.offset.x += ( e.pageX - $scope.Main.pan.lastPt.x );
        $scope.Main.offset.y += ( e.pageY - $scope.Main.pan.lastPt.y );
        $(".Tiles").css({
          "left": $scope.Main.offset.x,
          "top":  $scope.Main.offset.y,
        });
        $(".Grid").css( "background-position", $scope.Main.offset.x+"px "+$scope.Main.offset.y+"px" );
        $scope.Main.pan.lastPt = new Pt(e.pageX,e.pageY);
      },
      stop: function(e) {
        $(".Grid").off( "mousemove", $scope.Main.pan.run );
      },
      setOffset: function(x,y) {
        $scope.Main.offset.x = x;
        $scope.Main.offset.y = y;
        $(".Tiles").css({
          "left": $scope.Main.offset.x,
          "top":  $scope.Main.offset.y,
        });
        $(".Grid").css( "background-position", $scope.Main.offset.x+"px "+$scope.Main.offset.y+"px" );
        console.log("pan.setOffset("+x+","+y+")");
      }
    },

    keylisten: {
      enable: function() {
        $(document).on( "keyup", $scope.Main.keylisten.run );
      },
      disable: function() {
        $(document).off( "keyup", $scope.Main.keylisten.run );
      },
      run: function(e) {
        switch(e.which) {
          case 68: case 39: $scope.Main.setRotationMode("0"); break;
          case 83: case 40: $scope.Main.setRotationMode("90"); break;
          case 65: case 37: $scope.Main.setRotationMode("180"); break;
          case 87: case 38: $scope.Main.setRotationMode("270"); break;
          case 82: $scope.Main.setRotationMode("random"); break;
          case 90: $scope.Main.setPaintMode("random"); break;
          case 88: $scope.Main.setPaintMode("0:0"); break;
          case 67: $scope.Main.setPaintMode("whole"); break;
          case 49: $scope.Main.selectTab("tab-floors"); break;
          case 50: $scope.Main.selectTab("tab-walls"); break;
          case 51: $scope.Main.selectTab("tab-triggers"); break;
          case 52: $scope.Main.selectTab("tab-furniture"); break;
          case 53: $scope.Main.selectTab("tab-creatures"); break;
        }
      }
    },

    zoom: {
      enable: function() {
        // set intitial grid size
        /*var count = 5;
        var val =
        UNIT*count +"px "+ UNIT*count +"px, "+
        UNIT*count +"px "+ UNIT*count +"px, "+
        UNIT +"px "+ UNIT +"px, "+
        UNIT +"px "+ UNIT +"px";*/
        //console.log( $(".Grid").css("backgroundSize") );
        //$(".Grid").css({"backgroundSize": val});
        //console.log( val );
      }
    },

    getTilesAt: function(pt) {
      var list = [];
      $(".Tile[data-x='"+pt.x+"'][data-y='"+pt.y+"']").each( function() {
        var classNames = this.className.split(" ");
        for( var i=0 ; i<classNames.length ; i++ ) {
          if( classNames[i].match(/Tile-\w+/) ) {
            list.push( { "type":classNames[i], "rot":$(this).attr("data-rotation") } );
          }
        }
      });
      console.log( "tilesAt("+pt.x+","+pt.y+") = "+JSON.stringify(list) );
      return list;
    },

    getSet: function() {
      if( $scope.Main.paintMode != "whole" ) {
        return [new Pt($scope.Main.curCell.x,$scope.Main.curCell.y)];
      } else {
        var pts = [];
        if( $scope.Main.rotationMode == "90" ) {
          for( var x=0 ; x < $scope.Main.curTileData.unitHeight ; x++ ) {
            for( var y=0 ; y < $scope.Main.curTileData.unitWidth ; y++ ) {
              pts.push( new Pt( $scope.Main.curCell.x+(-x), $scope.Main.curCell.y+y ) );
            }
          }
        } else if( $scope.Main.rotationMode == "180" ) {
          for( var x=0 ; x < $scope.Main.curTileData.unitWidth ; x++ ) {
            for( var y=0 ; y < $scope.Main.curTileData.unitHeight ; y++ ) {
              pts.push( new Pt( $scope.Main.curCell.x+(-x), $scope.Main.curCell.y+(-y) ) );
            }
          }
        } else if( $scope.Main.rotationMode == "270" ) {
          for( var x=0 ; x < $scope.Main.curTileData.unitHeight ; x++ ) {
            for( var y=0 ; y < $scope.Main.curTileData.unitWidth ; y++ ) {
              pts.push( new Pt( $scope.Main.curCell.x+x, $scope.Main.curCell.y+(-y) ) );
            }
          }
        } else {
          for( var x=0 ; x < $scope.Main.curTileData.unitWidth ; x++ ) {
            for( var y=0 ; y < $scope.Main.curTileData.unitHeight ; y++ ) {
              pts.push( new Pt( $scope.Main.curCell.x+x, $scope.Main.curCell.y+y ) );
            }
          }
        }
        return pts;
      }
    },

    //lastTile: null,
    addTiles: function(tileType,pts,paintMode,rotMode) {
      $scope.Main.groupCounter++;
      console.log( "addTiles("+tileType+","+JSON.stringify(pts)+",paintMode:"+paintMode+",rotMode:"+rotMode+") group:"+$scope.Main.groupCounter );

      var lastTile;
      if( rotMode == '0' || rotMode == '180' ) {
        lastTile = new Pt(0,1);
      } else if ( rotMode == '90' || rotMode == '270' ) {
        lastTile = new Pt(1,0);
      }

      for( var i=0 ; i < pts.length ; i++ ) {
        // get rotation
        var rot;
        if( rotMode == 'random' ) {
          rot = Math.floor(Math.random()*4)*90;
        } else {
          rot = rotMode;
        }
        // get offset
        var off = new Pt(0,0);
        if( paintMode == 'random' ) {
          off.x = Math.floor( Math.random()*($scope.Main.curTileData.unitWidth+1) )*UNIT;
          off.y = Math.floor( Math.random()*($scope.Main.curTileData.unitHeight+1) )*UNIT;
        } else if ( paintMode == 'whole' ) {
          if( rotMode == '0' || rotMode == '180' ) {

            lastTile.y -= 1;
            if( lastTile.y <= -$scope.Main.curTileData.unitHeight ) {
              lastTile.x -= 1;
              lastTile.y = 0;
            }

          } else if ( rotMode == '90' || rotMode == '270' ) {

            lastTile.x -= 1;
            if( lastTile.x <= -$scope.Main.curTileData.unitWidth ) {
              lastTile.y -= 1;
              lastTile.x = 0;
            }

          } else {
            console.log( "Error: paintmode:whole, rotmode:random");
          }
          off.x = lastTile.x * UNIT;
          off.y = lastTile.y * UNIT;

        } else {
          var offset = paintMode.split(":");
          off.x = Math.floor(parseInt(offset[0])*$scope.Main.curTileData.width)*UNIT;
          off.y = Math.floor(parseInt(offset[1])*$scope.Main.curTileData.height)*UNIT;
        }
        $scope.Main.addTile(tileType,pts[i],rot,off,$scope.Main.groupCounter,$scope.Main.curTileData.path);
      }
    },

    addTile: function(tileType,pt,rot,off,grp,path,delay) {
      if(!delay) delay = 0;

      if( tileType=="Tile-wall" && rot=="180" ) {
        pt.x--; rot="0";
      } else if( tileType=="Tile-wall" && rot=="270" ) {
        pt.y--; rot="90";
      }

      // delete existing tile
      var overlayTiles = $scope.Main.getTilesAt(pt);
      if( overlayTiles.length > 0 ) {
        for( var i=0 ; i<overlayTiles.length ; i++ ) {
          if( overlayTiles[i].type==tileType ) {
            if( overlayTiles[i].type!="Tile-wall" ) {
              $scope.Main.deleteTile(tileType,pt);
            } else {
              if( rot == overlayTiles[i].rot ) {
                $scope.Main.deleteTile(tileType,pt,overlayTiles[i].rot);
              }
            }
          } else {
            if( (
              tileType=="Tile-creature" ||
              tileType=="Tile-furniture" ||
              tileType=="Tile-trigger"
            ) &&
            (
              overlayTiles[i].type=="Tile-creature" ||
              overlayTiles[i].type=="Tile-furniture" ||
              overlayTiles[i].type=="Tile-trigger"
            )
          ) {
            $scope.Main.deleteTile(overlayTiles[i].type,pt);
          }
        }
      }
    }

    // append tile
    var a = document.createElement('a');
    a.href = path;
    var id = a.pathname.split('/').pop();
    id = $.trim( id.substr(0, id.lastIndexOf('.')) );

    var html = "<div class='Tile "+tileType+"' data-x='"+pt.x+"' data-y='"+pt.y+"' data-group='"+grp+"' data-rotation='"+rot+"' data-id='"+id+"'></div>";

    var container;
    switch(tileType) {
      case "Tile-creature": container = "Tiles-creatures"; break;
      case "Tile-furniture": container = "Tiles-furniture"; break;
      case "Tile-trigger": container = "Tiles-triggers"; break;
      case "Tile-wall": container = "Tiles-walls"; break;
      case "Tile-floor": container = "Tiles-floors"; break;
      default: console.log("Error: type("+tileType+") unknown");
    }
    var $newTile = $(html).appendTo("."+container);

    // set tile props
    $newTile.css({
      "left": pt.x * UNIT,
      "top":  pt.y * UNIT,
      "background-image": "url('"+path+"')",
      "background-position": off.x +"px "+ off.y + "px",
      "transform": "rotate("+rot+"deg)",
      "display": "none"
    });

    setTimeout( function(){
      $newTile.css("display","block");
    }, delay, $newTile);


    console.log( "addTile("+tileType+","+JSON.stringify(pt)+",rot:"+rot+",off:"+JSON.stringify(off)+") of group:"+grp );
  },

  deleteTiles: function(tileType,pts) {
    if( $scope.Main.rotationMode != "none" ) {
      console.log( "deleteTiles("+tileType+","+JSON.stringify(pts)+")" );
      for( var i=0 ; i < pts.length ; i++ ) {
        $scope.Main.deleteTile(tileType,pts[i],$scope.Main.rotationMode);
      }
    }
  },

  deleteTile: function(tileType,pt,rot) {

    if( tileType=="Tile-wall" && rot=="180" ) {
      pt.x--; rot="0";
    } else if( tileType=="Tile-wall" && rot=="270" ) {
      pt.y--; rot="90";
    }

    if( tileType == "Tile-furniture" ) {
      var grp = $("."+tileType+"[data-x='"+pt.x+"'][data-y='"+pt.y+"']").attr("data-group");
      $("."+tileType+"[data-group='"+grp+"']").remove();
      console.log( "deleteTile("+tileType+",("+pt.x+","+pt.y+")) for ALL of group:"+grp );
    } else if( tileType == "Tile-wall" && rot!=undefined ) {

      $("."+tileType+"[data-x='"+pt.x+"'][data-y='"+pt.y+"'][data-rotation='"+rot+"']").remove();
      console.log( "deleteTile("+tileType+",("+pt.x+","+pt.y+"),rotation:"+rot+")" );

    } else {
      $("."+tileType+"[data-x='"+pt.x+"'][data-y='"+pt.y+"']").remove();
      console.log( "deleteTile("+tileType+",("+pt.x+","+pt.y+"))" );
    }
  },

  setTileProperties: function(type, index) {
    switch(type) {
      case "creatures": $scope.Main.curTileClass = "Tile-creature"; break;
      case "furniture": $scope.Main.curTileClass = "Tile-furniture"; break;
      case "triggers": $scope.Main.curTileClass = "Tile-trigger"; break;
      case "walls": $scope.Main.curTileClass = "Tile-wall"; break;
      case "floors": $scope.Main.curTileClass = "Tile-floor"; break;
      default: console.log("Error: type("+type+") unknown");
    }
    $scope.Main.curTileData = $scope.campaignData[type][index];
    $scope.Main.curTileData.class = $scope.Main.curTileClass;
    $scope.Main.cursor.redraw();
    console.log( "setTileProperties("+type+","+index+")" );
  },

  setRotationMode: function(mode) {
    var btnDisabled = false;
    if(
      mode=="random" && $("#radio-rotationRand").parent("label").hasClass("disabled") ||
      mode=="0" && $("#radio-rotation0").parent("label").hasClass("disabled") ||
      mode=="90" && $("#radio-rotation90").parent("label").hasClass("disabled") ||
      mode=="180" && $("#radio-rotation180").parent("label").hasClass("disabled") ||
      mode=="270" && $("#radio-rotation270").parent("label").hasClass("disabled")
    ) {
      btnDisabled = true;
    }
    if( !btnDisabled ) {
      console.log( "setRotationMode("+mode+")" );
      $scope.Main.rotationMode = mode;
      $scope.Main.cursor.redraw();
      $(".Panel-btnGrp--rotation label").removeClass("active");
      $(".Panel-btnGrp--rotation input").prop('checked', false);
      switch(mode) {
        case "random": $("#radio-rotationRand").prop('checked', true).parent('label').addClass("active"); break;
        case "0": $("#radio-rotation0").prop('checked', true).parent('label').addClass("active"); break;
        case "90": $("#radio-rotation90").prop('checked', true).parent('label').addClass("active"); break;
        case "180": $("#radio-rotation180").prop('checked', true).parent('label').addClass("active"); break;
        case "270": $("#radio-rotation270").prop('checked', true).parent('label').addClass("active"); break;
      }
      $(".Grid-selector").attr('data-rotationMode', $scope.Main.rotationMode);
    }
  },

  setPaintMode: function(mode) {
    var btnDisabled = false;
    if(
      mode=="random" && $("#radio-modeRand").parent("label").hasClass("disabled") ||
      mode=="0:0" && $("#radio-modeSingle").parent("label").hasClass("disabled") ||
      mode=="0:0" && $("#radio-modeSingle").parent("label").hasClass("active") ||
      mode=="whole" && $("#radio-modeWhole").parent("label").hasClass("disabled") ) {
        btnDisabled = true;
      }
      if( !btnDisabled ) {
        console.log( "setPaintMode("+mode+")" );
        $scope.Main.paintMode = mode;
        $scope.Main.cursor.redraw();
        $(".Panel-btnGrp--mode label").removeClass("active");
        $(".Panel-btnGrp--mode input").prop('checked', false);
        $("#radio-rotationRand").parent('label').removeClass("disabled");
        switch(mode) {
          case "random": $("#radio-modeRand").prop('checked', true).parent('label').addClass("active"); break;
          case "0:0": $("#radio-modeSingle").prop('checked', true).parent('label').addClass("active"); break;
          case "whole":
          $("#radio-modeWhole").prop('checked', true).parent('label').addClass("active");
          if($('#radio-rotationRand').is(':checked')) {
            $scope.Main.setRotationMode("0");
          }
          $("#radio-rotationRand").parent('label').addClass("disabled");
          break;
        }
        $(".Grid-selector").attr('data-paintMode', $scope.Main.paintMode);
      }
    },

    selectTab: function(tabId) {
      var type = tabId.replace("tab-","");
      console.log( "selectTab("+type+")");
      $scope.Main.tileType = type;
      var $t = $("#"+tabId);
      $(".Panel-paletteTabs li").removeClass("active");
      $t.parent("li").addClass("active");
      $(".Panel-palette").css("display","none");
      $(".Panel-btnGrp .btn").removeClass("active disabled");
      $(".Panel-btnGrp input").prop('checked',false).prop('disabled',false);
      switch(type) {
        case "floors":
        $("#palette-floors").css("display","flex");
        $scope.Main.setRotationMode("random");
        $scope.Main.setPaintMode("random");
        break;
        case "walls":
        $("#palette-walls").css("display","flex");
        $scope.Main.setRotationMode("0");
        $scope.Main.setPaintMode("0:0");
        $("#radio-rotationRand, #radio-modeRand, #radio-modeWhole").parent('label').addClass("disabled");
        break;
        case "triggers":
        $("#palette-triggers").css("display","flex");
        $scope.Main.setRotationMode("0");
        $scope.Main.setPaintMode("0:0");
        $("#radio-rotationRand, #radio-rotation90, #radio-rotation180, #radio-rotation270, #radio-modeRand, #radio-modeWhole").parent('label').addClass("disabled");
        break;
        case "furniture":
        $("#palette-furniture").css("display","flex");
        $scope.Main.setRotationMode("0");
        $scope.Main.setPaintMode("whole");
        $("#radio-rotationRand, #radio-modeRand, #radio-modeSingle").parent('label').addClass("disabled");
        break;
        case "creatures":
        $("#palette-creatures").css("display","flex");
        $scope.Main.setRotationMode("0");
        $scope.Main.setPaintMode("0:0");
        $("#radio-rotationRand, #radio-rotation90, #radio-rotation180, #radio-rotation270, #radio-modeRand, #radio-modeWhole").parent('label').addClass("disabled");
        break;
      }
      $scope.Main.loadPalette();
    },

    loadPalette: function() {
      if( $("#palette-"+$scope.Main.tileType).children(".Panel-paletteSwatch").length <= 0 ) {
        $.swatchPromise = function(src) {
          return $.Deferred( function(task) {
            var image = new Image();
            image.onload = function () { task.resolve(image); }
            image.onerror = function () { task.reject(); }
            image.src = src;
          }).promise();
        };
        var deferredSwatches = [];
        var data = $scope.campaignData[$scope.Main.tileType];
        for( var i=0 ; i<data.length ; i++ ) {
          deferredSwatches.push( $.swatchPromise(data[i].path) );
          $("#palette-"+$scope.Main.tileType).append( "<div class='Panel-paletteSwatch is-loading'></div>" );
        }
        $.when.apply($, deferredSwatches)
        .done( function() {
          for ( var i=0 ; i<arguments.length ; i++ ) {
            var img = arguments[i];
            var data = $scope.campaignData[$scope.Main.tileType][i];
            data.width = img.width;
            data.height = img.height;
            data.unitWidth = img.width/UNIT;
            data.unitHeight = img.height/UNIT;
            var $swatch = $("#palette-"+$scope.Main.tileType+" .Panel-paletteSwatch:eq("+i+")");
            $swatch.css( "background-image", "url('"+img.src+"')" );
            $swatch.attr( "type", $scope.Main.tileType );
            $swatch.click( function() {
              $scope.Main.setTileProperties( $(this).attr("type"), $(this).index() );
              $scope.Main.cursor.redraw();
            });
            $swatch.removeClass("is-loading");
          }
          $("#palette-"+$scope.Main.tileType+" .Panel-paletteSwatch:eq(0)").click();
          $scope.Main.cursor.redraw();
        });
      } else {
        $("#palette-"+$scope.Main.tileType+" .Panel-paletteSwatch:eq(0)").click();
      }
      console.log( "loadPalette("+$scope.Main.tileType+")" );
    },

    saveMap: function() {
      console.log("saveMap()");
      // count
      var minX, minY;
      minX = minY = Number.MAX_VALUE;
      $(".Tile").each( function() {
        var $t = $(this);
        minX = Math.min( parseInt($t.attr("data-x")), minX );
        minY = Math.min( parseInt($t.attr("data-y")), minY );
      });
      // get data
      var mapData = [];
      $(".Tile").each( function() {
        var $t = $(this);
        //get object at (x,y)
        var x = parseInt( $t.attr("data-x") ) - minX;
        var y = parseInt( $t.attr("data-y") ) - minY;
        if( mapData[x] == undefined ) mapData[x] = [];
        if( mapData[x][y] == undefined ) mapData[x][y] = {};
        //get tile type
        var type;
        if( $t.hasClass("Tile-creature") ) { type = "creature"; }
        else if( $t.hasClass("Tile-furniture") ) { type = "furniture"; }
        else if( $t.hasClass("Tile-trigger") ) { type = "trigger"; }
        else if( $t.hasClass("Tile-wall") ) {
          if( $t.attr("data-rotation") == "0" ) { type = "wall-right" }
          else if( $t.attr("data-rotation") == "90" ) { type = "wall-bottom" }
        }
        else if( $t.hasClass("Tile-floor") ) { type = "floor"; }
        mapData[x][y][type] = {};
        //get properties
        //mapData[x][y][type].id = $t.attr("data-id");  // should use this instead of path
        if( $t.hasClass("Tile-furniture") ) {
          mapData[x][y][type].group = $t.attr("data-group");
        }
        // get graphical properties
        mapData[x][y][type]["graphics"] = {};
        mapData[x][y][type]["graphics"].path = $t.css("background-image").replace('url(','').replace(')','');
        mapData[x][y][type]["graphics"].rotation = $t.attr("data-rotation");
        mapData[x][y][type]["graphics"].xOff = parseInt( $t.css('backgroundPosition').split(" ")[0] );
        mapData[x][y][type]["graphics"].yOff = parseInt( $t.css('backgroundPosition').split(" ")[1] );

      });
      return mapData;
    },

    loadMap: function(json) {
      console.log("loadMap");
      $('#modal-load').modal('hide');

      var mapData = $.parseJSON(json);
      //console.log( mapData );
      var count = 0;
      for( var x=0 ; x<mapData.length ; x++) {
        for( var y=0 ; y<mapData[x].length ; y++) {
          if( mapData[x][y] ) {

            for( var i in mapData[x][y] ) {

              var tileType;
              switch(i) {
                case "creature": tileType = "Tile-creature"; break;
                case "furniture": tileType = "Tile-furniture"; break;
                case "trigger": tileType = "Tile-trigger"; break;
                case "wall-right": tileType = "Tile-wall"; break;
                case "wall-bottom": tileType = "Tile-wall"; break;
                case "floor": tileType = "Tile-floor"; break;
                default: console.log("Error: type("+i+") unknown");
              }
              var pt = new Pt(x,y);
              var rot = mapData[x][y][i].graphics.rotation;
              var off = {};
              off.x = mapData[x][y][i].graphics.xOff;
              off.y = mapData[x][y][i].graphics.yOff;
              var grp = "-1";
              if( mapData[x][y][i].hasOwnProperty('group') ) grp = mapData[x][y][i].group;
              var path = mapData[x][y][i].graphics.path;

              count++;
              var delay = count*10;
              $scope.Main.addTile(tileType,pt,rot,off,grp,path,delay);
              //console.log( timeout );
            }

          }
        }
      }
    },

    enableControls: function() {
      $("#radio-rotationRand").change( function() { $scope.Main.setRotationMode("random"); });
      $("#radio-rotation0").change( function() { $scope.Main.setRotationMode("0"); });
      $("#radio-rotation90").change( function() { $scope.Main.setRotationMode("90"); });
      $("#radio-rotation180").change( function() { $scope.Main.setRotationMode("180"); });
      $("#radio-rotation270").change( function() { $scope.Main.setRotationMode("270"); });
      $(".Panel-paletteTabs a").click( function() { $scope.Main.selectTab($(this).attr("id")); });
      $("#radio-modeRand").change( function() { $scope.Main.setPaintMode("random"); });
      $("#radio-modeSingle").change( function() { $scope.Main.setPaintMode("0:0"); });
      $("#radio-modeWhole").change( function() { $scope.Main.setPaintMode("whole"); });
      $("#modalBtn-clearAll").click( function() {
        $(".Tiles").empty();
        $scope.Main.groupCounter = 0;
        console.log( "clearAllTiles()" );
      });
      $("#btn-save").click( function() {
        $("#modalTextarea-save").val( JSON.stringify($scope.Main.saveMap()) );
      });
      $("#modalBtn-save").click( function() {
        var text = $("#modalTextarea-save").val();
        var filename = $("#modalInput-fileName").val()
        var blob = new Blob([text], {type: "text/plain;charset=utf-8"});
        saveAs(blob, filename+".map.json");
      });
      $("#modalBtn-load").click( function() {
        var file = $('#modalInput-loadFile').get(0).files[0];
        if (file) {
          var reader = new FileReader();
          reader.onload = function(e) {
            $("#modalBtn-clearAll").click();
            $scope.Main.loadMap( e.target.result );
          }
          reader.readAsText(file);
        } else {
          console.log("Failed to load file");
        }
      });
    },

    init: function() {
      console.log("START");
      $scope.Main.pan.setOffset(280,0); //$scope.Main.pan.setOffset(350,70);
      $scope.Main.selectTab("tab-floors");
      $scope.Main.cursor.enable();
      $scope.Main.modify.enable();
      $scope.Main.keylisten.enable();
      $scope.Main.pan.enable();
      //$scope.Main.zoom.enable();
      $scope.Main.loadMap('[[null,{"wall-right":{"graphics":{"path":"http://www.davidelrizzo.com/heroquestonline/leveleditor/images/walls/stone.png","rotation":"0","xOff":0,"yOff":0}}},{"wall-right":{"graphics":{"path":"http://www.davidelrizzo.com/heroquestonline/leveleditor/images/walls/stone.png","rotation":"0","xOff":0,"yOff":0}}},{"wall-right":{"graphics":{"path":"http://www.davidelrizzo.com/heroquestonline/leveleditor/images/walls/stone.png","rotation":"0","xOff":0,"yOff":0}}},{"wall-right":{"graphics":{"path":"http://www.davidelrizzo.com/heroquestonline/leveleditor/images/walls/stone.png","rotation":"0","xOff":0,"yOff":0}}}],[{"wall-bottom":{"graphics":{"path":"http://www.davidelrizzo.com/heroquestonline/leveleditor/images/walls/stone.png","rotation":"90","xOff":0,"yOff":0}}},{"floor":{"graphics":{"path":"http://www.davidelrizzo.com/heroquestonline/leveleditor/images/floors/spiralstair.jpg","rotation":"0","xOff":0,"yOff":0}}},{"floor":{"graphics":{"path":"http://www.davidelrizzo.com/heroquestonline/leveleditor/images/floors/spiralstair.jpg","rotation":"0","xOff":0,"yOff":-70}}},{"floor":{"graphics":{"path":"http://www.davidelrizzo.com/heroquestonline/leveleditor/images/floors/bluegrey.jpg","rotation":"180","xOff":70,"yOff":210}}},{"wall-bottom":{"graphics":{"path":"http://www.davidelrizzo.com/heroquestonline/leveleditor/images/walls/stone.png","rotation":"90","xOff":0,"yOff":0}},"floor":{"graphics":{"path":"http://www.davidelrizzo.com/heroquestonline/leveleditor/images/floors/bluegrey.jpg","rotation":"180","xOff":210,"yOff":280}}}],[{"wall-bottom":{"graphics":{"path":"http://www.davidelrizzo.com/heroquestonline/leveleditor/images/walls/stone.png","rotation":"90","xOff":0,"yOff":0}}},{"floor":{"graphics":{"path":"http://www.davidelrizzo.com/heroquestonline/leveleditor/images/floors/spiralstair.jpg","rotation":"0","xOff":-70,"yOff":0}}},{"floor":{"graphics":{"path":"http://www.davidelrizzo.com/heroquestonline/leveleditor/images/floors/spiralstair.jpg","rotation":"0","xOff":-70,"yOff":-70}}},{"floor":{"graphics":{"path":"http://www.davidelrizzo.com/heroquestonline/leveleditor/images/floors/bluegrey.jpg","rotation":"180","xOff":210,"yOff":0}}},{"wall-bottom":{"graphics":{"path":"http://www.davidelrizzo.com/heroquestonline/leveleditor/images/walls/stone.png","rotation":"90","xOff":0,"yOff":0}},"floor":{"graphics":{"path":"http://www.davidelrizzo.com/heroquestonline/leveleditor/images/floors/bluegrey.jpg","rotation":"0","xOff":210,"yOff":210}}},{"wall-right":{"graphics":{"path":"http://www.davidelrizzo.com/heroquestonline/leveleditor/images/walls/stone.png","rotation":"0","xOff":0,"yOff":0}}}],[{"wall-bottom":{"graphics":{"path":"http://www.davidelrizzo.com/heroquestonline/leveleditor/images/walls/stone.png","rotation":"90","xOff":0,"yOff":0}}},{"floor":{"graphics":{"path":"http://www.davidelrizzo.com/heroquestonline/leveleditor/images/floors/bluegrey.jpg","rotation":"0","xOff":70,"yOff":140}}},{"creature":{"graphics":{"path":"http://www.davidelrizzo.com/heroquestonline/leveleditor/images/creatures/barbarian.png","rotation":"0","xOff":0,"yOff":0}},"floor":{"graphics":{"path":"http://www.davidelrizzo.com/heroquestonline/leveleditor/images/floors/bluegrey.jpg","rotation":"270","xOff":70,"yOff":70}}},{"floor":{"graphics":{"path":"http://www.davidelrizzo.com/heroquestonline/leveleditor/images/floors/bluegrey.jpg","rotation":"90","xOff":140,"yOff":210}}},{"floor":{"graphics":{"path":"http://www.davidelrizzo.com/heroquestonline/leveleditor/images/floors/bluegrey.jpg","rotation":"0","xOff":210,"yOff":70}}},{"furniture":{"group":"111","graphics":{"path":"http://www.davidelrizzo.com/heroquestonline/leveleditor/images/furniture/weaponrack.png","rotation":"270","xOff":0,"yOff":0}},"wall-bottom":{"graphics":{"path":"http://www.davidelrizzo.com/heroquestonline/leveleditor/images/walls/stone.png","rotation":"90","xOff":0,"yOff":0}},"floor":{"graphics":{"path":"http://www.davidelrizzo.com/heroquestonline/leveleditor/images/floors/bluegrey.jpg","rotation":"0","xOff":70,"yOff":280}}}],[{"wall-bottom":{"graphics":{"path":"http://www.davidelrizzo.com/heroquestonline/leveleditor/images/walls/stone.png","rotation":"90","xOff":0,"yOff":0}}},{"wall-right":{"graphics":{"path":"http://www.davidelrizzo.com/heroquestonline/leveleditor/images/walls/stone.png","rotation":"0","xOff":0,"yOff":0}},"floor":{"graphics":{"path":"http://www.davidelrizzo.com/heroquestonline/leveleditor/images/floors/bluegrey.jpg","rotation":"90","xOff":70,"yOff":0}}},{"floor":{"graphics":{"path":"http://www.davidelrizzo.com/heroquestonline/leveleditor/images/floors/bluegrey.jpg","rotation":"270","xOff":210,"yOff":210}}},{"trigger":{"graphics":{"path":"http://www.davidelrizzo.com/heroquestonline/leveleditor/images/triggers/trapspear.png","rotation":"0","xOff":0,"yOff":0}},"floor":{"graphics":{"path":"http://www.davidelrizzo.com/heroquestonline/leveleditor/images/floors/bluegrey.jpg","rotation":"270","xOff":70,"yOff":70}}},{"floor":{"graphics":{"path":"http://www.davidelrizzo.com/heroquestonline/leveleditor/images/floors/bluegrey.jpg","rotation":"180","xOff":210,"yOff":280}}},{"furniture":{"group":"111","graphics":{"path":"http://www.davidelrizzo.com/heroquestonline/leveleditor/images/furniture/weaponrack.png","rotation":"270","xOff":0,"yOff":-70}},"wall-bottom":{"graphics":{"path":"http://www.davidelrizzo.com/heroquestonline/leveleditor/images/walls/stone.png","rotation":"90","xOff":0,"yOff":0}},"floor":{"graphics":{"path":"http://www.davidelrizzo.com/heroquestonline/leveleditor/images/floors/bluegrey.jpg","rotation":"0","xOff":70,"yOff":140}}}],[null,{"wall-bottom":{"graphics":{"path":"http://www.davidelrizzo.com/heroquestonline/leveleditor/images/walls/stone.png","rotation":"90","xOff":0,"yOff":0}}},{"floor":{"graphics":{"path":"http://www.davidelrizzo.com/heroquestonline/leveleditor/images/floors/bluegrey.jpg","rotation":"270","xOff":0,"yOff":140}}},{"creature":{"graphics":{"path":"http://www.davidelrizzo.com/heroquestonline/leveleditor/images/creatures/goblin.png","rotation":"0","xOff":0,"yOff":0}},"floor":{"graphics":{"path":"http://www.davidelrizzo.com/heroquestonline/leveleditor/images/floors/bluegrey.jpg","rotation":"0","xOff":210,"yOff":70}}},{"floor":{"graphics":{"path":"http://www.davidelrizzo.com/heroquestonline/leveleditor/images/floors/bluegrey.jpg","rotation":"0","xOff":210,"yOff":280}}},{"furniture":{"group":"111","graphics":{"path":"http://www.davidelrizzo.com/heroquestonline/leveleditor/images/furniture/weaponrack.png","rotation":"270","xOff":0,"yOff":-140}},"wall-bottom":{"graphics":{"path":"http://www.davidelrizzo.com/heroquestonline/leveleditor/images/walls/stone.png","rotation":"90","xOff":0,"yOff":0}},"floor":{"graphics":{"path":"http://www.davidelrizzo.com/heroquestonline/leveleditor/images/floors/bluegrey.jpg","rotation":"180","xOff":0,"yOff":70}}}],[null,{"wall-bottom":{"graphics":{"path":"http://www.davidelrizzo.com/heroquestonline/leveleditor/images/walls/stone.png","rotation":"90","xOff":0,"yOff":0}}},{"wall-right":{"graphics":{"path":"http://www.davidelrizzo.com/heroquestonline/leveleditor/images/walls/stone.png","rotation":"0","xOff":0,"yOff":0}},"floor":{"graphics":{"path":"http://www.davidelrizzo.com/heroquestonline/leveleditor/images/floors/bluegrey.jpg","rotation":"0","xOff":70,"yOff":0}}},{"wall-right":{"graphics":{"path":"http://www.davidelrizzo.com/heroquestonline/leveleditor/images/walls/dooropen.png","rotation":"0","xOff":0,"yOff":0}},"floor":{"graphics":{"path":"http://www.davidelrizzo.com/heroquestonline/leveleditor/images/floors/bluegrey.jpg","rotation":"180","xOff":140,"yOff":140}}},{"wall-right":{"graphics":{"path":"http://www.davidelrizzo.com/heroquestonline/leveleditor/images/walls/stone.png","rotation":"0","xOff":0,"yOff":0}},"floor":{"graphics":{"path":"http://www.davidelrizzo.com/heroquestonline/leveleditor/images/floors/bluegrey.jpg","rotation":"0","xOff":210,"yOff":140}}},{"wall-bottom":{"graphics":{"path":"http://www.davidelrizzo.com/heroquestonline/leveleditor/images/walls/stone.png","rotation":"90","xOff":0,"yOff":0}},"wall-right":{"graphics":{"path":"http://www.davidelrizzo.com/heroquestonline/leveleditor/images/walls/stone.png","rotation":"0","xOff":0,"yOff":0}},"floor":{"graphics":{"path":"http://www.davidelrizzo.com/heroquestonline/leveleditor/images/floors/bluegrey.jpg","rotation":"0","xOff":140,"yOff":210}}},{"wall-right":{"graphics":{"path":"http://www.davidelrizzo.com/heroquestonline/leveleditor/images/walls/stone.png","rotation":"0","xOff":0,"yOff":0}}},{"wall-right":{"graphics":{"path":"http://www.davidelrizzo.com/heroquestonline/leveleditor/images/walls/stone.png","rotation":"0","xOff":0,"yOff":0}}}],[null,{"wall-bottom":{"graphics":{"path":"http://www.davidelrizzo.com/heroquestonline/leveleditor/images/walls/stone.png","rotation":"90","xOff":0,"yOff":0}}},{"wall-right":{"graphics":{"path":"http://www.davidelrizzo.com/heroquestonline/leveleditor/images/walls/stone.png","rotation":"0","xOff":0,"yOff":0}},"floor":{"graphics":{"path":"http://www.davidelrizzo.com/heroquestonline/leveleditor/images/floors/corridor.jpg","rotation":"180","xOff":350,"yOff":140}}},{"wall-right":{"graphics":{"path":"http://www.davidelrizzo.com/heroquestonline/leveleditor/images/walls/stone.png","rotation":"0","xOff":0,"yOff":0}},"floor":{"graphics":{"path":"http://www.davidelrizzo.com/heroquestonline/leveleditor/images/floors/corridor.jpg","rotation":"180","xOff":70,"yOff":140}}},{"wall-right":{"graphics":{"path":"http://www.davidelrizzo.com/heroquestonline/leveleditor/images/walls/stone.png","rotation":"0","xOff":0,"yOff":0}},"floor":{"graphics":{"path":"http://www.davidelrizzo.com/heroquestonline/leveleditor/images/floors/corridor.jpg","rotation":"90","xOff":140,"yOff":210}}},{"trigger":{"graphics":{"path":"http://www.davidelrizzo.com/heroquestonline/leveleditor/images/triggers/trappit.png","rotation":"0","xOff":0,"yOff":0}},"wall-right":{"graphics":{"path":"http://www.davidelrizzo.com/heroquestonline/leveleditor/images/walls/stone.png","rotation":"0","xOff":0,"yOff":0}},"floor":{"graphics":{"path":"http://www.davidelrizzo.com/heroquestonline/leveleditor/images/floors/corridor.jpg","rotation":"270","xOff":350,"yOff":350}}},{"wall-right":{"graphics":{"path":"http://www.davidelrizzo.com/heroquestonline/leveleditor/images/walls/doorclosed.png","rotation":"0","xOff":0,"yOff":0}},"floor":{"graphics":{"path":"http://www.davidelrizzo.com/heroquestonline/leveleditor/images/floors/corridor.jpg","rotation":"90","xOff":280,"yOff":280}}},{"wall-bottom":{"graphics":{"path":"http://www.davidelrizzo.com/heroquestonline/leveleditor/images/walls/stone.png","rotation":"90","xOff":0,"yOff":0}},"wall-right":{"graphics":{"path":"http://www.davidelrizzo.com/heroquestonline/leveleditor/images/walls/stone.png","rotation":"0","xOff":0,"yOff":0}},"floor":{"graphics":{"path":"http://www.davidelrizzo.com/heroquestonline/leveleditor/images/floors/corridor.jpg","rotation":"180","xOff":420,"yOff":280}}}],[null,null,null,null,{"wall-bottom":{"graphics":{"path":"http://www.davidelrizzo.com/heroquestonline/leveleditor/images/walls/stone.png","rotation":"90","xOff":0,"yOff":0}}},{"floor":{"graphics":{"path":"http://www.davidelrizzo.com/heroquestonline/leveleditor/images/floors/green.jpg","rotation":"0","xOff":140,"yOff":210}}},{"floor":{"graphics":{"path":"http://www.davidelrizzo.com/heroquestonline/leveleditor/images/floors/greencobbles.jpg","rotation":"90","xOff":70,"yOff":210}}},{"wall-bottom":{"graphics":{"path":"http://www.davidelrizzo.com/heroquestonline/leveleditor/images/walls/stone.png","rotation":"90","xOff":0,"yOff":0}},"floor":{"graphics":{"path":"http://www.davidelrizzo.com/heroquestonline/leveleditor/images/floors/green.jpg","rotation":"90","xOff":70,"yOff":210}}}],[null,null,null,null,{"wall-bottom":{"graphics":{"path":"http://www.davidelrizzo.com/heroquestonline/leveleditor/images/walls/stone.png","rotation":"90","xOff":0,"yOff":0}}},{"furniture":{"group":"113","graphics":{"path":"http://www.davidelrizzo.com/heroquestonline/leveleditor/images/furniture/chest.png","rotation":"90","xOff":0,"yOff":0}},"wall-right":{"graphics":{"path":"http://www.davidelrizzo.com/heroquestonline/leveleditor/images/walls/stone.png","rotation":"0","xOff":0,"yOff":0}},"floor":{"graphics":{"path":"http://www.davidelrizzo.com/heroquestonline/leveleditor/images/floors/greencobbles.jpg","rotation":"0","xOff":0,"yOff":70}}},{"creature":{"graphics":{"path":"http://www.davidelrizzo.com/heroquestonline/leveleditor/images/creatures/gargoyal.png","rotation":"0","xOff":0,"yOff":0}},"wall-right":{"graphics":{"path":"http://www.davidelrizzo.com/heroquestonline/leveleditor/images/walls/stone.png","rotation":"0","xOff":0,"yOff":0}},"floor":{"graphics":{"path":"http://www.davidelrizzo.com/heroquestonline/leveleditor/images/floors/green.jpg","rotation":"90","xOff":70,"yOff":210}}},{"wall-bottom":{"graphics":{"path":"http://www.davidelrizzo.com/heroquestonline/leveleditor/images/walls/stone.png","rotation":"90","xOff":0,"yOff":0}},"wall-right":{"graphics":{"path":"http://www.davidelrizzo.com/heroquestonline/leveleditor/images/walls/stone.png","rotation":"0","xOff":0,"yOff":0}},"floor":{"graphics":{"path":"http://www.davidelrizzo.com/heroquestonline/leveleditor/images/floors/greencobbles.jpg","rotation":"270","xOff":0,"yOff":140}}}]]');
    }

  }

  $scope.loadEditorConfig = function () {
    var deferred = $q.defer();
    $http({method: 'GET', url: '/data/mapEditor.json'})
    .then(function successCallback(response) {
      deferred.resolve(response.data);
    }, function errorCallback(response) {
      deferred.reject(response);
    });
    return deferred.promise;
  };
  $scope.loadEditorConfig().then(function (EditorConfig) {
    $scope.campaignData = EditorConfig;
    $scope.Main.init();
    $scope.$scope.Main.enableControls();
  })

});

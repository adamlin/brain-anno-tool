var wid = 512;
var hei = 512;
var currentscale = 1;
var currentcoloridx = 1;
var colorlist = [
  "#ff0000",
  "#00ff00",
  "#ff00ff",
  "#ffff00",
  "#414141",
  "#00ffff",
  "#8f8f8f",
  "#ffe86b",
  "#ffffff"
];
var indicesWithSaidColor = [];
var positionForColor = {};

var stageWidth = $(window).width();
var stageHeight = $(window).height() - 125;

var stage = new Konva.Stage({
  container: "container",
  width: stageWidth, //window.innerWidth,
  height: stageHeight, //window.innerHeight - 45,
	container: "container",
	width: stageWidth, //window.innerWidth,
	height: stageHeight, //window.innerHeight - 45,
	scale: { x: currentscale, y: currentscale },
	draggable: false // if this is changed, then stage offset should be considered while recording points
});

var layer = new Konva.Layer(); // layer for pixel painting
// var layer_vector = new Konva.Layer(); // layer for vector drawings

var mousedown = false;
var UndoOrRedo = 0;

var actionarray = {}; //Associative array. Key is a action count.
var idxaction = {}; //Associative array. Key is a linearindex.

// var idxarray = []; // for lookup
// var flagarray = []; // when write a rect, then 1
// var undostep = 0;

// var lastAction = {undo:0, redo:0};


// var undoarray = [];

var actioncnt = 1;
var ActCursorForRedo = undefined;
var lastActIsUndoRedo = 0;
var lastActIsEraseOrPaint = 0;

// var xyarray = []; // painted locations in image coordinates
// var colorarray = [];
// var idxsequence = []; // sequence of idxs operated on
// var typeOfOperations = [];

var currentvector = undefined;

var calcnt = calBrushsize();

var age = 20;
var output = [];

var scaleBy = 1.1;
var scrolldir = -1; //-1: scroll down goes to zoon-in. 1:-1: scroll down goes to zoon-out.

function makeNewLine(isPolygon) {
  return new Konva.Line({
    points: [],
    closed: isPolygon,
    stroke: $('#picker').colorpicker("val"),
    strokeWidth: 0.2, //TODO: smooth lines?
    visible: true,
    opacity: 1,
    tension: 0
  });
}

function makeNewRect(ImPix_x, ImPix_y, color) {
  console.log(color);
  return new Konva.Rect({
    x: ImPix_x + 0.1,
    y: ImPix_y + 0.1,
    width: 0.8,
    height: 0.8,
    // fill: colorlist[currentcoloridx - 1], //'#4b26df',
    fill: color == undefined ? $('#picker').colorpicker("val") : color,
    draggable: false
  });
}

function mouseevt() {
  var pointerPos = stage.getPointerPosition(); //Pointer position on the image. Left-top of the container(background) is the [0 0].
  var stgposition = stage.position(); // The distance of the stage from the left-top of the container.
  var ImPix_x = Math.floor((pointerPos.x - stgposition.x) / currentscale); // X coordinate of the pixel of the image where the cursor is on. Top-left is 0.
  var ImPix_y = Math.floor((pointerPos.y - stgposition.y) / currentscale);

  var selection = $("input[name=drawingtype]:checked").val();
  if (mousedown == true) {
    if (selection == "pointer") {
      stage.draggable(true);
    }else if (selection == "vector_linestring" || selection == "vector_polygon") {
      stage.draggable(false);
      var vecname = "hopefully-unique-" + typeOfOperations.length; ///
      if (currentvector == undefined) {
          currentvector = makeNewLine(false);
          layer.add(currentvector);
      }
      currentvector.points(currentvector.points().concat([ImPix_x, ImPix_y]));
      currentvector.stroke($('#picker').colorpicker("val")); //colorlist[currentcoloridx - 1]);
      currentvector.draw();
      currentvector.name(vecname);
    }else if (selection == "raster_pixel") {
      stage.draggable(false);
      if ($("#erase_check").is(":checked")) {
        eraseRect(ImPix_x,ImPix_y); 
      }else{
      	// console.log('[[ Start painting ]]');
        for (var x = -calcnt; x<calcnt+1; x++){
          for (var y = -calcnt; y<calcnt+1; y++) {
            if (calcnt > 0 && Math.pow(x*y,2) == Math.pow(calcnt,4)) {continue} // To make brush circle.
			paintRect(ImPix_x+x, ImPix_y+y, pointerPos);
          }
		}
        actioncnt = actioncnt + 1;  // paintしなくてもactionが加算されることに注意
        // console.log('[[ The last action(painting) done ]]');
        showstatus();
      }
    }
  }

  // For cursor type Mitsu
  var selection = $("input[name=drawingtype]:checked").val();
  if (selection == "pointer") {
    stage.container().style.cursor = 'pointer';
  }else{
    stage.container().style.cursor = 'default';
  }
}

function paintRect(ImPix_x, ImPix_y, pointerPos) {
	var linearindex = ImPix_y * wid + ImPix_x; // Left-top is 0.
	var action = idxaction[linearindex]; // Search the last action number of the pixel
  // console.log('linearindex is '+linearindex);
  // console.log('action # is '+action);
	
	// var existingrect = stage.getIntersection(pointerPos, "Rect");
	// if (existingrect.className == "Image") {  /////////// どういう役割？

  if (action != undefined && actionarray[action][linearindex]['flag'] == 1) {
    console.log('already exist');
  }else if (action != undefined && actionarray[action][linearindex]['flag'] == 0){ // When the pixel is empty by erasing or undo/redo at last time.
    var newrect = makeNewRect(ImPix_x, ImPix_y);
    // newrect.on("click tap", checkEraseRect);
    layer.add(newrect);
    layer.draw();

    if (actionarray[actioncnt] == undefined) {
      actionarray[actioncnt] = {}; // 新しくactionを作る. Use associative array not to make a unnecessary empties.
    }
    actionarray[actioncnt][linearindex] = actionarray[action][linearindex]; //元のstatusを新しいactionにコピー
    // console.log(actionarray[action]);
    actionarray[actioncnt][linearindex]['flag'] = 1;
    actionarray[actioncnt][linearindex]['undo'] = 0;
    actionarray[actioncnt][linearindex]['color'] = currentcoloridx;
    actionarray[actioncnt][linearindex]['type'] = "pixel";

    idxaction[linearindex] = actioncnt; //action countの更新

    delete actionarray[action][linearindex]; // 元のactionを削除する
    if (Object.keys(actionarray[action]).length == 0) {
      delete actionarray[action]; // To reduce memory usage.
    }

    lastActIsUndoRedo = 0;
    lastActIsEraseOrPaint = 1;

    // if (!positionForColor[currentcoloridx]) {  /// need check
    //   positionForColor[currentcoloridx] = [];
    // }
    // positionForColor[currentcoloridx].push([ImPix_x, ImPix_y]); /// need check
    
  }else{ // Make a new rect at a new pixel
    var newrect = makeNewRect(ImPix_x, ImPix_y);
    // newrect.on("click tap", checkEraseRect);
    layer.add(newrect);
    layer.draw(); 
    
    if (actionarray[actioncnt] == undefined) {
      actionarray[actioncnt] = {}; // 新しくactionを作る. Use associative array not to make a unnecessary empties.
    }

    // push a new status to the array.
    actionarray[actioncnt][linearindex] = {
      xy: [ImPix_x, ImPix_y],
      flag: 1,
      undo: 0,
      color: currentcoloridx,
      type: "pixel"
    };
    
    idxaction[linearindex] = actioncnt;

    lastActIsUndoRedo = 0;
    lastActIsEraseOrPaint = 1;

    // if (!positionForColor[currentcoloridx]) {  /// need check
    //   positionForColor[currentcoloridx] = [];
    // }
    // positionForColor[currentcoloridx].push([ImPix_x, ImPix_y]); /// need check

  }
}


function UndoRedo() {
  var properActCursor = 0;
  var newundo = undefined;

  if (UndoOrRedo == 'undo'){
    newundo = 1;

    for (var i = actioncnt-1; i>0 && !(actionarray[i] != undefined && actionarray[i][Object.keys(actionarray[i])[0]]['undo'] == 0); i--){ // 同じaction内でundoはすべて同じだと仮定して、一番始めのlinerindexのundoだけ調べる。
      // console.log('### Searching a correct action number... ###');  
      // console.log('The action cursor ' + i + ' was not what we want to undo/redo for.');
      // console.log('Next, try a cursor ' + (i-1));
    }

    if ((lastActIsEraseOrPaint == 0 && actionarray[i][Object.keys(actionarray[i])[0]]['flag'] == 1) || (lastActIsEraseOrPaint == 1 && actionarray[i][Object.keys(actionarray[i])[0]]['flag'] == 0)) {
      console.log('No more undo');
      return //Eraseを一旦したら、そのErase郡以前のものをUndoできないようにする。同様に一旦Paintをしたら、そのPaint郡以前のものをUndoできないようにする。ただし、過去にEraseしたところをすべてPaintした場合は、undo=0かつflag=0の場所が無くなるので、eraseがそもそも無かったことになり、すべて１つのPaint郡として捉えられる。
    }

    properActCursor = i;
    var keys = Object.keys(actionarray[properActCursor]);

  }else if(UndoOrRedo == 'redo'){
    newundo = 0;

    if (ActCursorForRedo == undefined) {
      console.log('Undo first before redo.');
      return;
    }else if (lastActIsUndoRedo == 0) {
      console.log('The last action need to be Undo or redo.');
      return;
    }else if (actionarray[ActCursorForRedo][Object.keys(actionarray[ActCursorForRedo])[0]]['undo'] != 1) { //最後のredoを行ったundoのactionの1個前のactionがundoでなければいけない。 同じaction内でundoはすべて同じだと仮定して、一番始めのlinerindexのundoだけ調べる。
      console.log('No more redo');
      return;
    }

    properActCursor = ActCursorForRedo;
    var keys = Object.keys(actionarray[properActCursor]);
  }

  // console.log('Found a proper action cursor to do undo/redo: ' + properActCursor);
  
  if (actionarray[properActCursor][keys[0]]['type'] === "pixel") { // 同じaction内でtypeはすべて同じだと仮定して、一番始めのlinerindexのtypeだけ調べる。
    undopix(properActCursor, keys, newundo);
  }else if(actionarray[properActCursor][keys[0]]['type'] === "vec"){
    undovec();
  }

  // For the next redo.
  if (UndoOrRedo == 'undo'){
    ActCursorForRedo = actioncnt;
  }else if (UndoOrRedo == 'redo') {
    ActCursorForRedo = ActCursorForRedo -1;
  }
  actioncnt = actioncnt + 1;
  showstatus();
}

function undopix(properActCursor, keys, newundo){
  var lastaction = actionarray[properActCursor][keys[0]]['flag']; // 同じaction内でflagはすべて同じだと仮定して、一番始めのlinerindexのglagだけ調べる。
  var newflag = undefined;

  for (var i = 0; i < keys.length; i++) {
    var Impix = actionarray[properActCursor][keys[i]]['xy'];
    var ImPix_x = Impix[0];
    var ImPix_y = Impix[1];
    if (!lastaction) { // if the last action is 0 (erase), then redraw.
      newflag = 1;
      var color = actionarray[properActCursor][keys[i]]['color'];
      var newrect = makeNewRect(ImPix_x, ImPix_y, color);  /////////////color needs to match to the original
      // newrect.on("click tap", checkEraseRect);
      layer.add(newrect);
      layer.draw();
    } else { // if the last action is 1 (paint), then erase.
      newflag = 0;
      var stgposition = stage.position();
      var RectPos = {
        x: (ImPix_x+0.5)*currentscale + stgposition.x, // Left-top Impix is [0, 0]. So, add 0.5 to point the center of the pixel.
        y: (ImPix_y+0.5)*currentscale + stgposition.y 
      };
      // console.log(pointerPos);
      var existingrect = stage.getIntersection(RectPos, "Rect");
      // console.log(existingrect);
      if (existingrect.className != "Rect") {      
        continue
      }

      existingrect.destroy();
      layer.draw();
    }

    // Make a new action
    if (actionarray[actioncnt] == undefined) {
      actionarray[actioncnt] = {}; // 新しくactionを作る. Use associative array not to make a unnecessary empties.
    }
    actionarray[actioncnt][keys[i]] = actionarray[properActCursor][keys[i]]; //元のstatusを新しいactionにコピー
    actionarray[actioncnt][keys[i]]['flag'] = newflag;
    actionarray[actioncnt][keys[i]]['undo'] = newundo;

    idxaction[keys[i]] = actioncnt; //action countの更新

    delete actionarray[properActCursor][keys[i]]; // 元のactionを削除する
    if (Object.keys(actionarray[properActCursor]).length == 0) {
      delete actionarray[properActCursor]; // To reduce memory usage.
    }

    lastActIsUndoRedo = 1;
    // showstatus();
  }
}

function undovec() {
  var vecName = typeOfOperations[typeOfOperations.length - 1].data.name;
  console.log(vecName);
  var foundvec = layer.getChildren(function(node) {
    return node.name() === vecName;
  });
  var foundarray = foundvec.toArray();
  //foundarray[0]
  console.log(foundarray);
  foundarray[0].destroy();
  layer.draw();
}


function checkEraseRect(evt) {   //// eraseRectと融合できる？ いらない？
//   obj = evt.target;
//   if ($("#erase_check").is(":checked")) {
//     var rectPos = obj.getPosition();  //Top-left pixel coordinate of the rect on the image. There is 0.1 pixel spacing, so the top-left rect's pos will be [0.1,0.1] 
//     // console.log(rectPos);
//     var ImPix_x = Math.floor(rectPos.x);
//     var ImPix_y = Math.floor(rectPos.y);
//     // linidx_d = (clickY_d - 1) * wid + clickX_d; 
//     var linearindex = ImPix_y * wid + ImPix_x;

//     var idxloc = idxarray.indexOf(linearindex);
//     if (idxloc != -1) {
//       obj.destroy();
//       layer.draw();

//       flagarray[idxloc] = 0;
//       undoarray[idxloc] = 0;
//       actionarray[idxloc] = actioncnt;
//       actioncnt = actioncnt + 1;
//       lastActIsUndoRedo = 0;
//       // showstatus();
//     }
//   }
}

function eraseRect(ImPix_x,ImPix_y){
  // console.log('[[ Start erasing ]]');
	for (var x = -calcnt; x<calcnt+1; x++){
		for (var y = -calcnt; y<calcnt+1; y++) {
			if (calcnt > 0 && Math.pow(x*y,2) == Math.pow(calcnt,4)) {continue}
			var linearindex = (ImPix_y+y) * wid + (ImPix_x+x);
      var action = idxaction[linearindex];
      // console.log(action);
      if (action == undefined) {
        // console.log('No action history for liner id: ' + linearindex);
        continue
      }

			var stgposition = stage.position();
			var RectPos = {
				x: (ImPix_x+x+0.5)*currentscale + stgposition.x, // Left-top Impix is [0, 0]. So, add 0.5 to point the center of the pixel.
				y: (ImPix_y+y+0.5)*currentscale + stgposition.y 
			};

			var existingrect = stage.getIntersection(RectPos, "Rect");

			if (existingrect.className == "Rect") {
				existingrect.destroy();
				layer.draw();

        if (actionarray[actioncnt] == undefined) {
          actionarray[actioncnt] = {}; // 新しくactionを作る. Use associative array not to make a unnecessary empties.
        }

        actionarray[actioncnt][linearindex] = actionarray[action][linearindex]; //元のstatusを新しいactionにコピー
        // console.log(actionarray[action]);
        actionarray[actioncnt][linearindex]['flag'] = 0;
        actionarray[actioncnt][linearindex]['undo'] = 0;

        delete actionarray[action][linearindex]; // 元のactionを削除する
        if (Object.keys(actionarray[action]).length == 0) {
          delete actionarray[action]; // To reduce memory usage.
        }

        lastActIsUndoRedo = 0;
        lastActIsEraseOrPaint = 0;

        idxaction[linearindex] = actioncnt; //action countの更新
			} 
		}
	}
  actioncnt = actioncnt + 1;
  // console.log('[[ The last action(erasing) done ]]');
  // showstatus();
}

function minimizehistory(){ // To reduce memory use.
  var count = 0;
  var actiokeys = Object.keys(actionarray); //Key(action number) is supposed to be in order from small to big.
  if (actiokeys.length < age+1) {return}

  for (var i = 0; i<(actiokeys.length - age); i++) {
    var action = actiokeys[i];
    var linearindexkeys = Object.keys(actionarray[action]);
    if (actionarray[action][linearindexkeys[0]]['flag'] == 0) {
      delete actionarray[action];
      count++;
      for (var j = 0; j<linearindexkeys.length; j++) {
        delete idxaction[linearindexkeys[j]];
      }
    }else{
      // for (var k = 0; k<linearindexkeys.length; k++) {
      //   var outtemp = actionarray[action][linearindexkeys[k]];
      //   delete outtemp['flag'];
      //   delete outtemp['undo']; 
      //   output.push(outtemp);
      //   delete actionarray[action][linearindexkeys[k]];
      //   delete idxaction[linearindexkeys[k]];
      // }
      // delete actionarray[action];
    }
  }
  console.log('Total '+ count +' old undo record were deleted.');
  showstatus();
}

var cumulateColorPoints = function(listOfColors) {
  // listOfColors should be of the format ["6", "7", "8"]
  var finalResult = {};
  $.each(listOfColors, function(index, color) {
    finalResult[color] = {
      idxarray: [],
      xyarray: []
      // can put more here if you want
    };
    // took the reduce from
    // https://stackoverflow.com/a/20798754
    // https://stackoverflow.com/questions/966225/how-can-i-create-a-two-dimensional-array-in-javascript/966234#966234
    var indicesWithSaidColor = colorarray.reduce(function(a, e, i) {
      if (e === color) {
        a.push(i);
      }
      return a;
    }, []);
    $.each(indicesWithSaidColor, function(_, actualIndex) {
      // include more data that you want
      finalResult[color]["idxarray"].push(idxarray[actualIndex]);
      finalResult[color]["xyarray"].push(xyarray[actualIndex]);
    });
  });
  return finalResult;
};


stage.on("touchstart mousedown", function(e) {
	var click = e.evt.button; //0 if it's left click. 2 if it's right click. 1 if it's middle click. 
	if (click == 0) {
		mousedown = true;
		mouseevt();
	}else if (click == 2) {
		// e.evt.preventDefault(true);
		// e.evt.stopPropagation(true);
	}

});

stage.on("mousemove", mouseevt);
stage.on("mouseleave", function(){
  mousedown = false;
  // console.log('mouseleft');
});
stage.on("mouseup", function(e) {
	var click = e.evt.button; //0 if it's left click. 2 if it's right click. 1 if it's middle click. 
	if (click == 0) {
		mousedown = false;
		// console.log(positionForColor);

		var selection = $("input[name=drawingtype]:checked").val();
		if (selection == "vector_polygon" && currentvector != undefined) {
		currentvector.closed(true);
		layer.draw();
		}
		//TODO: push to array of drawn objects (for erase/undo), before undefining
		// erase/undo will require a filter array (0/1)
		// separate array for polygon and linestring required
		// in save, iterate through these two object arrays and add to geojson msg
		currentvector = undefined;

		if (selection == "vector_linestring" || selection == "vector_polygon") {
		var vecname = "hopefully-unique-" + typeOfOperations.length;
		// taking note of the type. Will be handy when we undo
		typeOfOperations.push({
		  type: "vec",
		  data: { name: vecname }
		});
		}
		// } else if (selection == "raster_pixel") {
		//   typeOfOperations.push({
		//     type: "pixel"
		//   });
		// }

		minimizehistory();
	}else if (click == 2) {
		// e.evt.preventDefault();
		// e.evt.stopPropagation();
	}
});

stage.on('contentContextmenu', (e) => {  /// Does not work with Chrome.
  e.evt.preventDefault();
});

// $("#leftbutton").click(function() {
//   currentoffset = stage.getOffset();
//   stage.setOffset({ x: currentoffset.x - 10, y: currentoffset.y + 0 });
//   stage.draw();
// });
// $("#rightbutton").click(function() {
//   currentoffset = stage.getOffset();
//   stage.setOffset({ x: currentoffset.x + 10, y: currentoffset.y + 0 });
//   stage.draw();
// });
// $("#upbutton").click(function() {
//   currentoffset = stage.getOffset();
//   stage.setOffset({ x: currentoffset.x + 0, y: currentoffset.y - 10 });
//   stage.draw();
// });
// $("#downbutton").click(function() {
//   currentoffset = stage.getOffset();
//   stage.setOffset({ x: currentoffset.x + 0, y: currentoffset.y + 10 });
//   stage.draw();
// });
// $("#centerbutton").click(function() {
//   stage.setOffset({ x: 0, y: 0 });
//   stage.draw();
// });


$("#picker").change(function() {
  currentcoloridx = this.value;
});
$("#undobutton").click(function() {
  UndoOrRedo = 'undo';
  UndoRedo();
  // if (typeOfOperations[typeOfOperations.length - 1].type === "pixel") {
  //   UndoOrRedo = 1;
  //   UndoRedo();
  // } else if (typeOfOperations[typeOfOperations.length - 1].type === "vec") {
  //   undovec();
  // }
  // if (typeOfOperations.length > 0) {
  //   typeOfOperations.pop();
  // }
});

$("#redobutton").click(function() {
  UndoOrRedo = 'redo';
  UndoRedo();
  // if (typeOfOperations[typeOfOperations.length - 1].type === "pixel") {
  //   UndoOrRedo = 2;
  //   UndoRedo();
  // } else if (typeOfOperations[typeOfOperations.length - 1].type === "vec") {
  //   redovec();
  // }
  // if (typeOfOperations.length > 0) {
  //   typeOfOperations.pop();
  // }
});

$("#savebutton").click(function() {
  xyarray_filt = [];
  for (ii = 0; ii < xyarray.length; ++ii) {
    if (flagarray[ii] == 1) xyarray_filt.push(xyarray[ii]);
  }
  msg =
    '{"type":"MultiPoint", "coordinates":' + JSON.stringify(xyarray_filt) + "}";
  //need to standardize export format of independant operation type.
  alert(msg);

  var children = layer.getChildren();

  // get only lines
  var lines = layer.getChildren(function(node){
    return node.getClassName() === 'Line';
  });

  //https://stackoverflow.com/questions/22464605/convert-a-1d-array-to-2d-array
  for(ii=0;ii<lines.length;ii++){
    points = lines[ii].points();
    points_copy = points.slice();
    var coordinates = [];
    while(points_copy.length)
      coordinates.push(points_copy.splice(0,2));
    
    if(coordinates.length>0) {
      msg = '{"type":"Polygon","coordinates":'+JSON.stringify(coordinates)+'}';
      alert(msg);
    }
  }
});

$("#clearbutton").click(function() {
  var shapes = stage.find("Rect");
  // var shapes = stage.find();
  for (var i = 0; i < shapes.length; i++) {
    shapes[i].destroy();
    layer.draw();
  }

  var lines = stage.find("Line");
  for (var i = 0; i < lines.length; i++) {
    lines[i].destroy();
    layer.draw();
  }

  typeOfOperations = [];
});

$("#BrushSize").change(function(){calBrushsize()}); ///// Brush size need to be either of [1, 9, 25, 49]

function calBrushsize() {
	var brushsize = $("#BrushSize").val();
	calcnt = (Math.sqrt(brushsize) -1)/2;
	return calcnt
}

// Mitsu's scroll zooming
stage.on("mousewheel", e => {
    e.evt.preventDefault();
    var oldScale = stage.scaleX();

    var mousePointTo = {
      x: stage.getPointerPosition().x / oldScale - stage.x() / oldScale,
      y: stage.getPointerPosition().y / oldScale - stage.y() / oldScale
    };

    if (scrolldir == -1) {
	    var newScale =
	      e.evt.deltaY > 0 ? oldScale * scaleBy : oldScale / scaleBy;
	    stage.scale({ x: newScale, y: newScale });
	}else if (scrolldir == 1) {
		var newScale =
	      e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
	    stage.scale({ x: newScale, y: newScale });
	}else{
		console.log('Choose a proper scroll direction');
		return
	}

    var newPos = {
      x:
        -(mousePointTo.x - stage.getPointerPosition().x / newScale) *
        newScale,
      y:
        -(mousePointTo.y - stage.getPointerPosition().y / newScale) *
        newScale
    };
    stage.position(newPos);
    stage.batchDraw();

  currentscale = newScale;

  var n = 1; // Num of digits after the decimal point.
  newScale_show = Math.floor(newScale*Math.pow(10,n))/Math.pow(10,n);
  var slider = document.getElementById("myRange");
  slider.value = newScale_show;
  $("#zoomlabel").html(""+newScale_show);
});


// referring this https://konvajs.github.io/docs/sandbox/Zooming_Relative_To_Pointer.html
var slider = document.getElementById("myRange");
slider.oninput = function() {
  var oldScale = stage.scaleX();
  var newscale = slider.value;

  $("#zoomlabel").html(""+newscale)
  // default scale 5 is set by you. Assuming I want the scale to
  // be from 1 to 10
  // var maxScaleStage = 10, minScaleStage = 1;
  // var change = Math.pow(2, newscale); // (slider.value * (maxScaleStage - minScaleStage) / 100) + minScaleStage;
  // var change = newscale;
  // console.log(newscale,change);

  var CenterOfStageX = stage.width()/2;
  var CenterOfStageY = stage.height()/2;

  // To adjust the center in the actual view. When the window is wide, the zoom-in center will be right end. 
  var adjustX = -100;
  var adjustY = 0;

  var ZoomintoX = CenterOfStageX+adjustX;
  var ZoomintoY = CenterOfStageY+adjustY;
  
  var mousePointTo = {
    x: (ZoomintoX - stage.x() ) / oldScale,
    y: (ZoomintoY - stage.y() ) / oldScale
  };

  stage.scale({ x: newscale, y: newscale });

  var newPos = {
    x: -mousePointTo.x*newscale+ZoomintoX,
    y: -mousePointTo.y*newscale+ZoomintoY
  };

  stage.position(newPos);
  stage.batchDraw();

  currentscale = newscale;
};


function showstatus (){
  // console.log('xyarray    :' + xyarray);
  // console.log('actionarray:' + actionarray);
  // console.log('idxarray   :' + idxarray);
  // console.log('flagarray  :' + flagarray);
  // console.log('undoarray  :' + undoarray);
  // console.log('last action is #' + (actioncnt-1));
  // console.log('Next action cursor for redo is ' + ActCursorForRedo);
  console.log('1) Current actionarray is');
  console.log(actionarray);
  console.log('2) The last action # is ' + (actioncnt-1));
  console.log('3) The latest linearindex vs action # array is');
  console.log(idxaction);
  // console.log('4) The final output is');
  // console.log(output);
}



// For responsive
//https://konvajs.org/docs/sandbox/Responsive_Canvas.html
function fitStageIntoParentContainer() {
  var container = document.querySelector('#stage-parent');

  // now we need to fit stage into parent
  var containerWidth = container.offsetWidth;
  // to do this we need to scale the stage
  var scale = containerWidth / stageWidth;


  stage.width(stageWidth * scale);
  stage.height(stageHeight * scale);
  stage.scale({ x: scale, y: scale });
  stage.draw();
}



function jp2pathtranslate_(jp2path) 
{
    var parts = jp2path.split('/')
    var np = parts.length;
    return parts[np-2]+'/'+encodeURIComponent(parts[np-1]);
}

function jp2pathdescribe(jp2path)
{
  var parts = jp2path.split('/');
  var np = parts.length;
  //brainno = parts[np-2];
  basename = parts[np-1];
  parts = basename.split('_');
  brainno = parts[1];
  secno = parts[3].substr(0,4);
  $("#braindetails").html(brainno+'_'+secno);
}

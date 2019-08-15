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
  scale: { x: currentscale, y: currentscale },
  draggable: false // if this is changed, then stage offset should be considered while recording points
});

var layer = new Konva.Layer(); // layer for pixel painting
// var layer_vector = new Konva.Layer(); // layer for vector drawings

var mousedown = false;

var idxarray = []; // for lookup
var flagarray = []; // erased or not
// var undostep = 0;

var lastUndoAction = 0;

var UndoOrRedo = 0;
var undoarray = [];
var actionarray = [];
var actioncnt = 1;
var actioncursor = 1;

var xyarray = []; // painted locations in image coordinates
var colorarray = [];
// var idxsequence = []; // sequence of idxs operated on
var typeOfOperations = [];

var currentvector = undefined;


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

function makeNewRect(ImPix_x, ImPix_y) {
  return new Konva.Rect({
    x: ImPix_x + 0.1,
    y: ImPix_y + 0.1,
    width: 0.8,
    height: 0.8,
    // fill: colorlist[currentcoloridx - 1], //'#4b26df',
    fill: $('#picker').colorpicker("val"),
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
        paintRect(ImPix_x, ImPix_y, pointerPos);
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

  // linearindex = (ImPix_y - 1) * wid + ImPix_x; /////// why does it start from -1st row?
  var linearindex = ImPix_y * wid + ImPix_x; // Left-top is 0.
  var idxloc = idxarray.indexOf(linearindex); // Search the liner index from the idxarray. Search from the end(latest action). Return -1 when can not find it, otherwise return the sequential number from the first paint.

  // var existingrect = stage.getIntersection(pointerPos, "Rect");
  // console.log(existingrect);
  // if (existingrect.className == "Image") {  /////////// どういう役割？
    // console.log(idxloc);
    if (idxloc != -1 && flagarray[idxloc] == 1) {
      //already exists
      console.log('exist');
    }else if (idxloc != -1 && ((flagarray[idxloc] == 0 && undoarray[idxloc] == 1) || (flagarray[idxloc] == 0 && undoarray[idxloc] == 0))) { //When the pixel is empty by erasing or undo last time.
      // Overwrite the actionarray
      var newrect = makeNewRect(ImPix_x, ImPix_y);
      layer.add(newrect);
      layer.draw();
      flagarray[idxloc] = 1;
      undoarray[idxloc] = 0;
      actionarray[idxloc] = actioncnt;  // actionarrayを更新
      // actioncursor = actioncnt;
      actioncnt = actioncnt + 1;
      colorarray[idxloc] = currentcoloridx;
      newrect.on("click tap", checkEraseRect);
      if (!positionForColor[currentcoloridx]) {  /// need check
        positionForColor[currentcoloridx] = [];
      }
      positionForColor[currentcoloridx].push([ImPix_x, ImPix_y]); /// need check
      typeOfOperations[idxloc] = {
        type: "pixel"
      };

      showstatus();
    } else {
      var newrect = makeNewRect(ImPix_x, ImPix_y);

      layer.add(newrect);
      layer.draw();
      // console.log(newrect);
      idxarray.push(linearindex);
      flagarray.push(1); // when write a new rect, then 1
      xyarray.push([ImPix_x, ImPix_y]);

      // idxsequence.push(idxarray.length - 1);
      actionarray.push(actioncnt);
      // actioncursor = actioncnt;
      actioncnt = actioncnt + 1;

      undoarray.push(0);
      colorarray.push(currentcoloridx);

      newrect.on("click tap", checkEraseRect);
      // console.log(positionForColor[currentcoloridx]);
      if (!positionForColor[currentcoloridx]) {
        positionForColor[currentcoloridx] = [];
      }
      // console.log(positionForColor[currentcoloridx]);
      positionForColor[currentcoloridx].push([ImPix_x, ImPix_y]);

      typeOfOperations.push({
        type: "pixel"
      });

      showstatus();
    }

  // } else {
  //   //console.log(pointerPos);
  // }
}


function UndoRedo() {
  if (UndoOrRedo == 'undo'){
    undoflag = 1;
    newundoflag = 1;
  }else if(UndoOrRedo == 'redo'){
    undoflag = 0;
    newundoflag = 0;
  }

  // actioncnt is the last action's # plus 1.  i = actioncnt-1 は、最後のaction#.
  for (var i = actioncnt-1; i>0 && ((actionarray.indexOf(i) == -1) || (undoarray[actionarray.indexOf(i)] == undoflag)); i--){
    console.log('### Searching a correct actioncursor... ###');
    console.log('current cursor is ' + i + ', but it was not what we undo for.');
    console.log('next, try a cursor ' + (i-1));
  }
  
  if (UndoOrRedo == 'redo' && (lastUndoAction - i) > 1){
    // console.log(undoarray[actionarray.indexOf(i-1)]);
    console.log('Redo has stopped');
    return; // redoはundo履歴を遡るが、undoしてpaintやeraseをして、さらにundoした場合のredoは、最後にしたundo郡に対してredoする。
  }

  console.log('A proper action cursor was ' + i);
  lastUndoAction = i;
  
  var idxloc = actionarray.indexOf(i);
  // actioncursor = actionarray[idxloc];

  if (typeOfOperations[idxloc].type === "pixel") {
    // undoidx = idxsequence[len - undostep - 1];
    // console.log(idxloc);
    var lastaction = flagarray[idxloc]; //flagarray[len-undostep-1];
    var Impix = xyarray[idxloc];
    var ImPix_x = Impix[0];
    var ImPix_y = Impix[1];
    if (!lastaction) { // if the last action is 0(erase)  
      var newrect = makeNewRect(ImPix_x, ImPix_y);
      newrect.on("click tap", checkEraseRect);
      // linidx_r = (ImPix_y - 1) * wid + ImPix_x; ////////
      // idxloc_r = idxarray.indexOf(linidx_r);
      // idxsequence.push(idxloc_r); //redrawn
      layer.add(newrect);
      layer.draw();
      undoarray[idxloc] = newundoflag;
      actionarray[idxloc]= actioncnt;
      actioncnt = actioncnt + 1;
      // actioncursor = actioncursor -1;
    } else {
      var stgposition = stage.position();
      var RectPos = {
        // x: (clickpix[0] - stage.offsetX()) * currentscale + currentscale / 2,  ///////
        // y: (clickpix[1] - stage.offsetY()) * currentscale + currentscale / 2   ///////
        x: (ImPix_x+0.5)*currentscale + stgposition.x, // Left-top Impix is [0, 0]. So, add 0.5 to point the center of the pixel.
        y: (ImPix_y+0.5)*currentscale + stgposition.y 
      };
      // console.log(pointerPos);
      var existingrect = stage.getIntersection(RectPos, "Rect");
      // console.log(existingrect);
      if (existingrect.className == "Rect") {
        existingrect.destroy();
        layer.draw();
        undoarray[idxloc] = newundoflag;
        actionarray[idxloc]= actioncnt;
        actioncnt = actioncnt + 1;
        // actioncursor = actioncursor -1;
      }
    }
    flagarray[idxloc] = lastaction == 0 ? 1 : 0;  // 0 to 1, 1 to 0.
    // undostep = undostep + 1;
    showstatus();
  }else if(typeOfOperations[idxloc].type === "vec"){
    undovec();
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

function checkEraseRect(evt) {
  obj = evt.target;
  if ($("#erase_check").is(":checked")) {
    var rectPos = obj.getPosition();  //Top-left pixel coordinate of the rect on the image. There is 0.1 pixel spacing, so the top-left rect's pos will be [0.1,0.1] 
    // console.log(rectPos);
    var ImPix_x = Math.floor(rectPos.x);
    var ImPix_y = Math.floor(rectPos.y);
    // linidx_d = (clickY_d - 1) * wid + clickX_d; 
    var linearindex = ImPix_y * wid + ImPix_x;
    var idxloc = idxarray.indexOf(linearindex);
    if (idxloc != -1) {
      // idxsequence.push(idxloc_d);/////
      // undostep = 0;
      flagarray[idxloc] = 0;
      actionarray[idxloc] = actioncnt;
      // actioncursor = actioncnt;
      actioncnt = actioncnt + 1;
      undoarray[idxloc] = 0;

      obj.destroy();
      layer.draw();
      showstatus();
    }
  }
}

function eraseRect(ImPix_x,ImPix_y){

  var linearindex = ImPix_y * wid + ImPix_x;
  var idxloc = idxarray.indexOf(linearindex);
  var stgposition = stage.position();
  var RectPos = {
    x: (ImPix_x+0.5)*currentscale + stgposition.x, // Left-top Impix is [0, 0]. So, add 0.5 to point the center of the pixel.
    y: (ImPix_y+0.5)*currentscale + stgposition.y 
  };

  var existingrect = stage.getIntersection(RectPos, "Rect");

  if (existingrect.className == "Rect") {
    existingrect.destroy();
    layer.draw();
    flagarray[idxloc] = 0;
    undoarray[idxloc] = 0;
    actionarray[idxloc]= actioncnt;
    actioncnt = actioncnt + 1;
    showstatus();
  } 
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


stage.on("touchstart mousedown", function() {
  mousedown = true;
  mouseevt();
});
stage.on("mousemove", mouseevt);
stage.on("mouseup", function() {
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


// Mitsu's scroll zooming
var scaleBy = 1.1;
stage.on("mousewheel", e => {
    e.evt.preventDefault();
    var oldScale = stage.scaleX();

    var mousePointTo = {
      x: stage.getPointerPosition().x / oldScale - stage.x() / oldScale,
      y: stage.getPointerPosition().y / oldScale - stage.y() / oldScale
    };

    var newScale =
      e.evt.deltaY > 0 ? oldScale * scaleBy : oldScale / scaleBy;
    stage.scale({ x: newScale, y: newScale });

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

  n = 1; // Num of digits after the decimal point.
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
  console.log('actionarray:' + actionarray);
  console.log('idxarray   :' + idxarray);
  console.log('flagarray  :' + flagarray);
  console.log('undoarray  :' + undoarray);
  // console.log('currentactioncursor:' + actioncursor);
}




// Adam's scroll zooming
// window.addEventListener("wheel", event => {
//     const delta = Math.sign(event.deltaY);
//     console.info(delta);
//     var current_v = $('#zoom_level_image').text();
//     var newscale = Number(current_v) + Number(delta);
//     $('#zoom_level_image').text(newscale);
//     var change = Math.pow(2, newscale); // (slider.value * (maxScaleStage - minScaleStage) / 100) + minScaleStage;
//     stage.scale({ x: change, y: change });
//     stage.batchDraw();
//     currentscale = change;
// });


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
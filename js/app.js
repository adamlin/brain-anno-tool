
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


var wid = 512;
var hei = 512;
var currentscale = 2;
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

var layer = new Konva.Layer(); // layer for pixel painting
// var layer_vector = new Konva.Layer(); // layer for vector drawings

var isPaint = false;

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

var idxarray = []; // for lookup
var flagarray = []; // erased or not
var undostep = 0;
var xyarray = []; // painted locations in image coordinates
var colorarray = [];
var idxsequence = []; // sequence of idxs operated on
var typeOfOperations = [];

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

function makeNewRect(clickX, clickY) {
  return new Konva.Rect({
    x: clickX + 0.1,
    y: clickY + 0.1,
    width: 0.8,
    height: 0.8,
    // fill: colorlist[currentcoloridx - 1], //'#4b26df',
    fill: $('#picker').colorpicker("val"),
    draggable: false
  });
}
function checkEraseRect(evt) {
  obj = evt.target;
  if ($("#erase_check").is(":checked")) {
    pos = obj.getPosition();
    clickX_d = Math.floor(pos.x); //currentscale;
    clickY_d = Math.floor(pos.y); //currentscale;
    linidx_d = (clickY_d - 1) * wid + clickX_d;
    idxloc_d = idxarray.indexOf(linidx_d);
    if (idxloc_d != -1) {
      console.log(clickX_d, clickY_d);
      idxsequence.push(idxloc_d);
      undostep = 0;
      flagarray[idxloc_d] = 0;
      obj.destroy();
      layer.draw();
    }
  }
}
function paintRect(clickpos) {
  // clickX = Math.floor(clickpos.x / currentscale) + stage.offsetX(); //Mitsu
  // clickY = Math.floor(clickpos.y / currentscale) + stage.offsetY(); //Mitsu

/// Mitsu added ///
  stgposition = stage.position();
  clickX = Math.floor((clickpos.x - stgposition.x) / currentscale);
  clickY = Math.floor((clickpos.y - stgposition.y) / currentscale);
///////////////////

  linearindex = (clickY - 1) * wid + clickX;
  idxloc = idxarray.indexOf(linearindex);
  var existingrect = stage.getIntersection(clickpos, "Rect");
  if (existingrect.className == "Image") {
    if (idxloc != -1 && flagarray[idxloc] == 1) {
      //already exists
    } else {
      idxarray.push(linearindex);
      flagarray.push(1);
      xyarray.push([clickX, clickY]);
      idxsequence.push(idxarray.length - 1);
      undostep = 0;
      newrect = makeNewRect(clickX, clickY);
      colorarray.push(currentcoloridx);
      newrect.on("click tap", checkEraseRect);
      // console.log(positionForColor[currentcoloridx]);
      if (!positionForColor[currentcoloridx]) {
        positionForColor[currentcoloridx] = [];
      }
      // console.log(positionForColor[currentcoloridx]);
      positionForColor[currentcoloridx].push([clickX, clickY]);
      layer.add(newrect);
      layer.draw();
    }
  } else {
    //console.log(clickpos);
  }
}
var currentvector = undefined;

function mouseevt() {
  clickpos = stage.getPointerPosition();
  // clickX = Math.floor(clickpos.x / currentscale) + stage.offsetX(); //Mitsu
  // clickY = Math.floor(clickpos.y / currentscale) + stage.offsetY();

/// Mitsu added ///
  stgposition = stage.position(); //Mitsu
  clickX = Math.floor((clickpos.x - stgposition.x) / currentscale);
  clickY = Math.floor((clickpos.y - stgposition.y) / currentscale);
///////////////////

  //console.log(clickpos)
  if ($("#erase_check").is(":checked")) {
  } else if (isPaint) {
    var selection = $("input[name=drawingtype]:checked").val();
    var vecname = "hopefully-unique-" + typeOfOperations.length;
    stage.draggable(false); // Mitsu
    if (selection == "vector_linestring" || selection == "vector_polygon") {
      // the below is now at mouseup event listener
      // as vectors need to be acted upon as a whole.
      // typeOfOperations.push({
      //   type: "vec",
      //   data: { name: vecname }
      // });

      if (currentvector == undefined) {
        currentvector = makeNewLine(false);
        layer.add(currentvector);
      }
      currentvector.points(currentvector.points().concat([clickX, clickY]));
      currentvector.stroke($('#picker').colorpicker("val")); //colorlist[currentcoloridx - 1]);
      currentvector.draw();
      currentvector.name(vecname);
    } else if (selection == "raster_pixel") {
      // we push pixel information here as pixels need to be acted upon individually.
      typeOfOperations.push({
        type: "pixel"
        //data: {name: 'hopefully-unique-' + typeOfOperations.length}
      });
      paintRect(clickpos);
    } else if (selection == "pointer") { //Mitsu added
      isPaint = false;
      stage.draggable(true);
    }

    // For cursor type Mitsu
    var selection = $("input[name=drawingtype]:checked").val();
    if (selection == "pointer") {
      stage.container().style.cursor = 'pointer';
    }else{
      stage.container().style.cursor = 'default';
    }

  }
}
$("#leftbutton").click(function() {
  currentoffset = stage.getOffset();
  stage.setOffset({ x: currentoffset.x - 10, y: currentoffset.y + 0 });
  stage.draw();
});
$("#rightbutton").click(function() {
  currentoffset = stage.getOffset();
  stage.setOffset({ x: currentoffset.x + 10, y: currentoffset.y + 0 });
  stage.draw();
});
$("#upbutton").click(function() {
  currentoffset = stage.getOffset();
  stage.setOffset({ x: currentoffset.x + 0, y: currentoffset.y - 10 });
  stage.draw();
});
$("#downbutton").click(function() {
  currentoffset = stage.getOffset();
  stage.setOffset({ x: currentoffset.x + 0, y: currentoffset.y + 10 });
  stage.draw();
});
$("#centerbutton").click(function() {
  stage.setOffset({ x: 0, y: 0 });
  stage.draw();
});
stage.on("touchstart mousedown", function() {
  isPaint = true;
  mouseevt();
});
stage.on("mousemove", mouseevt);
stage.on("mouseup", function() {
  isPaint = false;
  console.log(positionForColor);

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




function undoPixel() {
  len = idxsequence.length;
  if (undostep > len - 1) {
    return;
  }
  undoidx = idxsequence[len - undostep - 1];
  lastaction = flagarray[undoidx]; //flagarray[len-undostep-1];
  flagarray[undoidx] = lastaction == 0 ? 1 : 0;
  if (!lastaction) {
    pos = xyarray[undoidx];
    clickX = pos[0];
    clickY = pos[1];
    newrect = makeNewRect(clickX, clickY);
    newrect.on("click tap", checkEraseRect);
    linidx_r = (clickY - 1) * wid + clickX;
    idxloc_r = idxarray.indexOf(linidx_r);
    // idxsequence.push(idxloc_r); //redrawn
    layer.add(newrect);
    layer.draw();
  } else {
    clickpix = xyarray[undoidx];
    clickpos = {
      x: (clickpix[0] - stage.offsetX()) * currentscale + currentscale / 2,
      y: (clickpix[1] - stage.offsetY()) * currentscale + currentscale / 2
    };
    var existingrect = stage.getIntersection(clickpos, "Rect");
    if (existingrect.className == "Rect") {
      existingrect.destroy();
      layer.draw();
    }
  }
  undostep = undostep + 1;
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

$("#picker").change(function() {
  currentcoloridx = this.value;
});
$("#undobutton").click(function() {
  if (typeOfOperations[typeOfOperations.length - 1].type === "pixel") {
    undoPixel();
  } else if (typeOfOperations[typeOfOperations.length - 1].type === "vec") {
    undovec();
  }
  if (typeOfOperations.length > 0) {
    typeOfOperations.pop();
  }
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


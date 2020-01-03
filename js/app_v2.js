function csrfSafeMethod(method) {
  // these HTTP methods do not require CSRF protection
  return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}

function getCookie(name) {
  var cookieValue = null;
  if (document.cookie && document.cookie !== '') {
      var cookies = document.cookie.split(';');
      for (var i = 0; i < cookies.length; i++) {
          var cookie = cookies[i].trim();
          // Does this cookie string begin with the name we want?
          if (cookie.substring(0, name.length + 1) === (name + '=')) {
              cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
              break;
          }
      }
  }
  return cookieValue;
}
var csrftoken = getCookie('csrftoken');

$.ajaxSetup({
  beforeSend: function(xhr, settings) {
      if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
          xhr.setRequestHeader("X-CSRFToken", csrftoken);
      }
  }
});

// var wid = 4096;
// var hei = 4096;
var app = {};
app.category = undefined; // initial category
app.tracer = undefined;

app.currentcolor = undefined; // initial color

var colorForUndefined = '#808080';
// var indicesWithSaidColor = [];
// var positionForColor = {};
colorTable = {  // Temporally.
  'process': 'rgba(253,225,87,0.7)',
  'injsoma': 'rgba(253,225,87,0.7)',
  'bouton': 'rgba(253,225,87,0.7)',

  'axon': 'rgba(253, 225, 87, 0.7)',
  'axon.fasciculated': 'rgba(253, 225, 87, 0.7)',
  'axon.terminal_arbor': 'rgba(253, 225, 87, 0.7)',
  'axon.passing_no_fasciculated': 'rgba(253, 17, 87, 0.7)',
  'axon.synaptic_swelling': 'rgba(253, 225, 87, 0.7)',

  'dendrite': 'rgba(218, 87, 253, 0.7)', 
  'dendrite.synaptic_swelling': 'rgba(253, 225, 87, 0.7)',
  'dendrite.dendritic_fiber':'rgba(253, 117, 87, 0.7)',
  'dendrite.soma': 'rgba(253, 225, 87, 0.7)',

  // 'passing fiber': 'rgba(253, 17, 87, 0.7)',
  // 'axon fiber':'rgba(218, 87, 253, 0.7)',
  'neurites.unidentifiable':'rgba(253, 87, 231, 0.7)',

  // 'autofluorescence': 'rgba(87, 198, 253, 0.7)',
  'artifact': 'rgba(253, 140, 87, 0.7)',
  'artifact.autofluorescent_cell':'rgba(117, 87, 253, 0.7)',
  'artifact.dust':'rgba(17, 87, 253, 0.7)'
};

tracerlist = ['na','red','green','red+green','fastblue','ctb','nissl','myelin'];
typelist = ['N','F','M','C']; // is this the value in url var 'type'?
//FIXME:  make similar list for url var 'color'..
colorlist = ['R','G']; //...

var mouseLeftDown = false;
var mouseRightDown = false;
var touchDown = false;

app.UndoOrRedo = 0;

var actionarray = {}; //Associative array. Key is a action count.
var idxaction = {}; //Associative array. Key is a linearindex.

app.actioncnt = 0;
var ActCursorForRedo = undefined;
var lastActIsUndoRedo = 0;
var lastActIsEraseOrPaint = 0;

var disp = {};
disp.currentscale = 0.5;
// var currentvector = undefined;

var initBrushsize = 9; // Temporally. Brush size should be set at selector when page loaded.
var brushmatrix = undefined;

var age = 20;  // The old history of pixels that are not be shown (destroyed) and are older than 'age' will be deleted from the record (can not undo)  
// var outObj = {};

var rectMargin = 0.1;

var activatedBtn = 'pointer'; // Temporally. drawing type should be set at tool button when page loaded.

function setInitValue (){
  // Set category and color 
  setCtgAndColor(app.category);

  // magnify slider
  $("#myRange").val(disp.currentscale);
  $("#zoomlabel").html(disp.currentscale);

  // paint brush size
  brushmatrix = calBrushMatrix(initBrushsize);
}

function initializeStage (){
  var stageWidth = $(window).width();
  // var stageHeight = $(window).height() - 125;
  var stageHeight = $(window).height();

  stage = new Konva.Stage({
    container: "container",
    width: stageWidth, //window.innerWidth,
    height: stageHeight, //window.innerHeight - 45,
    scale: { x: disp.currentscale, y: disp.currentscale },
    draggable: false // if this is changed, then stage offset should be considered while recording points
  });

  layer = new Konva.Layer(); // layer for pixel painting
  // var layer_vector = new Konva.Layer(); // layer for vector drawings
  stage.add(layer);

  const nativeCtx = layer.getContext()._context; //https://github.com/konvajs/konva/issues/306
  nativeCtx.webkitImageSmoothingEnabled = false;
  nativeCtx.mozImageSmoothingEnabled = false;
  nativeCtx.imageSmoothingEnabled = false;
  nativeCtx.msImageSmoothingEnabled = false;

  bgImage = new Image();
  
  // mskImage = new Image(); // set in control::selectedTile

  bgImage.onload = function() {
    var outimg = new Konva.Image({
        x: 0,
        y: 0,
        width: app.tilewid,
        height: app.tilehei,
        image: bgImage,
        draggable: false
    });

    layer.add(outimg);
    layer.draw();
    // layer_vector.draw();
  };
  // bgImage.src = "https://image.freepik.com/free-vector/sun-shining-blue-sky-with-white-clouds-realistic-background_1284-10467.jpg";
  bgImage.src = "";
}

function makeNewLine(isPolygon) {
  // return new Konva.Line({
  //   points: [],
  //   closed: isPolygon,
  //   stroke: $('#picker').colorpicker("val"),
  //   strokeWidth: 0.2, //TODO: smooth lines?
  //   visible: true,
  //   opacity: 1,
  //   tension: 0
  // });
}

function makeNewRect(ImPix_x, ImPix_y, color, linearindex) {
  return new Konva.Rect({
    id: linearindex,
    x: ImPix_x+rectMargin, //0.1 -> 0.1 + 0.8 + 0.1 = 1
    y: ImPix_y+rectMargin,
    width: 1-2*rectMargin, //0.8
    height: 1-2*rectMargin,
    // fill: color == undefined ? $('#picker').colorpicker("val") : color,
    fill: color,
    draggable: false,
    // category: 'kategori-'
  });
}

function mouseevt() {
  var pointerPos = stage.getPointerPosition(); //Pointer position on the image. Left-top of the container(background) is the [0 0].
  var stgposition = stage.position(); // The distance of the stage from the left-top of the container.
  var ImPix_x = Math.floor((pointerPos.x - stgposition.x) / disp.currentscale); // X coordinate of the pixel of the image where the cursor is on. Top-left is 0.
  var ImPix_y = Math.floor((pointerPos.y - stgposition.y) / disp.currentscale);
  // console.log(ImPix_y);

  // var selection = $("input[name=drawingtype]:checked").val();
    if (mouseLeftDown == true){// || touchDown == true) {
    if (activatedBtn == "pointer") {
      stage.draggable(true);
      // stage.children.cache();
    }else if (activatedBtn == "erase") {
      stage.draggable(false);
      // stage.children.clearCache();
      eraseRect(ImPix_x,ImPix_y);
      // showstatus();
    }else if (activatedBtn == "raster_pixel"){
      stage.draggable(false);
      // stage.children.clearCache();
        // console.log('[[ Start painting ]]');
      for (var i = 0; i < brushmatrix.length; i++) {
        paintRect(ImPix_x+brushmatrix[i][0], ImPix_y+brushmatrix[i][1], pointerPos);
      }
      layer.batchDraw();
      app.actioncnt = app.actioncnt + 1;  // paintしなくてもactionが加算されることに注意
      // console.log('[[ The last action(painting) done ]]');
      // showstatus();
    }else if (activatedBtn == "vector_linestring" || activatedBtn == "vector_polygon") {
      // stage.draggable(false);
      // var vecname = "hopefully-unique-" + typeOfOperations.length; ///
      // if (currentvector == undefined) {
      //     currentvector = makeNewLine(false);
      //     layer.add(currentvector);
      // }
      // currentvector.points(currentvector.points().concat([ImPix_x, ImPix_y]));
      // currentvector.stroke($('#picker').colorpicker("val")); //colorlist[currentcolor - 1]);
      // currentvector.draw();
      // currentvector.name(vecname);
    }
  }
}

function paintRect_firstpass(ImPix_x, ImPix_y) {
  var linearindex = ImPix_y * app.tilewid + ImPix_x; // Left-top is 0.
  var newrect = makeNewRect(ImPix_x, ImPix_y,app.currentcolor,linearindex);
    // newrect.on("click tap", checkEraseRect);
    
  layer.add(newrect);
  // newrect.cache();
  // return linearindex;
  return newrect;
}

function paintRect(ImPix_x, ImPix_y, pointerPos) {
	var linearindex = ImPix_y * app.tilewid + ImPix_x; // Left-top is 0.
	var action = idxaction[linearindex]; // Search the last action number of the pixel
  // console.log('linearindex is '+linearindex);
  // console.log('action # is '+action);
	
	// var existingrect = stage.getIntersection(pointerPos, "Rect");
	// if (existingrect.className == "Image") {  /////////// どういう役割？

  if (action != undefined && actionarray[action].flag == 1) {
    // console.log('already exist');
  }else if (action != undefined && actionarray[action].flag == 0){ // When the pixel is empty by erasing or undo/redo at last time.
    var newrect = makeNewRect(ImPix_x, ImPix_y,app.currentcolor,linearindex);
    // newrect.on("click tap", checkEraseRect);
    layer.add(newrect);
    // layer.draw();

    if (actionarray[app.actioncnt] == undefined) { // 新しくactionを作る. Use associative array not to make a unnecessary empties.
      actionarray[app.actioncnt] = {
        category: app.category,
        color: app.currentcolor,
        flag: 1,
        undo: 0,
        // type: "pixel",
        lindex: {}
      };
    }
    actionarray[app.actioncnt].lindex[linearindex] = JSON.parse(JSON.stringify(actionarray[action].lindex[linearindex])); //元のstatusを新しいactionにコピー(deep copy)
    // console.log(actionarray[action]);
    // actionarray[actioncnt][linearindex]['flag'] = 1;
    // actionarray[actioncnt][linearindex]['undo'] = 0;
    // actionarray[actioncnt][linearindex]['color'] = currentcolor;
    // actionarray[actioncnt][linearindex]['type'] = "pixel";

    idxaction[linearindex] = app.actioncnt; //action countの更新

    delete actionarray[action].lindex[linearindex]; // 元のactionを削除する
    if (Object.keys(actionarray[action].lindex).length == 0) {
      delete actionarray[action]; // To reduce memory usage.
    }

    lastActIsUndoRedo = 0;
    lastActIsEraseOrPaint = 1;

    // if (!positionForColor[currentcolor]) {  /// need check
    //   positionForColor[currentcolor] = [];
    // }
    // positionForColor[currentcolor].push([ImPix_x, ImPix_y]); /// need check
    
  }else{ // Make a new rect at a new pixel
    var newrect = makeNewRect(ImPix_x, ImPix_y,app.currentcolor,linearindex);
    // newrect.on("click tap", checkEraseRect);
    layer.add(newrect);
    // layer.draw();
    
    if (actionarray[app.actioncnt] == undefined) { // 新しくactionを作る. Use associative array not to make a unnecessary empties.
      actionarray[app.actioncnt] = {
        category: app.category,
        color: app.currentcolor,
        flag: 1,
        undo: 0,
        // type: "pixel",
        lindex: {}
      };
    }

    // push a new status to the array.
    actionarray[app.actioncnt].lindex[linearindex] = {
      xy: [ImPix_x, ImPix_y],
      // flag: 1,
      // undo: 0,
      // color: currentcolor,
      // type: "pixel"
    };
    
    idxaction[linearindex] = app.actioncnt;

    lastActIsUndoRedo = 0;
    lastActIsEraseOrPaint = 1;

    // if (!positionForColor[currentcolor]) {  /// need check
    //   positionForColor[currentcolor] = [];
    // }
    // positionForColor[currentcolor].push([ImPix_x, ImPix_y]); /// need check

  }
}


function UndoRedo() {
  var properActCursor = -1;
  var newundo = undefined;

  var keys=[];

  if (app.UndoOrRedo == 'undo'){
    newundo = 1;

    // for (var i = app.actioncnt-1; i>0 && !(actionarray[i] != undefined && actionarray[i].undo == 0); i--){
    for (var i = app.actioncnt-1; i>=0; i--){
      // console.log('### Searching a correct action number... ###');  
      // console.log('The action cursor ' + i + ' was not what we want to undo/redo for.');
      // console.log('Next, try a cursor ' + (i-1));
      if(actionarray[i] == undefined)
        continue;

      if ((lastActIsEraseOrPaint == 0 && actionarray[i].flag == 1) || (lastActIsEraseOrPaint == 1 && actionarray[i].flag == 0)) {
        // console.log('No more undo');
        // return //Eraseを一旦したら、そのErase郡以前のものをUndoできないようにする。同様に一旦Paintをしたら、そのPaint郡以前のものをUndoできないようにする。ただし、過去にEraseしたところをすべてPaintした場合は、undo=0かつflag=0の場所が無くなるので、eraseがそもそも無かったことになり、すべて１つのPaint郡として捉えられる。
        continue;
      }

      properActCursor = i;
      keys = Object.keys(actionarray[properActCursor].lindex);
      break;
    }
  }else if(app.UndoOrRedo == 'redo'){
    newundo = 0;

    if (ActCursorForRedo == undefined) {
      console.log('Undo first before redo.');
      return;
    }else if (lastActIsUndoRedo == 0) {
      console.log('The last action need to be Undo or redo.');
      return;
    }else {
      while(ActCursorForRedo>=0 && actionarray[ActCursorForRedo]==undefined)
        ActCursorForRedo = ActCursorForRedo -1;
      if (ActCursorForRedo!=-1 && actionarray[ActCursorForRedo]!=undefined && actionarray[ActCursorForRedo].undo != 1) { //最後のredoを行ったundoのactionの1個前のactionがundoでなければいけない。 
        console.log('No more redo');
        return;
      }
    }

    properActCursor = ActCursorForRedo;
    keys = Object.keys(actionarray[properActCursor].lindex);
  }

  // console.log('Found a proper action cursor to do undo/redo: ' + properActCursor);
  
  // if (actionarray[properActCursor]['type'] === "pixel") {
  if(properActCursor!=-1)
    undopix(properActCursor, keys, newundo);
  // }else if(actionarray[properActCursor]['type'] === "vec"){
    // undovec();
  // }

  // For the next redo.
  if (app.UndoOrRedo == 'undo'){
    if(properActCursor!=-1)
      ActCursorForRedo = properActCursor; //app.actioncnt;
  }else if (app.UndoOrRedo == 'redo') {
    ActCursorForRedo = ActCursorForRedo -1;
  }
  app.actioncnt = app.actioncnt + 1;
  // showstatus();
}

function undopix(properActCursor, keys, newundo){
  var lastaction = actionarray[properActCursor].flag;
  var newflag = undefined;
  // keys.forEach(function(key){
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var Impix = actionarray[properActCursor].lindex[key].xy;
    var ImPix_x = Impix[0];
    var ImPix_y = Impix[1];
    if (!lastaction) { // if the last action is 0 (erase), then redraw.
      newflag = 1;
      var orgColor = actionarray[properActCursor].color;
      var newrect = makeNewRect(ImPix_x, ImPix_y, orgColor, key);  /////////////color needs to match to the original
      // newrect.on("click tap", checkEraseRect);
      layer.add(newrect);
      // layer.draw();
    } else { // if the last action is 1 (paint), then erase.
      newflag = 0;
      var stgposition = stage.position();
      var RectPos = {
        x: (ImPix_x+0.5)*disp.currentscale + stgposition.x, // Left-top Impix is [0, 0]. So, add 0.5 to point the center of the pixel.
        y: (ImPix_y+0.5)*disp.currentscale + stgposition.y 
      };
      // console.log(pointerPos);
      var existingrect = stage.getIntersection(RectPos, "Rect");
      // console.log(existingrect);
      if (existingrect.className != "Rect") {continue}
      existingrect.destroy();
      // layer.draw();
    }

    // Make a new action
    if (actionarray[app.actioncnt] == undefined) { // 新しくactionを作る. Use associative array not to make a unnecessary empties.
      actionarray[app.actioncnt] = {
        category: actionarray[properActCursor].category,
        // color: actionarray[properActCursor]['color'],
        flag: newflag,
        undo: newundo,
        // type: "pixel",
        lindex: {}
      };
    }
    xy = JSON.parse(JSON.stringify(actionarray[properActCursor].lindex[key].xy));
    actionarray[app.actioncnt].lindex[key] ={xy:xy}; //JSON.parse(JSON.stringify(actionarray[properActCursor]['lindex'][keys[i]])); //元のstatusを新しいactionにコピー(deep copy)
    // actionarray[actioncnt][keys[i]]['flag'] = newflag;
    // actionarray[actioncnt][keys[i]]['undo'] = newundo;

    idxaction[key] = app.actioncnt; //action countの更新

    delete actionarray[properActCursor].lindex[key]; // 元のactionを削除する
    if (Object.keys(actionarray[properActCursor].lindex).length == 0) {
      delete actionarray[properActCursor]; // To reduce memory usage.
    }

    lastActIsUndoRedo = 1;
    // showstatus();
  }//);
  layer.batchDraw();
}

function undovec() {
  // var vecName = typeOfOperations[typeOfOperations.length - 1].data.name;
  // console.log(vecName);
  // var foundvec = layer.getChildren(function(node) {
  //   return node.name() === vecName;
  // });
  // var foundarray = foundvec.toArray();
  // //foundarray[0]
  // console.log(foundarray);
  // foundarray[0].destroy();
  // layer.draw();
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
  for (var i = 0; i < brushmatrix.length; i++) {
    var x = brushmatrix[i][0];
    var y = brushmatrix[i][1];

    var linearindex = (ImPix_y+y) * app.tilewid + (ImPix_x+x);
    var action = idxaction[linearindex];
    // console.log(action);
    if (action == undefined) {
      // console.log('No action history for liner id: ' + linearindex);
      // continue
      // NOTE: might be erase on first pass - so don't continue
    }

    var stgposition = stage.position();
    var RectPos = {
    	x: (ImPix_x+x+0.5)*disp.currentscale + stgposition.x, // Left-top Impix is [0, 0]. So, add 0.5 to point the center of the pixel.
    	y: (ImPix_y+y+0.5)*disp.currentscale + stgposition.y 
    };

    var existingrect = stage.getIntersection(RectPos, "Rect");

    if (existingrect.className == "Rect") {
    	existingrect.destroy();
      // layer.draw();
      
      cat = app.category;
      // color = colorTable[app.category];
      // typ = "pixel";
      xy = [ImPix_x,ImPix_y];
      if(action!=undefined) {
        cat = actionarray[action].category;
        // color = actionarray[action]['color'];
        // typ = actionarray[action]['type'];
        xy = JSON.parse(JSON.stringify(actionarray[action].lindex[linearindex].xy));
      }

      if (actionarray[app.actioncnt] == undefined) {
        actionarray[app.actioncnt] = {
          category: cat,
          // color: color,
          flag: 0,
          undo: 0,
          // type: typ,
          lindex: {}
        }; // 新しくactionを作る. Use associative array not to make a unnecessary empties.
      }

      // actionarray[app.actioncnt]['lindex'][linearindex] = JSON.parse(JSON.stringify(actionarray[action]['lindex'][linearindex])); //元のstatusを新しいactionにコピー (deep copy)
      actionarray[app.actioncnt].lindex[linearindex] = {xy: xy};
      // console.log(actionarray[action]);
      // actionarray[actioncnt][linearindex]['flag'] = 0;
      // actionarray[actioncnt][linearindex]['undo'] = 0;

      if(action!=undefined) {
        delete actionarray[action].lindex[linearindex]; // 元のactionを削除する

        if (Object.keys(actionarray[action].lindex).length == 0) {
          delete actionarray[action]; // To reduce memory usage.
        }
      }

      lastActIsUndoRedo = 0;
      lastActIsEraseOrPaint = 0;

      idxaction[linearindex] = app.actioncnt; //action countの更新
    }
	}
  // layer.batchDraw();
  layer.draw(); // draw is faster than batchdraw for erase?
  app.actioncnt = app.actioncnt + 1;
  // console.log('[[ The last action(erasing) done ]]');
  // showstatus();
}

function minimizehistory(){ // To reduce memory use.
  var count = 0;
  var actiokeys = Object.keys(actionarray); //Key(action number) is supposed to be in order from small to big.
  if (actiokeys.length < age+1) {return}

  for (var i = 0; i<(actiokeys.length - age); i++) {
    var action = actiokeys[i];
    var linearindexkeys = Object.keys(actionarray[action]['lindex']);
    if (actionarray[action]['flag'] == 0) {
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
      //   outObj.push(outtemp);
      //   delete actionarray[action][linearindexkeys[k]];
      //   delete idxaction[linearindexkeys[k]];
      // }
      // delete actionarray[action];
    }
  }
  console.log('Total '+ count +' old undo record were deleted.');
  showstatus();
}

function storeObj(todb){
  // Temporally. Later, get value from selector.
  // var tileNo = current_section; //'7_10';
  // var Imagename = app.brain_id; //'Marmoset_0001';
  // var category = 'Cell body';
  // var color = undefined;

  var outObj_template = { //初期化
    imagename: app.brain_id,
    series_id: ""+app.series_id,
    section_id: ""+app.section_id,
    section: ""+app.current_section, //defined in pixel.html
    tile: parseInt(app.sel_tile),
    tile_wid: app.tilewid,
    tile_hei: app.tilehei,
    image_wid: app.width,
    image_hei: app.height,
    annotator:'default', //FIXME
    category: '',
    tracer: app.tracer,
    // pixObj: [],
    feature: undefined
  };

  pointarray = [{},{}]; // 0=> del, 1=> add

  var actiokeys = Object.keys(actionarray); //Key(action number) is supposed to be in order from small to big.
  
  actiokeys.forEach(function(action){

  // for (var i = 0; i<actiokeys.length; i++) {
    // var action = actiokeys[i];
      var ac = actionarray[action];
    
      cat = ac.category;
      
      if(!pointarray[ac.flag].hasOwnProperty(cat))
        pointarray[ac.flag][cat]=[]

      var linearindexkeys = Object.keys(ac.lindex);
    
      linearindexkeys.forEach(function(elt) {
        xy = ac.lindex[elt].xy;        
        pointarray[ac.flag][cat].push(xy);
      });
      // for (var k = 0; k<linearindexkeys.length; k++) {
      //   xy = actionarray[action].lindex[]
      //   var outtemp = JSON.parse(JSON.stringify(actionarray[action]['lindex'][linearindexkeys[k]])); //元のオブジェクトをコピー (deep copy), 注意点あり。 https://leben.mobi/blog/copy_arrays_and_objects_without_loop/javascript/
      //   // delete outtemp['flag'];
      //   // delete outtemp['undo'];
      //   // delete outtemp['type'];
      //   outObj['category'] = actionarray[action]['category'];
      //   // outObj['pixObj'].push(outtemp);
      //   pointarray.push(outtemp.xy);
      // }
    
  });
  apibase = 'http://mitradevel.cshl.org/webtools/seriesbrowser';
  // apibase = "http://localhost:8000/mbaservices/annotationservice/";
  apifuncnames = ['save_pixel_deletions/', 'save_pixel_additions/'];

  // make one set of messages for add, one for del
  for(ii = 0; ii < 2; ii++) {
    
    var categories = Object.keys(pointarray[ii]);
    categories.forEach(function(cat){
      var coordinates = pointarray[ii][cat];
      
      var numOfPix = coordinates.length;
      updateannotationtracking(cat, ii, app.tracer, numOfPix);

      if(todb != undefined) {
        outObj_template.feature = turf.multiPoint(coordinates);
        outObj_template.category = cat;

        var postdata = JSON.stringify(outObj_template);
        $.post(apibase+apifuncnames[ii],
            {'msg':postdata}, 
            function(resp){
              alert(JSON.stringify(resp));
            }
          );  
      }
    });
  }

  // outObj['feature']=turf.multiPoint(pointarray);

  
  // addnewannotation(category,color,numOfPix); // For object tracking by Adam
  

  //console.log(outObj);
  // return outObj;
  
}

var cumulateColorPoints = function(listOfColors) {
  // // listOfColors should be of the format ["6", "7", "8"]
  // var finalResult = {};
  // $.each(listOfColors, function(index, color) {
  //   finalResult[color] = {
  //     idxarray: [],
  //     xyarray: []
  //     // can put more here if you want
  //   };
  //   // took the reduce from
  //   // https://stackoverflow.com/a/20798754
  //   // https://stackoverflow.com/questions/966225/how-can-i-create-a-two-dimensional-array-in-javascript/966234#966234
  //   var indicesWithSaidColor = colorarray.reduce(function(a, e, i) {
  //     if (e === color) {
  //       a.push(i);
  //     }
  //     return a;
  //   }, []);
  //   $.each(indicesWithSaidColor, function(_, actualIndex) {
  //     // include more data that you want
  //     finalResult[color]["idxarray"].push(idxarray[actualIndex]);
  //     finalResult[color]["xyarray"].push(xyarray[actualIndex]);
  //   });
  // });
  // return finalResult;
};

function calBrushMatrix(brushsize) {
  brushmatrix = [];
  //var brushsize = $("#BrushSize").val();
  var calcnt = (Math.sqrt(brushsize) -1)/2;

  // To make brush circle.
  for (var x = -calcnt; x<calcnt+1; x++){
    for (var y = -calcnt; y<calcnt+1; y++) {
      if (calcnt == 1 && (x==-1 || y==-1)) {continue}
      if (calcnt > 1 && Math.pow(x*y,2) == Math.pow(calcnt,4)) {continue}
      brushmatrix.push([x,y]);
    }
  }
  return brushmatrix;
}

function setCtgAndColor(categoryTxt){
  app.category = categoryTxt; // Temporally. We should not use label(text)
  app.currentcolor = colorTable[app.category] == undefined ? colorForUndefined : colorTable[app.category];
  $('.drawing-color-change').css('color',"'" + app.currentcolor + "'");
  // console.log(currentcolor);
}

disp.currentscale = 0.5;

function setMouseEvt(){
  stage.on("touchstart mousedown", function(e) {
    var click = e.evt.button; //0 if it's left click. 2 if it's right click. 1 if it's middle click. 
    if (click == 0) {
      mouseLeftDown = true;
      mouseevt();
    }else if (click == 2) {
      mouseRightDown = true;
      // e.evt.preventDefault();
      // e.evt.stopPropagation(true);
      // stage.container().style.cursor = 'pointer';
      stage.draggable(true);
    }
  });

  stage.on("touchmove mousemove", function(){
    // For cursor type Mitsu
    // var selection = $("input[name=drawingtype]:checked").val();
    if (activatedBtn == "pointer" || mouseRightDown == true) {
      stage.container().style.cursor = 'pointer';
      touchDown = true;
    }else{
      stage.container().style.cursor = 'default';
      touchDown = true;
    }
    mouseevt();
  });

  stage.on("mouseleave", function(){
    mouseLeftDown = false;
    // console.log('mouseleft');
  });

  // stage.on('dragstart',function(){
  //   hideFirstPass();
  // });
  // stage.on('dragend',function(){
  //   unhideFirstPass();
  // });

  stage.on("mouseup", function(e) {
    var click = e.evt.button; //0 if it's left click. 2 if it's right click. 1 if it's middle click. 
    if (click == 0) {
      mouseLeftDown = false;
      // console.log(positionForColor);

      // var selection = $("input[name=drawingtype]:checked").val();
      // if (selection == "vector_polygon" && currentvector != undefined) {
        // currentvector.closed(true);
        // layer.draw();
      // }
      //TODO: push to array of drawn objects (for erase/undo), before undefining
      // erase/undo will require a filter array (0/1)
      // separate array for polygon and linestring required
      // in save, iterate through these two object arrays and add to geojson msg
      // currentvector = undefined;

      // if (selection == "vector_linestring" || selection == "vector_polygon") {
        // var vecname = "hopefully-unique-" + typeOfOperations.length;
        // // taking note of the type. Will be handy when we undo
        // typeOfOperations.push({
        //   type: "vec",
        //   data: { name: vecname }
        // });
      // }
      // } else if (selection == "raster_pixel") {
      //   typeOfOperations.push({
      //     type: "pixel"
      //   });
      // }
      // minimizehistory(); //FIXME: this was enabled
      // storeObj();
    }else if (click == 2) {
      mouseRightDown = false;
      console.log('To Do: disable the context menu pop up.');
      // stage.preventDefault(true);
      // e.evt.preventDefault();  /// Does not work
      // e.evt.stopPropagation();
    }
  });

  function scrollbounds(v){
      //limit from 0.5 to 8 for scroll
    return Math.min(8,Math.max(0.5,v));
  }

  
  var scaleIncrement = 0.5;
  var scaleBy = 1.1;
  var scrolldir = 1; //-1: scroll down goes to zoon-in. 1:-1: scroll down goes to zoon-out.

  // Mitsu's scroll zooming
  stage.on("mousewheel", e => {
    e.evt.preventDefault();
    var oldScale = stage.scaleX();

    var mousePointTo = {
      x: stage.getPointerPosition().x / oldScale - stage.x() / oldScale,
      y: stage.getPointerPosition().y / oldScale - stage.y() / oldScale
    };

    var newScale = oldScale;

    if (scrolldir == -1) {
      newScale =
      // e.evt.deltaY > 0 ? scrollbounds(oldScale * scaleBy) : scrollbounds(oldScale / scaleBy);
      e.evt.deltaY > 0 ? scrollbounds(oldScale+scaleIncrement) : scrollbounds(oldScale-scaleIncrement);
      stage.scale({ x: newScale, y: newScale });
    }else if (scrolldir == 1) {
      newScale =
      // e.evt.deltaY < 0 ? scrollbounds(oldScale * scaleBy) : scrollbounds(oldScale / scaleBy);
      e.evt.deltaY < 0 ?  scrollbounds(oldScale+scaleIncrement) : scrollbounds(oldScale-scaleIncrement);
      stage.scale({ x: newScale, y: newScale });
    }else{
      console.log('Choose a proper scroll direction');
      return
    }

    var newPos = {
      x: -(mousePointTo.x - stage.getPointerPosition().x / newScale) * newScale,
      y: -(mousePointTo.y - stage.getPointerPosition().y / newScale) * newScale
    };
    stage.position(newPos);
    stage.batchDraw();

    disp.currentscale = newScale;

    var n = 1; // Num of digits after the decimal point.
    newScale_show = Math.floor(newScale*Math.pow(10,n))/Math.pow(10,n);
    $("#myRange").val(newScale_show);
    $("#zoomlabel").html(newScale_show);
  });
}


function setElementAct(){
  // $("#picker").change(function() {
  //   currentcolor = this.value;
  // });

  $('#btn_firstpass').click(function(){
    if(app.category!= undefined) {
      // $('#image_loading_selected').css("display", "block");
      addFirstPass(app.section_id,app.current_section,app.sel_tile,app.category,app.tracer);
      // $('#image_loading_selected').css("display", "none");
    }
    else {
      alert('Select class of neurite');
    }
  });

  $('#btn_savedwork').click(function(){
    if(app.category!= undefined) {
      // $('#image_loading_selected').css("display", "block");
      fetchAdditions(app.section_id,app.current_section,app.sel_tile,app.category,app.tracer,'default');
      fetchDeletions(app.section_id,app.current_section,app.sel_tile,app.category,app.tracer,'default');
      // $('#image_loading_selected').css("display", "none");
    }
    else {
      alert('Select class of neurite');
    }
  });

  $("#undo_draw").click(function() {
    app.UndoOrRedo = 'undo';
    UndoRedo();
  });

  $("#redo_draw").click(function() {
    app.UndoOrRedo = 'redo';
    UndoRedo();
  });

  $("#savebutton").click(function() {
    // showstatus();
    //FIXME messages happen in store if flagged, just manage the array here
    //var annodata = 
    storeObj(true);
    // annodata.pixObj = null;
    // var postdata = JSON.stringify(annodata);
    // $.post("http://localhost:8000/mbaservices/annotationservice/save/",{'msg':postdata}, 
    //   function(resp){alert(resp.answer);}
    //   );

    // if(false) {
    //   //TODO: - done by storeObj
    //   // extract actionarray as geojson pointlist
    //   xyarray_filt_add = {};
    //   xyarray_filt_erase = {};

    //   for(const k of Object.keys(actionarray))
    //   {
    //     cat = actionarray[k].category;
    //     flg = actionarray[k].flag;

    //     for(const ii of Object.keys(actionarray[k].lindex))
    //     {
    //       pt = actionarray[k].lindex[ii].xy;
    //       xyarray_filt[cat][flg].push(pt);
    //     }
    //   }
    //   //FIXME: incomplete
    // }  

    // for (ii = 0; ii < xyarray.length; ++ii) {
    //   if (flagarray[ii] == 1) xyarray_filt.push(xyarray[ii]);
    // }
    // msg =
    //   '{"type":"MultiPoint", "coordinates":' + JSON.stringify(xyarray_filt) + "}";
    // //need to standardize export format of independant operation type.
    // alert(msg);

    // var children = layer.getChildren();

    // // get only lines
    // var lines = layer.getChildren(function(node){
    //   return node.getClassName() === 'Line';
    // });

    // //https://stackoverflow.com/questions/22464605/convert-a-1d-array-to-2d-array
    // for(ii=0;ii<lines.length;ii++){
    //   points = lines[ii].points();
    //   points_copy = points.slice();
    //   var coordinates = [];
    //   while(points_copy.length)
    //     coordinates.push(points_copy.splice(0,2));
      
    //   if(coordinates.length>0) {
    //     msg = '{"type":"Polygon","coordinates":'+JSON.stringify(coordinates)+'}';
    //     alert(msg);
    //   }
    // }
  });

  $("#clearbutton").click(function() {
    // var shapes = stage.find("Rect");
    // // var shapes = stage.find();
    // for (var i = 0; i < shapes.length; i++) {
    //   shapes[i].destroy();
    //   layer.draw();
    // }

    // var lines = stage.find("Line");
    // for (var i = 0; i < lines.length; i++) {
    //   lines[i].destroy();
    //   layer.draw();
    // }

    // typeOfOperations = [];
  });

  // $("#BrushSize").change(function(){calBrushMatrix()}); 

  // referring this https://konvajs.github.io/docs/sandbox/Zooming_Relative_To_Pointer.html
  $("#myRange").on('input',function() {
    var oldScale = stage.scaleX();
    var newscale = this.value;

    $("#zoomlabel").html(newscale);
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

    disp.currentscale = newscale;
    // console.log(currentscale);
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
}


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
  // console.log('2) The last action # is ' + (actioncnt-1));
  // console.log('3) The latest linearindex vs action # array is');
  // console.log(idxaction);
  
  // console.log('4) The final outObj is');
  // console.log(outObj);
}



// For responsive
//https://konvajs.org/docs/sandbox/Responsive_Canvas.html
// function fitStageIntoParentContainer() {
//   var container = document.querySelector('#stage-parent');

//   // now we need to fit stage into parent
//   var containerWidth = container.offsetWidth;
//   // to do this we need to scale the stage
//   var scale = containerWidth / stageWidth;


//   stage.width(stageWidth * scale);
//   stage.height(stageHeight * scale);
//   stage.scale({ x: scale, y: scale });
//   stage.draw();
// }


// function jp2pathtranslate_(jp2path) 
// {
//     var parts = jp2path.split('/')
//     var np = parts.length;
//     return parts[np-2]+'/'+encodeURIComponent(parts[np-1]);
// }

// function jp2pathdescribe(jp2path)
// {
//   var parts = jp2path.split('/');
//   var np = parts.length;
//   //brainno = parts[np-2];
//   basename = parts[np-1];
//   parts = basename.split('_');
//   brainno = parts[1];
//   secno = parts[3].substr(0,4);
//   $("#braindetails").html(brainno+'_'+secno);
// }

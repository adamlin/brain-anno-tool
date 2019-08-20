function mouseclick(){
	let e = window.event;
	let innerHeight = window.innerHeight;
	let adjustTool = $("#gutter-vertical-control");
	adjustTool.mousedown(function(e){
		function onMouseMove(e) {
			let moving = e.clientY/innerHeight*100 + '%';
			$('#panel-top').height(moving);
		}
		document.addEventListener('mousemove', onMouseMove);
		adjustTool.onmouseup = function() {
		    document.removeEventListener('mousemove', onMouseMove);
		    adjustTool.onmouseup = null;
	  	};
	  	adjustTool.ondragstart = function() {
		  return false;
		};
	})
}

function generateTileTable(){
	var content = '';
	// var imagePath = '';

	var width= 51968;
	var height= 43008;
	//FIXME: get these from http://braincircuits.org/cgi-bin/iipsrv.fcgi?IIIF=/PITT001/Marmo_7NA_7_layers_1um_spacing.jp2/info.json

	var tilesize = 4096;

	var ntiles1 = Math.round(width/tilesize);
	var ntiles2 = Math.round(height/tilesize);

	wpc = tilesize / width;
	hpc = tilesize / height;

	// imagePath = 'http://braincircuits.org/cgi-bin/iipsrv.fcgi?FIF=/PITT001/Marmo_7NA_7_layers_1um_spacing.jp2&GAM=1&MINMAX=1:0,512&MINMAX=2:0,512&MINMAX=3:0,512&JTL=3,' + i;
	iipbase = "http://braincircuits.org/cgi-bin/iipsrv.fcgi?FIF=";
	jp2path = "/PITT001/Marmo_7NA_7_layers_1um_spacing.jp2";

	for(var row = 0; row < ntiles1 ; row ++) {
		for(var col = 0; col < ntiles2; col++) {

			xpc = col * tilesize/width;
			ypc = row * tilesize/height;

			rgnstring = xpc + "," + ypc + "," + wpc + "," + hpc;

			imagePath = iipbase + jp2path + "&WID="+ tilesize/100 + "&RGN=" + rgnstring +
			 "&MINMAX=1:0,512&MINMAX=2:0,512&MINMAX=3:0,512&GAM=1&CVT=jpeg";

		var i = row * ntiles2 + col;
		content += 
		         '<tr id="image-'+ i + '">'+
		            '<td class="padding"></td>'+
		            '<td class="preview clickable">'+
		               '<div class="preview-pic" lazy="loaded" style="background-image: url(' + imagePath + ');"></div>'+
		            '</td>'+
		            '<td class="w100">'+
		               '<div class="title">'+
		                  'section on tile ' + i +
		               '</div>'+
		               '<div><span class="img-info">'+
		               		'<img class="icon-layers-1"></img> '+
		               			'<b>(1/8 mm)</b>'+
		               		'</span> '+
		               		'<span class="img-info">'+
		               			'<img class="icon-calendar-1"></img> '+
		               			'<b>tile: ' + '4096x4096' + '</b>'+
		               		'</span>'+
		               	'</div>'+
		            '</td>'+
		            '<td class="icn">'+
		               '<div class="show-on-hover el-dropdown">'+
		               		'<span class="el-dropdown-link">'+
		               			'<img class="zmdi zmdi-download download-icon-1"></img>'+
		               		'</span> '+
		               	'</div>'+
		            '</td>'+
		            '<td class="icn">'+
		               '<button type="button" class="el-button show-on-hover icon-btn black el-button--text" title="Delete image" disabled="disabled">'+
		                  '<span><img class="icon-trash delete-1"></img></span>'+
		               '</button>'+
		            '</td>'+
		            '<td class="padding"></td>'+
		         '</tr>';
		 imagePath = '';
		}
	}
	$('#listOfTiles').html(content);
	$('#image-3').addClass('active');
}

function selectedTile(tile){

	var width= 51968;
	var height= 43008;
	//FIXME: get these from http://braincircuits.org/cgi-bin/iipsrv.fcgi?IIIF=/PITT001/Marmo_7NA_7_layers_1um_spacing.jp2/info.json

	var tilesize = 4096;

	var ntiles1 = Math.round(width/tilesize);
	var ntiles2 = Math.round(height/tilesize);

	wpc = tilesize / width;
	hpc = tilesize / height;

	col = tile % ntiles1;
	row = (tile - col) / ntiles2;

	xpc = col * tilesize/width;
	ypc = row * tilesize/height;

	rgnstring = xpc + "," + ypc + "," + wpc + "," + hpc;

	iipbase = "http://braincircuits.org/cgi-bin/iipsrv.fcgi?FIF=";
	jp2path = "/PITT001/Marmo_7NA_7_layers_1um_spacing.jp2";

	imagePath = iipbase + jp2path + "&WID="+ tilesize + "&RGN=" + rgnstring +
	"&MINMAX=1:0,512&MINMAX=2:0,512&MINMAX=3:0,512&GAM=1&CVT=jpeg";

	bgImage.src = imagePath;
	// bgImage.src = 'http://braincircuits.org/cgi-bin/iipsrv.fcgi?FIF=/PITT001/Marmo_7NA_7_layers_1um_spacing.jp2&GAM=1&MINMAX=1:0,512&MINMAX=2:0,512&MINMAX=3:0,512&JTL=3,' + tile;

	// $('#regdetails').html(''+xpix+','+ypix+'; '+wid+'x'+hei);
	bgImage.onload = function() {
	    outimg = new Konva.Image({
	        x: 0,
	        y: 0,
	        width: tilesize,
	        height: tilesize,
	        image: bgImage,
	        draggable: false
		});
		layer.removeChildren();
	    layer.add(outimg);
	    layer.draw();
	    // layer_vector.draw();
	    console.info('tile ' + tile);
	};
}

function selectedToolBtn(){
	$('#controlTool .tool-button').each(function(){
	    $(this).click(function(){
	        $(this).siblings().removeClass('active'); // if you want to remove class from all sibling buttons
	        $(this).toggleClass('active');
	    });
	});
}
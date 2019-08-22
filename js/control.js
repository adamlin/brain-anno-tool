function mouseclick(){
	let e = window.event;
	let innerHeight = window.innerHeight;
	let adjustTool = $("#gutter-vertical-control-top");
	let adjustToolbt = $("#gutter-vertical-control-bottom");

	function onMouseMove(e) {
		//let panelbtmheight = $('#panel-bottom').height();
		let moving = (e.clientY/innerHeight)*100 + '%';
		$('#panel-top').height(moving);
	}

	function onMouseMoveBtm(e) {
		//let panelbtmheight = $('#panel-bottom').height();
		let topheight = $('#panel-top').height();
		let middlemoving = ((e.clientY - topheight)/innerHeight)*100 + '%';

		$('#panel-middle').height(middlemoving);
	}

	adjustTool.mousedown(function(e){
		document.addEventListener('mousemove', onMouseMove);
	  	adjustTool.ondragstart = function() {
		  return false;
		};
	})

	adjustTool.mouseup(function(e){
	    document.removeEventListener('mousemove', onMouseMove);
	    adjustTool.onmouseup = null;
  	});

	adjustToolbt.mousedown(function(e){
		document.addEventListener('mousemove', onMouseMoveBtm);
	  	adjustToolbt.ondragstart = function() {
		  return false;
		};
	})

	adjustToolbt.mouseup(function(e){
	    document.removeEventListener('mousemove', onMouseMoveBtm);
	    adjustToolbt.onmouseup = null;
  	});
}

function generateTileTable(size){
	var content = '';
	// var imagePath = '';

	var width = size[0];
	var height = size[1];
	//FIXME: get these from http://braincircuits.org/cgi-bin/iipsrv.fcgi?IIIF=/PITT001/Marmo_7NA_7_layers_1um_spacing.jp2/info.json
	
	// $.getJSON('http://braincircuits.org/cgi-bin/iipsrv.fcgi?IIIF=/PITT001/Marmo_7NA_7_layers_1um_spacing.jp2/info.json', function(data) {
 //        width = `${data.width}`
 //        height = `${data.height}`
 //    });

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

function selectedTile(tile, section_image_size){

	var width = section_image_size[0];
	var height = section_image_size[1];
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
	    // console.info('tile ' + tile);
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

function addnewannotation(category,color){
	var content2 = '';
	content2 += 
			'<tr>'+
			   '<td class="padding"></td>'+
			   '<td class="icn">'+
			   '</td>'+
			   '<td title="Priority" class="priority">'+
			      '<div ><span >#</span>1'+
			      '</div>'+
			   '</td>'+
			   '<td class="cnt icn clickable">'+
			      '<div class="circle" style="background-color: '+color+';"></div>'+
			   '</td>'+
			   '<td class="class-name clickable"><span title="test">'+
			      category+
			      '</span>'+
			   '</td>'+
			   '<td class="area"><span>'+
			      '2%'+
			      '</span>'+
			   '</td>'+
			   '<td class="icn">'+
			      '<span >'+
			         '<button type="button" class="el-button show-on-hover icon-btn black el-button--text">'+
			            '<span><i title="Bind" class="icon-link"></i></span>'+
			         '</button>'+
			      '</span>'+
			   '</td>'+
			   '<td class="icn">'+
			      '<button type="button" class="el-button show-on-hover icon-btn black el-button--text">'+
			         '<span><i title="Delete object 16292- 16292" class="icon-trash"></i></span>'+
			      '</button>'+
			   '</td>'+
			   '<td class="icn show-hide"><a title="Hide"><i class="icon-eye"></i></a> <i class="icon-edit show-on-active"></i></td>'+
			   '<td class="padding"></td>'+
			'</tr>';
	$('#listOfAnnotation').html(content2);
}

function selectedpixel(){
	$("#brushsize_pixel a").click(function(e){
	    e.preventDefault(); // cancel the link behaviour
	    var selText = $(this).text();
	    $('#selected-class').text(selText);
	});

	//$("#classTree").DropDownTree(options);
}

function selectedclasses(){
	$("#annotated_class a").click(function(e){
	    e.preventDefault(); // cancel the link behaviour
	    var selText = $(this).text();
	    console.info(selText);
	    $('#dropdownClasses').text('class: ' + selText);
	});

	//$("#classTree").DropDownTree(options);
}
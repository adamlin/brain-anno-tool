var imagecurrentPath = '';
var section_image_size;
var brain_name ='';
var countTiles = 0;
var section_number_init = 30;

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
	// $('#image-3').addClass('active');
	if(brain_id == undefined){
		brain_url = 'http://braincircuits.org/cgi-bin/iipsrv.fcgi?zoomify=' + '/PITT001/Marmo_7NA_7_layers_1um_spacing.jp2';
		generateOL(width, height, brain_url);
	}
}

function selectedTile(tile, section_image_size, imageurl){
	$('#image_loading_selected').css("display", "block");
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

	if(imageurl == ''){
		jp2path = "/PITT001/Marmo_7NA_7_layers_1um_spacing.jp2";
		
	}else{
		jp2path = imageurl;
	}

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
	    console.info('tile ' + tile + '| ' + imageurl);
	    $('#image_loading_selected').css("display", "none");
	};
}

function selectedToolBtn(){
	$('#controlTool .tool-button').each(function(){
	    $(this).click(function(){
	        $(this).siblings().removeClass('active'); // if you want to remove class from all sibling buttons
	        $(this).toggleClass('active');

	        if($('#pixel_active').hasClass('active')){
	        	activatedBtn = 'raster_pixel';
	    		}else if ($('#pointer_active').hasClass('active')){
	    			activatedBtn = 'pointer';
	    		}else if ($('#erase_active').hasClass('active')){
	    			activatedBtn = 'erase';
	    		}

	    });
	});
}

function addnewannotation(category,color,numOfPix){
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
			      numOfPix+ ' pixels'+
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
	    $(this).siblings().removeClass('active');
	    $(this).toggleClass('active');
	    var brushsize = $(this).attr('data-value'); ///// Brush size need be either of [1, 9, 25, 49,...] Mitsu
	    calBrushMatrix(brushsize);  //Mitsu
	});
	//$("#classTree").DropDownTree(options);
}

function selectedclasses(){
	$("#annotated_class a").click(function(e){
	    e.preventDefault(); // cancel the link behaviour
	    var selText = $(this).text();
	    setCtgAndColor(selText); // by Mitsu for obj output.
	    // console.info(selText);
	    $('#dropdownClasses').text('class: ' + selText);
	});
	//$("#classTree").DropDownTree(options);
}

function generatesectiontils(brain_id, current_section){
	var content = '';
	var count = 0;
	var fullurl;

	let width;
	let height;
	let nissl, fluor, ctb;
	let listOfsections;
	let jp2path;
	let typeused;

	iipbase = 'http://braincircuits.org/cgi-bin/iipsrv.fcgi?FIF=';
	iipinfo = 'http://braincircuits.org/cgi-bin/iipsrv.fcgi?IIIF=';
	iipzoomify = 'http://braincircuits.org/cgi-bin/iipsrv.fcgi?zoomify=';
	apibase = 'http://mitradevel.cshl.org/webtools/seriesbrowser';
   
	$.getJSON(apibase+'/getseriesid/'+brain_id, function(data) {
        nissl = `${data.N}`
        fluor = `${data.F}`
        if(type == 'F'){
        	typeused = fluor;
        }else if (type == 'N'){
        	typeused = nissl;
        }

        $.getJSON(apibase+'/getsectionids/'+typeused, function(data2) {
	    	listOfsections = data2[current_section];

	    	
		    $.getJSON(apibase+'/getsectionjp2path/'+listOfsections, function(data3) {
		        jp2path = `${data3.jp2Path}`
		        jp2path = jp2path.replace('&', '%26');
		        jp2path = jp2path.replace('/brainimg', '');

		        imagecurrentPath = jp2path; //for gobel uses.

				$.getJSON(iipinfo + jp2path + '/info.json', function(data4) {
				    width = `${data4.width}`
				    height = `${data4.height}`
				    let dect = [width, height];
				    section_image_size = dect;


					var tilesize = 4096;

					var ntiles1 = Math.round(width/tilesize);
					var ntiles2 = Math.round(height/tilesize);

					wpc = tilesize / width;
					hpc = tilesize / height;

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
							 count = count + 1;
						}
					}
					$('#listOfTiles').html(content);
					$('#image_loading_selected').css("display", "none");
					countTiles = count;
					var nagImagesize = $(window).width() * 0.20 - 3;
					var imageaddress = iipbase + imagecurrentPath + "&WID=" + nagImagesize + "&QLT=130&CNT=1&CVT=jpeg";
          			$('#navImageSection').attr("src",imageaddress);	
          			updateallinfo();

          			generateOL(width, height, iipzoomify +imagecurrentPath);
				});
		    });
		});
		
    });

}

function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
}

function updateallinfo(){
	$('#total_tiles').html('Total Tiles: ' + countTiles);
	$('#full_image_file_name').html(imagecurrentPath);

	let brain_name = getUrlVars()["brain_id"];
	if(typeof brain_name == 'number'){
		brain_name = 'PMD' + brain_name;
	}

	let section_number = imagecurrentPath.replace('.jp2','');
	section_number = section_number.split('_');
	section_number = section_number.slice(-1).pop();

	section_number_init = section_number;

	$('#header_info_brainname_section').html('Brain: ' + brain_name + ' | Section: ' + section_number ); 
}

function generateOL(width, height, brain_url){
	$('#map').html('');
    var imgWidth = width;
    var imgHeight = height;

    var imgCenter = [imgWidth / 2, -imgHeight / 2];

    var proj = new ol.proj.Projection({
      code: 'ZOOMIFY',
      units: 'pixels',
      extent: [0, 0, imgWidth, imgHeight]
    });

    var source = new ol.source.Zoomify({
      url: brain_url + '/' ,
      size: [imgWidth, imgHeight],
      crossOrigin: 'anonymous'
    });

    var map = new ol.Map({
      layers: [
        new ol.layer.Tile({
          source: source
        })
      ],
      target: 'map',
      view: new ol.View({
        projection: proj,
        center: imgCenter,
        zoom: 1,
        minZoom: 1,
		maxZoom: 9,
		extent: [0, -imgHeight, imgWidth, 0]
      })
    });	
}

function beforeAndafterSection(current_section){

	$("#btn_section_right").click(function(e){
		$('#image_loading_selected').css("display", "block");
		current_section = current_section + 1;
		generatesectiontils(brain_id, current_section);
	});

	$("#btn_section_left").click(function(e){
		$('#image_loading_selected').css("display", "block");
		current_section = current_section - 1;
		generatesectiontils(brain_id, current_section);
	});
}
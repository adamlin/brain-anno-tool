// var imagecurrentPath = '';
// var section_image_size;
// var brain_name ='';
var countTiles = 0;
// var section_number_init = 55;
// var current_tile;
// var current_image_url;

var current_gamma 		= [1.3];
var current_red_range 	= [1,0,4095];
var current_blue_range 	= [2,0,1023];
var current_green_range = [3,0,1023];
var current_opacity = [1.0];
// var current_width;
// var current_height;

function mouseclick(){
	let e = window.event;
	let innerHeight = window.innerHeight;
	let adjustTool = $("#gutter-vertical-control-top");
	let adjustToolbt = $("#gutter-vertical-control-bt");

	function onMouseMove(e) {
		//let panelbtmheight = $('#panel-bottom').height();
		let moving = (e.clientY/innerHeight)*100 + '%';
		$('#panel-top').height(moving);
	}

	adjustTool.mousedown(function(e){
		document.addEventListener('mousemove', onMouseMove);
	 //  	adjustTool.ondragstart = function() {
		//   return false;
		// };
	})

	
	adjustTool.mouseup(function(e){
	    document.removeEventListener('mousemove', onMouseMove);
	    // adjustTool.onmouseup = null;
  	});

	function onMouseMoveBtm(e) {
		//let panelbtmheight = $('#panel-bottom').height();
		let topheight = $('#panel-top').height();
		let middlemoving = ((e.clientY - topheight - 4)/innerHeight)*100 + '%';

		$('#panel-middle').height(middlemoving);
	}


	adjustToolbt.mousedown(function(e){
		document.addEventListener('mousemove', onMouseMoveBtm);
	 //  	adjustToolbt.ondragstart = function() {
		//   return false;
		// };
		console.info('moust down');
	})

	adjustToolbt.mouseup(function(e){
	    document.removeEventListener('mousemove', onMouseMoveBtm);
	    //adjustToolbt.onmouseup = null;
	    console.info('moust up');
  	});
}

// function generateTileTable(size){
// 	var content = '';
// 	// var imagePath = '';

// 	var width = size[0];
// 	var height = size[1];
// 	//FIXME: get these from http://braincircuits.org/cgi-bin/iipsrv.fcgi?IIIF=/PITT001/Marmo_7NA_7_layers_1um_spacing.jp2/info.json
	
// 	// $.getJSON('http://braincircuits.org/cgi-bin/iipsrv.fcgi?IIIF=/PITT001/Marmo_7NA_7_layers_1um_spacing.jp2/info.json', function(data) {
//  //        width = `${data.width}`
//  //        height = `${data.height}`
//  //    });

// 	var tilesize = 4096;

// 	var ntiles1 = Math.round(width/tilesize);
// 	var ntiles2 = Math.round(height/tilesize);

// 	wpc = tilesize / width;
// 	hpc = tilesize / height;

// 	// imagePath = 'http://braincircuits.org/cgi-bin/iipsrv.fcgi?FIF=/PITT001/Marmo_7NA_7_layers_1um_spacing.jp2&GAM=1&MINMAX=1:0,512&MINMAX=2:0,512&MINMAX=3:0,512&JTL=3,' + i;
// 	iipbase = "http://braincircuits.org/cgi-bin/iipsrv.fcgi?FIF=";
// 	jp2path = "/PITT001/Marmo_7NA_7_layers_1um_spacing.jp2";

// 	for(var row = 0; row < ntiles2 ; row ++) {
// 		for(var col = 0; col < ntiles1; col++) {

// 			xpc = col * tilesize/width;
// 			ypc = row * tilesize/height;

// 			rgnstring = xpc + "," + ypc + "," + wpc + "," + hpc;

// 			imagePath = iipbase + jp2path + "&WID="+ tilesize/100 + "&RGN=" + rgnstring +
// 			 "&MINMAX=1:0,255&MINMAX=2:0,255&MINMAX=3:0,255&GAM=0.7&CVT=jpeg";

// 		var i = row * ntiles1 + col;
// 		content += 
// 		         '<tr id="image-'+ i + '">'+
// 		            '<td class="padding"></td>'+
// 		            '<td class="preview clickable">'+
// 		               '<div class="preview-pic" lazy="loaded" style="background-image: url(' + imagePath + ');"></div>'+
// 		            '</td>'+
// 		            '<td class="w100">'+
// 		               '<div class="title">'+
// 		                  'section on tile ' + i +
// 		               '</div>'+
// 		               '<div><span class="img-info">'+
// 		               		'<img class="icon-layers-1"></img> '+
// 		               			'<b>(1/8 mm)</b>'+
// 		               		'</span> '+
// 		               		'<span class="img-info">'+
// 		               			'<img class="icon-calendar-1"></img> '+
// 		               			'<b>tile: ' + '4096x4096' + '</b>'+
// 		               		'</span>'+
// 		               	'</div>'+
// 		            '</td>'+
// 		            '<td class="icn">'+
// 		               '<div class="show-on-hover el-dropdown">'+
// 		               		'<span class="el-dropdown-link">'+
// 		               			'<img class="zmdi zmdi-download download-icon-1"></img>'+
// 		               		'</span> '+
// 		               	'</div>'+
// 		            '</td>'+
// 		            '<td class="icn">'+
// 		               '<button type="button" class="el-button show-on-hover icon-btn black el-button--text" title="Delete image" disabled="disabled">'+
// 		                  '<span><img class="icon-trash delete-1"></img></span>'+
// 		               '</button>'+
// 		            '</td>'+
// 		            '<td class="padding"></td>'+
// 		         '</tr>';
// 		 imagePath = '';
// 		}
// 	}
// 	$('#listOfTiles').html(content);
// 	// $('#image-3').addClass('active');
// 	if(brain_id == undefined){
// 		brain_url = 'http://braincircuits.org/cgi-bin/iipsrv.fcgi?zoomify=' + '/PITT001/Marmo_7NA_7_layers_1um_spacing.jp2';
// 		generateOL(width, height, brain_url, 1);
// 	}
// }

function selectedTile(tile, section_image_size, imageurl, current_gamma){
	$('#image_loading_selected').css("display", "block");

	var width = section_image_size[0];
	var height = section_image_size[1];
	//FIXME: get these from http://braincircuits.org/cgi-bin/iipsrv.fcgi?IIIF=/PITT001/Marmo_7NA_7_layers_1um_spacing.jp2/info.json

	app.sel_tile = tile;

	// var tilesize = 4096;

	var ntiles1 = Math.round(width/app.tilewid) ;//tilesize);
	var ntiles2 = Math.round(height/app.tilehei); //tilesize);

	wpc = app.tilewid / width;
	hpc = app.tilehei / height;

	col = tile % ntiles1;
	row = (tile - col) / ntiles1;

	xpc = col * app.tilewid/width;
	ypc = row * app.tilehei/height;

	rgnstring = xpc + "," + ypc + "," + wpc + "," + hpc;
	iipbase = "http://braincircuits.org/cgi-bin/iipsrv.fcgi?FIF=";

	jp2path = undefined;
	mskPath = undefined;

	if(imageurl == ''){
		jp2path = "/PITT001/Marmo_7NA_7_layers_1um_spacing.jp2";
		
	}else{
		jp2path = imageurl;
		parts = imageurl.split('/')
		mskPath = "/imagedata/"+jp2path;
	}

	imagePath = iipbase + jp2path + "&GAM=" + current_gamma[0] + "&WID=" 
			  + app.tilewid + "&RGN=" + rgnstring + "&MINMAX="
			  + current_red_range[0] + ":" + current_red_range[1] + "," + current_red_range[2] + "&MINMAX="
			  + current_green_range[0] + ":" + current_green_range[1] + "," + current_green_range[2] + "&MINMAX="
			  + current_blue_range[0] + ":" + current_blue_range[1] + "," + current_blue_range[2] 
			  + "&CVT=jpeg" ;

	maskPath = iipbase + mskPath + "&GAM=1" + "&WID=" 
				+ app.tilewid + "&RGN=" + rgnstring 
				// + "&MINMAX="
				// + current_red_range[0] + ":" + current_red_range[1] + "," + current_red_range[2] + "&MINMAX="
				// + current_green_range[0] + ":" + current_green_range[1] + "," + current_green_range[2] + "&MINMAX="
				// + current_blue_range[0] + ":" + current_blue_range[1] + "," + current_blue_range[2] 
				+ "&CVT=jpeg" ;
	
	bgImage.src = imagePath;
	// mskImage.src = maskPath;

	// bgImage.src = 'http://braincircuits.org/cgi-bin/iipsrv.fcgi?FIF=/PITT001/Marmo_7NA_7_layers_1um_spacing.jp2&GAM=1&MINMAX=1:0,512&MINMAX=2:0,512&MINMAX=3:0,512&JTL=3,' + tile;
	// $('#regdetails').html(''+xpix+','+ypix+'; '+wid+'x'+hei);
	bgImage.onload = function() {

	    outimg = new Konva.Image({
	        x: 0,
	        y: 0,
	        width: app.tilewid,
	        height: app.tilehei,
	        image: bgImage,
	        draggable: false
		});
		outimg.name('tileimg');
		// outimg2 = new Konva.Image({
		// 	x:0,
		// 	y:0,
		// 	width: tilesize,
		// 	height: tilesize,
		// 	image: mskImage,
		// 	draggable: false,
		// 	opacity: 0.1 //current_opacity
		// });
		// outimg2.name('msk');
		layer.removeChildren();
		layer.add(outimg);
		// layer.add(outimg2);
			//brain_id and current_section defined in pixel.html
		layer.draw();
		
		// addFirstPass(app.section_id,app.current_section,tile, "Soma", null);

	    
	    // layer_vector.draw();
	    console.info('tile ' + tile + '| ' + imageurl);
	    // current_tile = tile;
	    // current_image_url = imageurl;

	    $('#image_loading_selected').css("display", "none");
	};
	$('#tile-number').html('tile ' + tile);
}

function addFirstPass(sectionid, sec, tile, category) {
	apibase = 'http://localhost:8000/mbaservices/annotationservice';
	// apibase = 'http://mitradevel.cshl.org/webtools/seriesbrowser';
	msg = {"series_id":app.series_id, "section_id": sectionid, "section": sec, 
	"tile": tile,"tile_wid":app.tilewid,"tile_hei":app.tilehei,
	"category":category};

	$.getJSON(apibase+'/load_firstpass/',msg,function(data) {
		pixels = data.detect.feature.geometry.coordinates[0];
		pixels.forEach(function(pt){
			paintRect_firstpass(pt[1],pt[0]);
		});
		layer.draw();
		// console.log('done');
		addnewannotation("2-"+category,2,category,pixels.length);
	});
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

function updateannotationtracking(category, flag, numOfPix){
	if ($('#listOfAnnotation').find('tr#row-'+flag+'-'+category).length>0)
		$('#row-'+flag+'-'+category).find('td.area').html('<span>'+ numOfPix+' pixels</span>');
	else
		addnewannotation(flag+'-'+category, flag, category, numOfPix);
	// console.log('here');
}

function addnewannotation(category,flag, catname, numOfPix){
	color = flag==1?'green':'red';
	color = flag==2?'black':color;

	var content2 = $('#listOfAnnotation').html();
	content2 += 
			'<tr id="row-'+category+'">'+
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
			      catname+
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

function clickrangecontrol(){
	var range_on_off = document.getElementById("showing_range");

    $('#dynamitc_select #st_on_dynamtic').click(function(){
    	if(range_on_off.style.display == "none"){
    		$('.toggle_range').css('display', 'block');
    	}else{
    		$('.toggle_range').css('display', 'none');
    	}
	});
	
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
	    var selText = $(this).attr('key');
	    setCtgAndColor(selText); // by Mitsu for obj output.
	    // console.info(selText);
	    $('#dropdownClasses').text('class: ' + selText);
	});
	//$("#classTree").DropDownTree(options);
}
function generatesectiontils(seriesid, current_section) {
	app.series_id = seriesid;
	app.current_section = current_section;
	var content = '';
	var count = 0;
	var fullurl;

	let width;
	let height;
	let nissl, fluor, ctb;
	let listOfsections;
	let jp2path;
	// let typeused;

	iipbase = 'http://braincircuits.org/cgi-bin/iipsrv.fcgi?FIF=';
	iipinfo = 'http://braincircuits.org/cgi-bin/iipsrv.fcgi?IIIF=';
	iipzoomify = 'http://braincircuits.org/cgi-bin/iipsrv.fcgi?zoomify=';
	apibase = 'http://mitradevel.cshl.org/webtools/seriesbrowser';

	$.getJSON(apibase+'/getthumbnails/'+seriesid, function(data2) {
		listOfSections = data2['F'];
		currentsecid = undefined;
		listOfSections.some(function(elt){
			if(elt[0]==app.current_section) {
				currentsecid = elt[2];
				return true;
			}
		});

		// listOfsections = data2[current_section];
		app.section_id = currentsecid;
		

		$.getJSON(apibase+'/getsectionjp2path/'+currentsecid, function(data3) {
			jp2path = `${data3.jp2Path}`
			jp2path = jp2path.replace('&', '%26');
			jp2path = jp2path.replace('/brainimg', '');

			// imagecurrentPath = jp2path; //for gobel uses.
			app.jp2Path = jp2path;

			$.getJSON(iipinfo + jp2path + '/info.json', function(data4) {
				width = parseInt(`${data4.width}`);
				height = parseInt(`${data4.height}`);
				let dect = [width, height];
				app.section_image_size = dect;

				app.width = width;
				app.height = height;

				app.tilewid = 4096; //2174 = 1mm
				app.tilehei = 4096;
				if(app.width < 24000) {
					app.tilewid = 2048;
					app.tilehei = 2048;
				}
				// var tilesize = 4096;

				var ntiles1 = Math.round(width/app.tilewid);
				var ntiles2 = Math.round(height/app.tilehei);

				wpc = app.tilewid / width;
				hpc = app.tilehei / height;

				shp = app.tilewid + 'x' + app.tilehei;
				sidelen = Math.round(app.tilewid * 0.46/1000 *100)/100;

				for(var row = 0; row < ntiles2 ; row ++) {
					for(var col = 0; col < ntiles1; col++) {

						xpc = col * app.tilewid/width;
						ypc = row * app.tilehei/height;

						rgnstring = xpc + "," + ypc + "," + wpc + "," + hpc;
						/*
						imagePath = iipbase + jp2path + "&WID="+ tilesize/100 + "&RGN=" + rgnstring +
						 "&MINMAX=1:0,512&MINMAX=2:0,512&MINMAX=3:0,512&GAM=1&CVT=jpeg";

						*/

						imagePath = iipbase + jp2path + "&GAM=1"  + "&WID="+ app.tilewid/100 + "&RGN=" + rgnstring 
						+"&MINMAX=1:0,2047" //+ current_red_range[0] + ":" + current_red_range[1] + "," + current_red_range[2] 
						+ "&MINMAX=2:0,2047" // + current_green_range[0] + ":" + current_green_range[1] + "," + current_green_range[2] 
						+ "&MINMAX=3:0,2047" //+ current_blue_range[0] + ":" + current_blue_range[1] + "," + current_blue_range[2] 
						 + "&CVT=jpeg";
		   
						var i = row * ntiles1 + col;
						content += 
								 '<tr id="image-'+ i + '">'+
									'<td class="padding"></td>'+
									'<td class="preview clickable">'+
									   '<div class="preview-pic" lazy="loaded" style="background-image: url(' + imagePath + ');"></div>'+
									'</td>'+
									'<td class="w100">'+
									   '<div class="title">'+
										  'section tile ' + i +
									   '</div>'+
									   '<div><span class="img-info">'+
											   '<img class="icon-layers-1"></img> '+
												   '<b>'+ sidelen +' mm</b>'+
											   '</span> '+
											   '<span class="img-info">'+
												   '<img class="icon-calendar-1"></img> '+
												   '<b>tile: ' + shp + '</b>'+
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
				var imageaddress = iipbase + app.jp2Path + "&WID=" + nagImagesize + "&QLT=130&CNT=1&CVT=jpeg";
				  $('#navImageSection').attr("src",imageaddress);	
				  updateallinfo();
				//   current_width = width;
				//   current_height = height;
				  generateOL(app.width, app.height, iipzoomify +app.jp2Path, current_gamma[0]);
				  cell_annotation_marking_init();
			});
		});
	});
}
function generatesectiontils_brainid(brain_id, current_section){
	
	apibase = 'http://mitradevel.cshl.org/webtools/seriesbrowser';
   
	$.getJSON(apibase+'/getseriesid/'+brain_id, function(data) {
        nissl = `${data.N}`
        fluor = `${data.F}`
        if(type == 'F'){
        	typeused = fluor;
        }else if (type == 'N'){
        	typeused = nissl;
        }
		generatesectiontils(typeused, current_section);
		
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
	$('#full_image_file_name').html(app.jp2Path);

	let brain_name = getUrlVars()["brain_id"];
	if(typeof brain_name == 'number'){
		brain_name = 'PMD' + brain_name;
	}

	let section_number = app.jp2Path.replace('.jp2','');
	section_number = section_number.split('_');
	section_number = section_number.slice(-1).pop();

	// section_number_init = section_number;

	$('#header_info_brainname_section').html('Brain: ' + brain_name + ' | Section: ' + section_number ); 
}

function generateOL(width, height, brain_url, ol_gamma){
	uiargs = {
        gamma: ol_gamma,
        range_red: [current_red_range[1], current_red_range[2]],
        range_green: [current_green_range[1], current_green_range[2]],
        range_blue: [current_blue_range[1], current_blue_range[2]]
    };

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
      url: applyargs(brain_url,uiargs), 
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

function iipcmd(uiprop, arg) 
{      
      colornames=['','range_red','range_green','range_blue'];

      if(uiprop.substr(0,5)=='range')
            return 'MINMAX='+colornames.indexOf(uiprop)+':'+arg[0]+","+arg[1];
      if(prop=="gamma")
            return 'GAM='+arg;      
}

function applyargs(current_url, args) 
{
      //return mbaurl;
      parts = current_url.split('?');
      parts[1] = parts[1].replace('zoomify', 'FIF');
      outstr = parts[0]+'?'+parts[1];
      for(prop in args) {
        outstr = outstr+'&'+iipcmd(prop,args[prop]);
      }
      return outstr+"&JTL={z},{tileIndex}";
}

function beforeAndafterSection(current_section){

	$("#btn_section_right").click(function(e){
		$('#image_loading_selected').css("display", "block");
		current_section = current_section + 1;
		generatesectiontils_brainid(brain_id, current_section);
	});

	$("#btn_section_left").click(function(e){
		$('#image_loading_selected').css("display", "block");
		current_section = current_section - 1;
		generatesectiontils_brainid(brain_id, current_section);
	});
}

function initRangeSlider(){
	$(".red-range-slider").ionRangeSlider({
        type: "double",
        min: 0,
        max: 4096,
        from: current_red_range[1],
        to: current_red_range[2],
        grid: true,
        onFinish: function (data) {
        	if($('#tile-number').text() == '000'){
        		return;
        	}
            red_data_from = data.from;
			red_data_to = data.to;
            current_red_range = [1,red_data_from,red_data_to];
            selectedTile(app.sel_tile, app.section_image_size, app.jp2Path, current_gamma);
        },
    });
	$(".green-range-slider").ionRangeSlider({
        type: "double",
        min: 0,
        max: 4096,
        from: current_green_range[1],
        to: current_green_range[2],
        grid: true,
		onFinish: function (data) {
			if($('#tile-number').text() == '000'){
        		return;
        	}
            green_data_from = data.from;
			green_data_to = data.to;
            current_green_range = [2,green_data_from,green_data_to];
            selectedTile(app.sel_tile, app.section_image_size, app.jp2Path, current_gamma);
        },
    });
 	$(".blue-range-slider").ionRangeSlider({
        type: "double",
        min: 0,
        max: 4096,
        from: current_blue_range[1],
        to: current_blue_range[2],
        grid: true,
        onFinish: function (data) {
        	if($('#tile-number').text() == '000'){
        		return;
        	}
            blue_data_from = data.from;
			blue_data_to = data.to;
            current_blue_range = [3,blue_data_from,blue_data_to];
            selectedTile(app.sel_tile, app.section_image_size, app.jp2Path, current_gamma);
        },
    });
	$(".gamma-range-slider").ionRangeSlider({
        min: 0.2,
        max: 2,
        from: current_gamma[0],
        grid: true,
        step: 0.1,
        onFinish: function (data) {
        	if($('#tile-number').text() == '000'){
        		return;
        	}
            gamma_data = data.from;
            console.info(gamma_data);
            current_gamma = [gamma_data];
            selectedTile(app.sel_tile, app.section_image_size, app.jp2Path, current_gamma);
        },
	});  
	$(".opacity-range-slider").ionRangeSlider({
		min: 0,
		max: 1,
		from: current_opacity[0],
		step: 0.1,
		onFinish: function(data){
			if($('#tile-number').text() == '000'){
        		return;
        	}
			opac_data = data.from;
			tileimg = layer.getChildren(function(node){
				return node.name()=='tileimg';
			});
			tileimg.opacity(opac_data);
			current_opacity = [opac_data];
			layer.draw();
		}
	});    
}

function applyRangesControl(){
	$("#apply_all_tiles_section").click(function(e){
		generatesectiontils_brainid(brain_id, current_section);
		ol_gamma = current_gamma[0];
		generateOL(app.width, app.height, iipbase +app.jp2Path, ol_gamma);
	});
	$("#reset_all_tiles_section").click(function(e){
		current_gamma 		= [1];
		current_red_range 	= [1,0,1023];
		current_blue_range 	= [2,0,1023];
		current_green_range = [3,0,1023];
		generatesectiontils_brainid(brain_id, current_section);
		selectedTile(app.sel_tile, app.section_image_size, app.jp2Path, current_gamma);
	});

}

function cell_annotation_marking_init(){

	var meta_link = '<a href="http://www.braincircuits.org/mamo/ol_cshl_anno.html?brain_id=' + brain_id +'&label='+ type
			  + '&pid=' + $('#full_image_file_name').text() + '" '
	          + 'data-featherlight="iframe" data-featherlight-iframe-frameborder="0" data-featherlight-iframe-allowfullscreen="true" data-featherlight-iframe-style="display:block;border:none;height:95vh;width:85vw;">'
	          + '<button id="cell_annotation_marking" class="cell_annotation-tabs" type="button">M</button>'
	          + '</a>';

	$(".cell_annotation").html(meta_link);

	var configuration = ({
	   beforeClose: function(event){
	     console.info('hello I am here');
	   }
	});
}
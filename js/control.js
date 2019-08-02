function mouseclick(){
	$("#gutter-vertical-control").mouseup(function(){
	    console.info('mouse up');
	}).mousedown(function(){
	    console.info('mouse down');
	})	
}

function generateTileTable(){
	var content = '';
	var imagePath = '';

	for(var i = 0; i <= 33 ; i ++){
		imagePath = 'http://braincircuits.org/cgi-bin/iipsrv.fcgi?FIF=/PITT001/Marmo_7NA_7_layers_1um_spacing.jp2&GAM=1&MINMAX=1:0,512&MINMAX=2:0,512&MINMAX=3:0,512&JTL=3,' + i;
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
		               			'<b>layer 1</b>'+
		               		'</span> '+
		               		'<span class="img-info">'+
		               			'<img class="icon-calendar-1"></img> '+
		               			'<b>tile ' + i + '</b>'+
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
	$('#listOfTiles').html(content);
	$('#image-3').addClass('active');
}

function selectedTile(tile){
	bgImage.src = 'http://braincircuits.org/cgi-bin/iipsrv.fcgi?FIF=/PITT001/Marmo_7NA_7_layers_1um_spacing.jp2&GAM=1&MINMAX=1:0,512&MINMAX=2:0,512&MINMAX=3:0,512&JTL=3,' + tile;

	$('#regdetails').html(''+xpix+','+ypix+'; '+wid+'x'+hei);
	bgImage.onload = function() {
	    outimg = new Konva.Image({
	        x: 0,
	        y: 0,
	        width: wid,
	        height: hei,
	        image: bgImage,
	        draggable: false
	    });
	    layer.add(outimg);
	    layer.draw();
	    // layer_vector.draw();
	    console.info('hello world');
	};
}

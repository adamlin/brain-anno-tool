function create_slider(fid, pid){
    var $red_range = $("#red_range_slider"),
        $red_result = $("#red_result_slider");
    var $blue_range = $("#blue_range_slider"),
        $blue_result = $("#blue_result_slider");            
    var $green_range = $("#green_range_slider"),
        $green_result = $("#green_result_slider");  
	var $gamma_range = $("#gamma_range_slider"),
        $gamma_result = $("#gamma_result_slider"); 
    var $mri_contrast_range = $("#mri_contrast_range_slider"),
        $mri_contrast_result = $("#mri_contrast_result_slider");       
    var $mri_gamma_range = $("#mri_gamma_range_slider"),
        $mri_gamma_result = $("#mri_gamma_result_slider"); 

    var red_track = function () {
        var $this = $(this),
            value = $this.prop("value").split(";");

        $red_result.html(value[0] + "to" + value[1]);
    };

    var blue_track = function () {
        var $this = $(this),
            value = $this.prop("value").split(";");

        $blue_result.html(value[0] + "-" + value[1]);
    };

    var green_track = function () {
        var $this = $(this),
            value = $this.prop("value").split(";");

        $green_result.html(value[0] + "-" + value[1]);
    };
    
    var gamma_track = function () {
        var $this = $(this),
            value = $this.prop("value").split(";");

        $gamma_result.html(value[0]);
    };
    
    var mri_contrast_track = function () {
        var $this = $(this),
            value = $this.prop("value").split(";");

        $mri_contrast_result.html(value[0]);
    };

    var mri_gamma_track = function () {
        var $this = $(this),
            value = $this.prop("value").split(";");

        $mri_gamma_result.html(value[0]);
    };


    var red_data_from = blue_data_from = green_data_from = 0;
    var red_data_to = blue_data_to = green_data_to = 255;
    var init_to_color = 255;
    var gamma_data = 1;
    var mri_gamma_data = 1;
    var mri_contrast_data = 1;
	
    var colorRanges;
    if(window.location.pathname != "/openlayers/ol_cshl_anno.html"){
        if (app.meta != undefined){
            if(app.meta.levels != '8'){
               colorRanges = [0,4096];
            }else{
               colorRanges = [0,255];
            }
        }else{
            colorRanges = [0,4096];
        }
    }else{
        colorRanges = [0,4096];
    }
    
    var ini_range = null;
    try {
        ini_range = localStorage['dynamic_range'].split(',');
    } catch (e) {
        //console.log('parsing init range error', e);
    }

    var ini_mri_range = null;
    try {
        ini_mri_range = localStorage['mri_range'].split(',');
    } catch (e) {
        //console.log('parsing init range error', e);
    }

    $red_range.ionRangeSlider({
        type: "double",
        min: colorRanges[0],
        max: colorRanges[1],
        from: (ini_range == null) ? colorRanges[0] : ini_range[0],
        to: (ini_range == null) ? init_to_color : ini_range[1],
        grid: true,
        onFinish: function (data) {
            red_data_from = data.from;
            red_data_to = data.to;
            if (ini_range == null){
                app.rft_id = hostname +fid+'/'+pid + '&svc.crange='+ 
                             red_data_from + '-'+ red_data_to +','+ blue_data_from + '-'+ blue_data_to + ',' + green_data_from + '-'+ green_data_to +'&svc.gamma=' + gamma_data;
            }else{
                if(slice_type == 'F'){
                    app.rft_id = hostname +fid+'/'+pid + '&svc.crange='+ 
                             red_data_from + '-'+ red_data_to +','+ ini_range[2] + '-'+ ini_range[3] + ',' + ini_range[4] + '-'+ ini_range[5] +'&svc.gamma=' + ini_range[6];
                }else{
                   app.rft_id = hostname+fid+'/'+pid + '&svc.crange='+ 
                             red_data_from + '-'+ red_data_to +','+ blue_data_from + '-'+ blue_data_to + ',' + green_data_from + '-'+ green_data_to +'&svc.gamma=' + ini_range[6];
                }
            }
            console.info(app.rft_id);
            if (ini_range == null){
                localStorage['dynamic_range'] = [red_data_from, red_data_to, blue_data_from, blue_data_to, green_data_from, green_data_to, gamma_data];
            }else{
                localStorage['dynamic_range'] = [red_data_from, red_data_to, ini_range[2], ini_range[3], ini_range[4], ini_range[5], ini_range[6]];
            }
            refresh_layer(app.rft_id);
        },
    });

    $blue_range.ionRangeSlider({
        type: "double",
        min: colorRanges[0],
        max: colorRanges[1],
        from: (ini_range == null) ? colorRanges[0] : ini_range[2],
        to: (ini_range == null) ? init_to_color : ini_range[3],
        grid: true,
        onFinish: function (data) {
            blue_data_from = data.from;
            blue_data_to = data.to;
            if (ini_range == null){
                app.rft_id = hostname+fid+'/'+pid + '&svc.crange='+ 
                             red_data_from + '-'+ red_data_to +','+ blue_data_from + '-'+ blue_data_to + ',' + green_data_from + '-'+ green_data_to +'&svc.gamma=' + gamma_data;
            }else{
                if(slice_type == 'F'){
                    app.rft_id = hostname+fid+'/'+pid + '&svc.crange='+ 
                             ini_range[0] + '-'+ ini_range[1] +','+ blue_data_from + '-'+ blue_data_to + ',' + ini_range[4] + '-'+ ini_range[5] +'&svc.gamma=' + ini_range[6];
                }else{
                    app.rft_id = hostname+fid+'/'+pid + '&svc.crange='+ 
                             red_data_from + '-'+ red_data_to +','+ blue_data_from + '-'+ blue_data_to + ',' + green_data_from + '-'+ green_data_to +'&svc.gamma=' + ini_range[6];
                }
            }
            console.info(app.rft_id);
            if (ini_range == null){
                localStorage['dynamic_range'] = [red_data_from, red_data_to, blue_data_from, blue_data_to, green_data_from, green_data_to, gamma_data];
            }else{
                localStorage['dynamic_range'] = [ini_range[0], ini_range[1], blue_data_from, blue_data_to, ini_range[4], ini_range[5], ini_range[6]];
            }
            refresh_layer(app.rft_id);
        },
    });

    $green_range.ionRangeSlider({
        type: "double",
        min: colorRanges[0],
        max: colorRanges[1],
        from: (ini_range == null) ? colorRanges[0] : ini_range[4],
        to: (ini_range == null) ? init_to_color : ini_range[5],
        grid: true,
        onFinish: function (data) {
            green_data_from = data.from;
            green_data_to = data.to;
            if (ini_range == null){
                app.rft_id = hostname+fid+'/'+pid + '&svc.crange='+ 
                             red_data_from + '-'+ red_data_to +','+ blue_data_from + '-'+ blue_data_to + ',' + green_data_from + '-'+ green_data_to +'&svc.gamma=' + gamma_data;
            }else{
                if(slice_type == 'F'){
                    app.rft_id = hostname+fid+'/'+pid + '&svc.crange='+ 
                             ini_range[0] + '-'+ ini_range[1] +','+ ini_range[2] + '-'+ ini_range[3] + ',' + green_data_from + '-'+ green_data_to +'&svc.gamma=' + ini_range[6];
                }else{
                    app.rft_id = hostname+fid+'/'+pid + '&svc.crange='+ 
                             red_data_from + '-'+ red_data_to +','+ blue_data_from + '-'+ blue_data_to + ',' + green_data_from + '-'+ green_data_to +'&svc.gamma=' + ini_range[6];
                }
            }
            console.info(app.rft_id);
            if (ini_range == null){
                localStorage['dynamic_range'] = [red_data_from, red_data_to, blue_data_from, blue_data_to, green_data_from, green_data_to, gamma_data];
            }else{
                localStorage['dynamic_range'] = [ini_range[0], ini_range[1], ini_range[2], ini_range[3], green_data_from, green_data_to, ini_range[6]];
            }
            refresh_layer(app.rft_id);
        },
    });
    
    $gamma_range.ionRangeSlider({
        min: 0.1,
        max: 2,
        from: (ini_range == null) ? 1 : ini_range[6],
        grid: true,
        step: 0.1,
        onFinish: function (data) {
            gamma_data = data.from;
            if (ini_range == null){
                app.rft_id = hostname+fid+'/'+pid + '&svc.crange='+ 
                             red_data_from + '-'+ red_data_to +','+ blue_data_from + '-'+ blue_data_to + ',' + green_data_from + '-'+ green_data_to +'&svc.gamma=' + gamma_data;
            }else{
                if(slice_type == 'F'){
                    app.rft_id = hostname+fid+'/'+pid + '&svc.crange='+ 
                             ini_range[0] + '-'+ ini_range[1] +','+ ini_range[2] + '-'+ ini_range[3] + ',' + ini_range[4] + '-'+ ini_range[5] +'&svc.gamma=' + gamma_data;
                }else{
                    app.rft_id = hostname+fid+'/'+pid + '&svc.crange='+ 
                             red_data_from + '-'+ red_data_to +','+ blue_data_from + '-'+ blue_data_to + ',' + green_data_from + '-'+ green_data_to +'&svc.gamma=' + gamma_data;
                }
            }
            console.info(app.rft_id);
            if (ini_range == null){
                localStorage['dynamic_range'] = [red_data_from, red_data_to, blue_data_from, blue_data_to, green_data_from, green_data_to, gamma_data];
            }else{
                localStorage['dynamic_range'] = [ini_range[0], ini_range[1], ini_range[2], ini_range[3], ini_range[4], ini_range[5], gamma_data];
            }
            refresh_layer(app.rft_id);
        },
    });


    $red_range.on("change", red_track);
    $blue_range.on("change", blue_track);
    $green_range.on("change", green_track);
    $gamma_range.on("change", gamma_track);
}

function resample_layer(rft_id){
    app.rft_id = rft_id;
    app.layers.setSource(new ol.source.ImageStatic({
            url : app.rft_id,
            projection : app.proj,
            //imageExtent : extent
        }));

}
function refresh_layer(rft_id){
    $('.map').empty();
    $('.zonemap').empty();
    app.rft_id = rft_id;
    if(window.location.pathname == "/mamo/ol5.html"){
        reloadJs("/openlayers/scripts/viewer_ol5.js"); 

    }else if(window.location.pathname == "/riken/openlayers/ol6.html"){
        reloadJs("/openlayers/scripts/viewer_ol6.js"); 
    }else if(window.location.pathname == "/riken/openlayers/ol8.html"){
        reloadJs("/openlayers/scripts/viewer_ol8.js"); 
    }else if(window.location.pathname == "/riken/openlayers/ol7.html"){
        reloadJs("/openlayers/scripts/viewer_ol7.js"); 
    }else if(window.location.pathname == "/riken/openlayers/ol_mri.html"){
        reloadJs("/riken/openlayers/scripts/viewer_mri2.js"); 
    }else{
        reloadJs("/mamo/scripts/viewer_cshl_anno.js"); 
    }
}

function reloadJs(src) {
    //src = $('script[src$="' + src + '"]').attr("src");
    $('script[src$="' + src + '"]').remove();
    $('<script/>').attr('src', src).appendTo('body');
}

function addSliderDiv(){
	if(slice_type== 'F'){
		var sliderDiv='<div>Dynamic Range:</div>'+
					  '<div class="red_slider">'+
	        			'<div class="red_slider_note">Red:</div>' + 
	        			'<input id="red_range_slider" />' +
	        			'<div class="red_slider_right">' +
	            			//'<b id="red_result_slider" class="result_slider"></b>' +
		        		'</div>'+
	    			  '</div>' +
	    			  '<div class="blue_slider">' +
	        		  	'<div class="blue_slider_note">Green:</div>' +
	        			'<input id="blue_range_slider" />' +
	        			'<div class="blue_slider_right">' +
	           			    //'<b id="blue_result_slider" class="result_slider"></b>' +
	        			'</div>' +
	    			   '</div>' +
	    			   '<div class="green_slider">' +
	        			'<div class="green_slider_note">Blue:</div>' +
	        			'<input id="green_range_slider" />' +
	        			'<div class="green_slider_right">' +
	            			//'<b id="green_result_slider" class="result_slider"></b>' +
	        			'</div>' +
	    			   '</div>'+
	    			   '<div class="gamma_slider">' +
	        			'<div class="gamma_slider_note">Gamma:</div>' +
	        			'<input id="gamma_range_slider" />' +
	        			'<div class="gamma_slider_right">' +
	            			//'<b id="gamma_result_slider" class="result_slider"></b>' +
	        			'</div>' +
	    			   '</div>';
	 }else if(slice_type== 'mri'){
        var sliderDiv='<div class="mri_contrast_slider">' +
                        '<div class="mri_contrast_slider_note">Contrast:</div>' +
                        '<input id="mri_contrast_range_slider" />' +
                        '<div class="mri_contrast_slider_right">' +
                            //'<b id="gamma_result_slider" class="result_slider"></b>' +
                        '</div>' +
                       '</div>'+
                       '<div class="mri_gamma_slider">' +
                        '<div class="mri_gamma_slider_note">Gamma:</div>' +
                        '<input id="mri_gamma_range_slider" />' +
                        '<div class="mri_gamma_slider_right">' +
                            //'<b id="gamma_result_slider" class="result_slider"></b>' +
                        '</div>' +
                       '</div>';
     }else{
	 	var sliderDiv='<div class="gamma_slider">' +
	        			'<div class="gamma_slider_note">Contrast:</div>' +
	        			'<input id="gamma_range_slider" />' +
	        			'<div class="gamma_slider_right">' +
	            			//'<b id="gamma_result_slider" class="result_slider"></b>' +
	        			'</div>' +
	    			   '</div>';
	 }
	 
    // var isMobile = ('ontouchstart' in document.documentElement && navigator.userAgent.match(/Mobi/));
    // if(isMobile){
    // 	$('#rangeslider_inside_tab').append(sliderDiv);
    // }else{
    // 	//document.getElementById("rangeslider").style.display = "none";
    // 	$('#rangeslider').append(sliderDiv);
    // }
    $('#rangeslider').append(sliderDiv);
}

function addCellCountingDiv(){
	var CellDiv='<div class="cell-counting">'+
			    	'<label>Cell Counting (FB):</label>'+
			    	'<div class="onoffswitch">'+
					    '<input type="checkbox" name="onoffswitch" class="onoffswitch-checkbox" id="cellcount_onoffswitch" checked>'+
					    '<label class="onoffswitch-label" for="cellcount_onoffswitch">'+
					        '<span class="onoffswitch-inner"></span>'+
					        '<span class="onoffswitch-switch"></span>'+
					    '</label>'+
					'</div>'+
			        '<form class="form-inline">'+
			            '<label><p id="brain_name"></p></label><br/>'+
			            '<label>Mark Type:&nbsp</label>'+
			            '<select class="selectCellBox" id="mtype">'+
			            '<option value="Polygon">Polygon</option>'+
			            '<option value="Box">Box</option>'+
			            '<option value="All">All</option>'+
			            '<option value="None" selected>None</option>'+
			          '</select>'+
			        '</form>'+
			        /* '<button id="jsonbutton">Count Cells</button>'+ */
			        '<div id="popup"></div>'+
			        '<p class="lorem"></p>'+
			        '<div id="rangeslider_inside_tab"></div>'+
			    '</div>';

	$('#cell_counting').append(CellDiv);
	
	if(slice_type != 'F'){
		$('#cell_counting').hide();
	}
}

function addHisOverlay(){
    var HisDiv='<div class="his-overlay">'+
                    '<label>Histologal Overlay:</label>'+
                    '<div class="onoffswitch1">'+
                        '<input type="checkbox" name="onoffswitch1" class="onoffswitch-checkbox1" id="hisoverlay_onoffswitch" checked>'+
                        '<label class="onoffswitch-label1" for="hisoverlay_onoffswitch">'+
                            '<span class="onoffswitch-inner1"></span>'+
                            '<span class="onoffswitch-switch1"></span>'+
                        '</label>'+
                    '</div>'+
                '</div>';

    $('#his_overlay').append(HisDiv);
}
function addMetaDataDiv(){
    regquery = '{"brainno":'+ brain_id +',"label":"'+ slice_type +'","filelocation":"'+file_location+ '","brainname":"'+ slice_no + '"}';
    $.ajax({
        url:'/openlayers/getmeta.php',
        type: 'POST',
        //contentType:'application/json; charset = utf-8',
        data: {'qry' :regquery},
            success:function(result){
                $('#metadatainfo').append(result);         
        }
    });



}
function addBrainName(brain_name){
    $('#brain_name').empty();
    $('#brain_name').append('<p>'+brain_name+'</p>');

}

function showUser_for_ol3(str, str2, str3, str4) {
    if (str == "") {
        document.getElementById("txtHint").innerHTML = "";
        return;
    } else { 
        if (window.XMLHttpRequest) {
            // code for IE7+, Firefox, Chrome, Opera, Safari
            xmlhttp = new XMLHttpRequest();
        } else {
            // code for IE6, IE5
            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
        }
        xmlhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                document.getElementById("gallery-thumbnail").innerHTML = this.responseText;
                var num = $('.current-section').prop('id').split('-');
                centerslider(num[1]);
            }
        };
        xmlhttp.open("GET","getfile.php?brain_id="+str+"&label="+str2+"&pid="+str3+"&fid="+str4,true);
        xmlhttp.send();
    }
}

function showUser_for_ol4(str, str2, str3, str4) {
    if (str == "") {
        document.getElementById("txtHint").innerHTML = "";
        return;
    } else { 
        if (window.XMLHttpRequest) {
            // code for IE7+, Firefox, Chrome, Opera, Safari
            xmlhttp = new XMLHttpRequest();
        } else {
            // code for IE6, IE5
            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
        }
        xmlhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                document.getElementById("gallery-thumbnail").innerHTML = this.responseText;
                var num = $('.current-section').prop('id').split('-');
                centerslider(num[1]);
            }
        };
        xmlhttp.open("GET","getsmallimage.php?brain_id="+str+"&label="+str2+"&pid="+str3+"&fid="+str4,true);
        xmlhttp.send();
    }
}

function showUser_for_ol5(str, str2, str3, str4) {
    if (str == "") {
        document.getElementById("txtHint").innerHTML = "";
        return;
    } else { 
        if (window.XMLHttpRequest) {
            // code for IE7+, Firefox, Chrome, Opera, Safari
            xmlhttp = new XMLHttpRequest();
        } else {
            // code for IE6, IE5
            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
        }
        xmlhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                document.getElementById("gallery-thumbnail").innerHTML = this.responseText;
                var num = $('.current-section').prop('id').split('-');
                centerslider(num[1]);
            }
        };
        xmlhttp.open("GET","getsmallimage_ol5.php?brain_id="+str+"&label="+str2+"&pid="+str3+"&fid="+str4,true);
        xmlhttp.send();
    }
}

function showUser_for_ol6(str, str2, str3, str4) {
    if (str == "") {
        document.getElementById("txtHint").innerHTML = "";
        return;
    } else { 
        if (window.XMLHttpRequest) {
            // code for IE7+, Firefox, Chrome, Opera, Safari
            xmlhttp = new XMLHttpRequest();
        } else {
            // code for IE6, IE5
            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
        }
        xmlhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                document.getElementById("gallery-thumbnail").innerHTML = this.responseText;
                var num = $('.current-section').prop('id').split('-');
                centerslider(num[1]);
            }
        };
        xmlhttp.open("GET","getsmallimage_ol6.php?brain_id="+str+"&label="+str2+"&pid="+str3+"&fid="+str4,true);
        xmlhttp.send();
    }
}

function showUser_for_ol8(str, str2, str3, str4) {
    if (str == "") {
        document.getElementById("txtHint").innerHTML = "";
        return;
    } else { 
        if (window.XMLHttpRequest) {
            // code for IE7+, Firefox, Chrome, Opera, Safari
            xmlhttp = new XMLHttpRequest();
        } else {
            // code for IE6, IE5
            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
        }
        xmlhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                document.getElementById("gallery-thumbnail").innerHTML = this.responseText;
                var num = $('.current-section').prop('id').split('-');
                centerslider(num[1]);
            }
        };
        xmlhttp.open("GET","getsmallimage_ol8.php?brain_id="+str+"&label="+str2+"&pid="+str3+"&fid="+str4,true);
        xmlhttp.send();
    }
}

function showUser_for_mri(str, str2, str3, str4) {
    if (str == "") {
        document.getElementById("txtHint").innerHTML = "";
        return;
    } else { 
        if (window.XMLHttpRequest) {
            // code for IE7+, Firefox, Chrome, Opera, Safari
            xmlhttp = new XMLHttpRequest();
        } else {
            // code for IE6, IE5
            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
        }
        xmlhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                document.getElementById("gallery-thumbnail").innerHTML = this.responseText;
                //console.info('testing:'+this.responseText);
            }
        };
        xmlhttp.open("GET","getsmallimage_mri.php?brain_id="+str+"&label="+str2+"&pid="+str3+"&fid="+str4,true);
        xmlhttp.send();
    }
}

function showUser_for_ol4_cross(str, str2, str3, str4) {
    if (str == "") {
        document.getElementById("txtHint").innerHTML = "";
        return;
    } else { 
        if (window.XMLHttpRequest) {
            // code for IE7+, Firefox, Chrome, Opera, Safari
            xmlhttp = new XMLHttpRequest();
        } else {
            // code for IE6, IE5
            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
        }
        xmlhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                document.getElementById("gallery-thumbnail").innerHTML = this.responseText;
                var num = $('.current-section').prop('id').split('-');
                centerslider(num[1]);
            }
        };
        xmlhttp.open("GET","getsmallimage_ol4_cross.php?brain_id="+str+"&label="+str2+"&pid="+str3+"&fid="+str4,true);
        xmlhttp.send();
    }
}

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function openlayer(imgWidth, imgHeight, zoomurl){	
      var imgCenter = [imgWidth / 2, -imgHeight / 2];
      var proj = new ol.proj.Projection({
        code: 'ZOOMIFY',
        units: 'pixels',
        extent: [0, 0, imgWidth, imgHeight]
      });

      var source = new ol.source.Zoomify({
        url:zoomurl,
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
          zoom: 2,
          extent: [0, -imgHeight, imgWidth, 0]
        })
      });
      var sidebar = $('#sidebar').sidebar();    
} 


function djatoka_ol(imgWidth, imgHeight, zoomurl){

	  var imgCenter = [imgWidth / 2, -imgHeight / 2];
      var proj = new ol.proj.Projection({
        code: 'DJATOKA',
        units: 'pixels',
        extent: [0, 0, imgWidth, imgHeight]
      });

      var source = new ol.source.Djatoka({
      	url: zoomurl,
        image: 'http://mitra.brain.riken.jp/wp-content/uploads/m851/m851F/JP2/M851-F35--_2_0104.jp2',
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
          zoom: 2,
          extent: [0, -imgHeight, imgWidth, 0]
        })
      });
      var sidebar = $('#sidebar').sidebar();
      
}
function trigerIIIF(url, zoomurl){
	$.getJSON(url, function (data) {
	    var imgWidth = data.width;
	    var imgHeight = data.height;
 	    openlayer(imgWidth,imgHeight, zoomurl); 
/* 	    djatoka_ol(imgWidth,imgHeight, zoomurl); */
	});
}

function reloadJs2(src) {
    src = $('script[src$="' + src + '"]').attr("src");
    $('script[src$="' + src + '"]').remove();
    $('<script/>').attr('src', src).appendTo('body');
}

function ScaleSlider() {
    var jssor_slider1 = new $JssorSlider$('main-slider', slider_opt);
    var windowWidth = $(window).width();

    if (windowWidth) {
        var windowHeight = $(window).height();
        var originalWidth = jssor_slider1.$OriginalWidth();
        var originalHeight = jssor_slider1.$OriginalHeight();

        var scaleWidth = windowWidth;
        if (originalWidth / windowWidth > originalHeight / windowHeight) {
            scaleWidth = Math.ceil(windowHeight / originalHeight * originalWidth);
        }

        //jssor_slider1.$ScaleWidth(scaleWidth);
        jssor_slider1.$ScaleWidth(windowWidth);
    }
    else
        window.setTimeout(ScaleSlider, 30);
}

//trigger functions when loaded

$(document).ready(function(){
  if (window.location.href.indexOf("ol3") != -1){
  	var brain_id = getParameterByName('brain_id');
  	var label	 = getParameterByName('label');
  	var pid 	 = getParameterByName('pid');
  	var fid 	 = getParameterByName('fid');
  	var url 	 = 'http://mitra.brain.riken.jp:81/fcgi-bin/iipsrv.fcgi?IIIF=/var/www/html/wp-content/uploads/'+fid+'/'+pid+'/info.json';
  	var zoomurl	 = 'http://mitra.brain.riken.jp:3000/adore-djatoka/resolver';
  	trigerIIIF(url, zoomurl);
  	showUser_for_ol3(brain_id, label, pid, fid); 

  	setTimeout(function myFunction() {
  		var num = $('.current-section').prop('id').split('-');
  	    centerslider(num[1]);
  	}, 10)
  }

  $('#cellcount_onoffswitch').click(function(){
    if($('#cellcount_onoffswitch:checkbox:checked').length == 1){
        $('.map').empty();
        $('.zonemap').empty();
        
        if(window.location.pathname == "/openlayers/ol5.html"){
            reloadJs("/openlayers/scripts/viewer_ol5.js"); 

        }else{
            reloadJs("/openlayers/scripts/viewer.js");
        }
    }
  })

  $('#hisoverlay_onoffswitch').click(function(){
    if($('#hisoverlay_onoffswitch:checkbox:checked').length == 1){
        $('.overlaymap').css('display','block');
        $('.overlay_dial_slider').css('display','block');
    }else{
        $('.overlaymap').css('display','none');
        $('.overlay_dial_slider').css('display','none');
    }
  })

  $('#unlock_his_overlay').click(function(){
    if ($('#unlock_his_overlay').prop("checked")){
      $('.map').empty();
      $('.zonemap').empty();
      console.log('unlock_his_checked');
      if(window.location.pathname == "/openlayers/ol5.html"){
          reloadJs("/openlayers/scripts/viewer_ol5.js"); 
          $('.unlock_his_overlay').toggle( "slow" );
      }else{
          reloadJs("/openlayers/scripts/viewer.js");
          $('.unlock_his_overlay').toggle( "slow" );
      }
    }
  })

  $('#return_init_dyn_range').click(function(){
    if(window.location.pathname == "/openlayers/ol4.html" || window.location.pathname == "/openlayers/ol8.html" || window.location.pathname == "/openlayers/ol4_cross.html"){
        localStorage.removeItem('dynamic_range');
        location.reload();
    }
    if(window.location.pathname == "/openlayers/ol_mri.html"){
        localStorage.removeItem('mri_range');
        location.reload();
    }
  })

  $('#opacity_range_plus_click').click(function(){
    if(window.location.pathname == "/openlayers/ol_mri.html" || window.location.pathname == "/openlayers/ol6.html"){
        if (app.overlay_layer.getOpacity() >= 0) {
            var op = app.overlay_layer.getOpacity();
            op += 0.1;
            if (op > 1) {
                op = 1;
            }
            app.overlay_layer.setOpacity(op);
        }
    }else if (window.location.pathname == '/openlayers/ol4_cross.html'){
        if (app.vector_edit.getOpacity() >= 0) {
            var op = app.vector_edit.getOpacity();
            op += 0.1;
            if (op > 1) {
                op = 1;
            }
            app.vector_edit.setOpacity(op);
        }
    }
  })

  $('#opacity_range_minus_click').click(function(){
    if(window.location.pathname == "/openlayers/ol_mri.html" || window.location.pathname == "/openlayers/ol6.html"){
        if (app.overlay_layer.getOpacity() >= 0) {
            var op = app.overlay_layer.getOpacity();
            op -= 0.1;
            if (op < 0) {
                op = 0;
            }
            app.overlay_layer.setOpacity(op);
        }
    }else if (window.location.pathname == '/openlayers/ol4_cross.html'){
        if (app.vector_edit.getOpacity() >= 0) {
            var op = app.vector_edit.getOpacity();
            op -= 0.1;
            if (op < 0) {
                op = 0;
            }
            app.vector_edit.setOpacity(op);
        }
    }
  })

});	
		
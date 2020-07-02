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
            }
        };
        xmlhttp.open("GET","getsmallimage_ol8.php?brain_id="+str+"&label="+str2+"&pid="+str3+"&fid="+str4,true);
        xmlhttp.send();
    }
}

function showUser_for_cshl(str, str2, str3, str4, str5) {
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
        if (brain_id.includes('m')){
          xmlhttp.open("GET","http://www.braincircuits.org/mamo/getsmallimage_ol8.php?brain_id="+str+"&label="+str2+"&pid="+str3+"&fid="+str4+"&color="+str5,true);
        }else{
          xmlhttp.open("GET","http://www.braincircuits.org/mamo/getsmallimage_ol_cshl_testing_portal.php?brain_id="+str+"&label="+str2+"&pid="+str3+"&fid="+str4+"&color="+str5,true);
        }
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

function displayWarmingMessageForAnnotation(){
    swal({
      title: "Warming",
      text: "Please lock the annoation mode for cell mapping",
      type: "input",
      showCancelButton: true,
      closeOnConfirm: false,
      animation: "slide-from-top",
      inputPlaceholder: "Your Name:"
    });
}

function RequestAtlasData(url){
  var geourl;
  $.getJSON(url, function(result){
      geourl = result;
      //console.info(geourl); 
  });
  return geourl;
}


// function for annotation users (start, stop and others) - interactive with dashboard

function getannotationsectionstatus_dashboard(session_ids, annot_brain_id, section_num){
  section_num = Number(pid.split('_')[3].split('.')[0]);
  if(session_ids){
    $.get(dashboard_api + 'getannotationsectionstatus/', {session_id: session_ids, annot_brain_id: annot_brain_id, section_num: section_num}, function(resp){
          console.info(resp);
          if (resp.status == 'CHKIN'){
             $('#start_anno_features').addClass("active");
             $('#start_anno_features').css("background-color","aquamarine");
          }else if (resp.status == 'CHKOUT'){
             $('#stop_anno_features').addClass("active");
             $('#stop_anno_features').css("background-color","aquamarine");           
          }else if (resp.status == 'FINAL'){
             $('#final_anno_features').addClass("active");
             $('#final_anno_features').css("background-color","aquamarine");  
          }
      }
    )
  }
}

function getsessiondetails_dashboard(session_ids){
  if(session_ids){
    $.get(dashboard_api + 'getsessiondetails/', {session_id: session_ids}, function(resp){
          //console.info(resp);
          $('#login-status').text('Welcome Back:' + resp.user + ' | ' + 'Last Login: ' + resp.last_login);
      }
    )
  }
}

function startsectionannotation_dashboard(annot_brain_id, section_num){
  section_num = Number(pid.split('_')[3].split('.')[0]);
  if(session_ids){
    $.post(dashboard_api + 'startsectionannotation/', {annot_brain_id: annot_brain_id, section_num: section_num}, function(resp){
          console.info(resp);
      }
    )
  }else{
    swal('No Session Detected!','Please log in from ANNOTATION DASHBORD', 'error');
  }
}

function stopsectionannotation_dashboard(annot_brain_id, section_num){
  section_num = Number(pid.split('_')[3].split('.')[0]);
  if(session_ids){
    $.post(dashboard_api + 'stopsectionannotation/', {annot_brain_id: annot_brain_id, section_num: section_num}, function(resp){
          console.info(resp);
      }
    )
  }else{
    swal('No Session Detected!','Please log in from ANNOTATION DASHBORD', 'error');
  }

}

function finalizesectionannotation_dashboard(annot_brain_id, section_num){
  section_num = Number(pid.split('_')[3].split('.')[0]);
  if(session_ids){
    $.post(dashboard_api + 'finalsectionannotation/', {annot_brain_id: annot_brain_id, section_num: section_num}, function(resp){
          console.info(resp);
      }
    )
  }else{
    swal('No Session Detected!','Please log in from ANNOTATION DASHBORD', 'error');
  }
}


// end of annoation user interactive on dashboard

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
    var pid    = getParameterByName('pid');
    filename = pid.replace('%26', '&', pid);
    var currentTime = new Date().toLocaleString();
    if($('#cellcount_onoffswitch:checkbox:checked').length == 1){
        console.info('unlock from loged in user');
        //regquery3 = '{"brainno": ' + br_no + ',"sliceno":"' + slice_no + '","filename":"' + filename + '", "lock": 0}';
        regquery3 = '{"brainno": ' + br_no + ',"sliceno":"' + slice_no + '","filename":"' + filename + '", "lock": 0' + ',"datetime":"' + currentTime + '"}';
        $.ajax({
            type : "POST",
            url  : "http://www.braincircuits.org/mamo/get_auth_lockedinfo.php",
            data: {'qry' :regquery3},
            success :function(result){
                dirty = false;
                console.info(result);
            },
        });
    }else{
        console.info('lock from loged in user');
        //regquery3 = '{"brainno": ' + br_no + ',"sliceno":"' + slice_no + '","filename":"' + filename + '", "lock": 1}';
        regquery3 = '{"brainno": ' + br_no + ',"sliceno":"' + slice_no + '","filename":"' + filename + '", "lock": 1' + ',"datetime":"' + currentTime + '"}';
        $.ajax({
            type : "POST",
            url  : "http://www.braincircuits.org/mamo/get_auth_lockedinfo.php",
            data: {'qry' :regquery3},
            success :function(result){
                dirty = false;
                console.info(result);
            },
        });
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
          reloadJs("/annotation_tool/scripts/viewer_cshl_anno.js");
          $('.unlock_his_overlay').toggle( "slow" );
      }
    }
  })

  $('#return_init_dyn_range').click(function(){
    if(window.location.pathname == "/annotation_tool/ol_cshl_anno.html" || window.location.pathname == "/openlayers/ol8.html"){
        localStorage.removeItem('dynamic_range');
        location.reload();
    }
    if(window.location.pathname == "/openlayers/ol_mri.html"){
        localStorage.removeItem('mri_range');
        location.reload();
    }
  })

  $('#opacity_range_plus_click').click(function(){
    if(window.location.pathname == "/annotation_tool/ol_mri.html" || window.location.pathname == "/openlayers/ol6.html"){
        if (app.overlay_layer.getOpacity() >= 0) {
            var op = app.overlay_layer.getOpacity();
            op += 0.1;
            if (op > 1) {
                op = 1;
            }
            app.overlay_layer.setOpacity(op);
        }
    }
    if(window.location.pathname == "/annotation_tool/ol_cshl_anno.html"){
        if (app.fluolayer.getOpacity() >= 0) {
            var op = app.fluolayer.getOpacity();
            op += 0.1;
            if (op > 1) {
                op = 1;
            }
            app.fluolayer.setOpacity(op);
        }
    }    
  })

  $('#opacity_range_minus_click').click(function(){
    if(window.location.pathname == "/mamo/ol_mri.html" || window.location.pathname == "/openlayers/ol6.html"){
        if (app.overlay_layer.getOpacity() >= 0) {
            var op = app.overlay_layer.getOpacity();
            op -= 0.1;
            if (op < 0) {
                op = 0;
            }
            app.overlay_layer.setOpacity(op);
        }
    }
    if(window.location.pathname == "/mamo/ol_cshl_anno.html"){
        if (app.fluolayer.getOpacity() >= 0) {
            var op = app.fluolayer.getOpacity();
            op -= 0.1;
            if (op < 0) {
                op = 0;
            }
            app.fluolayer.setOpacity(op);
        }
    }
  })

  $('#start_anno_features').click(function(){
     if($(this).hasClass("active")){
         $(this).removeClass("active");
         $(this).css("background-color","");
     }else{
         $('#stop_anno_features').removeClass("active");
         $('#stop_anno_features').css("background-color","");
         $('#final_anno_features').removeClass("active");
         $('#final_anno_features').css("background-color","");

         $(this).addClass("active");
         $(this).css("background-color","aquamarine");
         startsectionannotation_dashboard(annot_brain_id, section_num);
     }
  })
  $('#stop_anno_features').click(function(){
     if($(this).hasClass("active")){
         $(this).removeClass("active");
         $(this).css("background-color","");
     }else{
         $('#start_anno_features').removeClass("active");
         $('#start_anno_features').css("background-color","");
         $('#final_anno_features').removeClass("active");
         $('#final_anno_features').css("background-color","");

         $(this).addClass("active");
         $(this).css("background-color","aquamarine");
         stopsectionannotation_dashboard(annot_brain_id, section_num);
     }
  })
  $('#final_anno_features').click(function(){
     if($(this).hasClass("active")){
         $(this).removeClass("active");
         $(this).css("background-color","");
     }else{
         $('#start_anno_features').removeClass("active");
         $('#start_anno_features').css("background-color","");
         $('#stop_anno_features').removeClass("active");
         $('#stop_anno_features').css("background-color","");

         $(this).addClass("active");
         $(this).css("background-color","aquamarine");
         finalizesectionannotation_dashboard(annot_brain_id, section_num);
     }
   
  })
  // var exportPNGElement = document.getElementById('export-png');

  // if ('download' in exportPNGElement) {
  //   exportPNGElement.addEventListener('click', function() {
  //     app.map.once('postcompose', function(event) {
  //       var canvas = event.context.canvas;
  //       console.info(canvas);
  //       //exportPNGElement.crossOrigin = "Anonymous";
  //       //exportPNGElement.href = canvas.toDataURL('image/png');
  //     });
  //     app.map.renderSync();
  //   }, false);
  // } else {
  //   var info = document.getElementById('no-download');
  //   /**
  //    * display error message
  //    */
  //   info.style.display = '';
  // }

});	
		

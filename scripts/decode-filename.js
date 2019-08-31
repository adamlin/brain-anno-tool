function getFileFromServer() {
    var pid = (window.location).href;
    var per_link = pid.substring(pid.lastIndexOf('?') + 1);
    var result = per_link.split('&');
	

    if (result.length != '2'){
       window.alert("No image found. Please visit mitra.brain.riken.jp and select images.");
    }

    var img_name = result[0].substring(result[0].lastIndexOf('=') + 1);
    var folder_name = result[1].substring(result[1].lastIndexOf('=') + 1);
    
    var path = folder_name.split('/');
    var brain_id = path[0];
    var label = path[1].substr(-1);
    
    var final_img_path = '/var/www/html/wp-content/uploads/'+ folder_name +'/';
    console.log(final_img_path);
    
/*
    global $wpdb;
	var sql_results = $wpdb->get_results("SELECT Navigator_section.jp2Image FROM Navigator_section WHERE  Navigator_section.brain_id=$brain_id AND Navigator_section.label='$label' AND Navigator_section.isDamaged=0 AND Navigator_section.reImage=0 ORDER BY Navigator_section.slideIndex ASC");

	var new_images = array();
	if (sql_results) {
   		foreach (var raw in sql_results) {
     		new_images[] = row->jp2Image;
   		}
	}
    
    
    foreach($new_images as $image) {
        $image_link = explode('||', $image);
        $less_image = explode('.jp2',$image_link[0]);
		echo '<a class="overwrite_style" href="'.$image_link[1].'" target="_blank">';
		echo '<img class="photo" alt="" src="';
    
	    if($label =='F'){
	        echo $less_image[0].'.jp2&WID=150&QLT=130&CNT=2&CVT=jpeg';
	    }else{
	        echo $less_image[0].'.jp2&WID=150&QLT=130&CVT=jpeg';
	    }
		echo '" /></a>';
	}
*/
    
	var folder = final_img_path;

	$.ajax({
	    url : folder,
	    success: function (data) {
	        $(data).find("a").attr("href", function (i, val) {
	            if( val.match(/\.(jp2)$/) ) { 
	                console.log("<img src='"+ folder + val +"'>");
	            } 
	        });
	    }
	});
    
    var lname = final_img_path;

    //decode the name of file                                                                                                                                          
    var arrStr = lname.pid.split(/[_.]/);
    var i;
    var name_before_number = arrStr.length - 3; // look for file name before .jp2 and file number                                                                      
    var file_name = '';

    //for(i=0; i < arrStr.length; i++){                                                                                                                                
    //  if (!isNaN(arrStr[i])){                                                                                                                                        
    //      name_before_number = i-1;                                                                                                                                  
    //  }                                                                                                                                                              
    //}                                                                                                                                                                

    if (name_before_number == 0){
        file_name = arrStr[0] + '_';
    }
    else{
         for(i=0; i <= name_before_number; i++){
             file_name += arrStr[i]+'_';
         }
    }
    // --end decode name                                                                                                                                               

    var count = 1;
    var data = '[{';
    for (count; count <= Number(lname.count); count ++){
        //if(count == 8 || count == 11){ }else{                                                                                                                        
        data += '"thumbnail":"http://mitra.brain.riken.jp:81/fcgi-bin/iipsrv.fcgi?FIF=/var/www/html/wp-content/uploads/' + lname.fid + '/' + file_name + padLeft(count,3)
             +'.jp2&WID=308&QLT=98&CVT=jpeg",'+ '"url":"http://mitra.brain.riken.jp:81/img.html?pid='+ file_name+ padLeft(count, 3) + '.jp2&fid=' + lname.fid + '",'
             +'"title":'+'"'+ file_name + padLeft(count,3) +'"}';

            if (count != Number(lname.count)){
                data += ',{';
            }
        //}                                                                                                                                                            
    }
    data = data + ']||[]';
    return data;
}

function showfiles(str) {
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
                document.getElementById("txtHint").innerHTML = this.responseText;
            }
        };
        xmlhttp.open("GET","getfile.php?q="+str,true);
        xmlhttp.send();
    }
}

$(document).ready(function(){
        getFileFromServer();
});
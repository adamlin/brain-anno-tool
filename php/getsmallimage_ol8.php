<?php
    $brain_id = $_GET['brain_id'];
    $label = $_GET['label'];
    $pid = $_GET['pid'];
    $fid = $_GET['fid'];
    $color = $_GET['color'];


    $brain_id = str_replace('m', '', $brain_id);
    /* $label = intval($_GET['label']); */
    $con = mysqli_connect('localhost','root','admin','marmoset_riken_updated');
    if (!$con) {
        die('Could not connect: ' . mysqli_error($con));
    }   
    $sql="SELECT Navigator_section.jp2Image, Navigator_section.filename, Navigator_section.modeIndex FROM Navigator_section WHERE Navigator_section.brain_id=$brain_id AND Navigator_section.label='$label' AND Navigator_section.isDamaged=0 AND Navigator_section.reImage=0 AND Navigator_section.misLabeled=0 ORDER BY Navigator_section.slideIndex ASC";
    $olurl = $_SERVER["SERVER_NAME"].$_SERVER["REQUEST_URI"];

    if ($result = mysqli_query($con, $sql)) {
       while($row = mysqli_fetch_array($result)) {
            $image_link = explode('||', $row['jp2Image']);
            $less_image = explode('.jp2',$image_link[0]);
            $less_image = str_replace('http://mitra.brain.riken.jp:81', 'http://braincircuits.org', $less_image);
            $less_image = str_replace('/var/www/html/wp-content/uploads', '', $less_image);
            $less_image = str_replace('fcgi-bin', 'cgi-bin', $less_image);
            // decode to get section number from filename
            $dect_num = explode('_', $row['filename']);
            $section_num = str_replace('.jp2','', $dect_num[2]);

            if($brain_id == '855'){
                $improve_image = $less_image[0].'.jp2&WID=150&QLT=130&CNT=0.5&CVT=jpeg';
            }
            else{
                if($label == 'F'){
                    $improve_image = $less_image[0].'.jp2&WID=150&QLT=130&CNT=600&CVT=jpeg'; //increase gamma *600
                }else{
                    $improve_image = $less_image[0].'.jp2&WID=150&QLT=130&CNT=0.5&CVT=jpeg';
                }
            }
            if($brain_id =='819' || $brain_id == '820' || $brain_id == '822' || $brain_id == '823' || $brain_id == '851'){
                if($label == 'F'){
                    $improve_image = $less_image[0].'.jp2&WID=150&QLT=130&CNT=2&CVT=jpeg'; //increase gamma *2
                }
            } 

            $filepath = 'm'.$brain_id.'/m'.$brain_id.$label.'/JP2/'.$row['filename'];
            //echo '<a href="/mamo/ol_cshl_anno.html?brain_id=m'.$brain_id.'&label='.$label.'&pid='.$dect_num.'&color='.$color.'">';
            echo '<a href="/mamo/ol_cshl_anno.html?brain_id=m'.$brain_id.'&label='.$label.'&pid='.$filepath.'&color='.$color.'">';
            if ($filepath == $pid){
                echo '     <div class="section-thumbnail current-section" id="thumbnail-'.$section_num.'" data-section-id="'.$row['modeIndex'].'">';
            }else{
                //echo $filepath;
                //echo $pid;
                echo '     <div class="section-thumbnail" id="thumbnail-'.$section_num.'" data-section-id="'.$row['modeIndex'].'">';
            }
                echo '        <span class="align-helper"></span>';
                echo '            <img class="lazy-load bottom-filmstrip" src="'.$improve_image.'" alt="Section r3b" width="120"/>';
            if ($label == 'F'){
                echo '        <div class="section-label">Fluorescence<br/>Sections: '.$section_num.'</div>'; /* use $count instead of $row['modeIndex'] */
            }else if ($label == 'N'){
                echo '        <div class="section-label">Nissl<br/>Sections: '.$section_num.'</div>';
            }else if ($label == 'M'){
                echo '        <div class="section-label">Myelin<br/>Sections: '.$section_num.'</div>';
            }else if ($label == 'C'){
                echo '        <div class="section-label">CTB<br/>Sections: '.$section_num.'</div>';
            }
                echo '      </div>';
                echo '</a>';
        }
    }
    mysqli_free_result($result);
?>
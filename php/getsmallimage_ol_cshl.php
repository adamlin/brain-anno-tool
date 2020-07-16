<?php
    header('Access-Control-Allow-Origin: *');
    
    $brain_id = $_GET['brain_id'];
    $label = $_GET['label'];
    $pid = $_GET['pid'];
    $color = $_GET['color'];
    /* $label = intval($_GET['label']); */
    $con = mysqli_connect('localhost','root','admin','mbaDB_dev');
    if (!$con) {
        die('Could not connect: ' . mysqli_error($con));
    }
    $series_name = 'MouseBrain_' . $brain_id . ' ' . $label;

    $sql="SELECT seriesbrowser_section.pngPathLow, seriesbrowser_section.jp2Path, seriesbrowser_section.sectionOrder FROM seriesbrowser_series, seriesbrowser_section WHERE seriesbrowser_series.desc='$series_name' AND seriesbrowser_series.id = seriesbrowser_section.series_id ORDER BY seriesbrowser_section.sectionOrder";

    $olurl = $_SERVER["SERVER_NAME"].$_SERVER["REQUEST_URI"];

    if ($result = mysqli_query($con, $sql)) {
       while($row = mysqli_fetch_array($result)) {
            $image_link = $row['pngPathLow'];
            $improve_image = $image_link;
            // decode to get section number from filename
            $dect_num = str_replace('&','%26', $row['jp2Path']);
            
            //check filename and url for current section
            $url_filename = str_replace('%26', '&', $pid);
            $database_filename = str_replace('/brainimg', '', $row['jp2Path']);

            $section_num = $row['sectionOrder'];

            echo '<a href="/mamo/ol_cshl_anno.html?brain_id='.$brain_id.'&label='.$label.'&pid='.$dect_num.'&color='.$color.'">';
            if ($url_filename == $database_filename){
                echo '     <div class="section-thumbnail current-section" id="thumbnail-'.$section_num.'" data-section-id="'.$row['sectionOrder'].'">';
            }else{
                echo '     <div class="section-thumbnail" id="thumbnail-'.$section_num.'" data-section-id="'.$row['sectionOrder'].'">';
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
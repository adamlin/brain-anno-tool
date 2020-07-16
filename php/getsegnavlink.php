<?php
	$args = json_decode($_POST['qry'],true);

	if(true) {
		$brain_id = $args['brainno'];
		$label = $args['label'];
		$filelocation = $args['filelocation'];
		$index = $args['index'];
		//echo 'brain_id='.$brain_id.'&label='.$label.'&pid='.'&fid='.$filelocation;
		
		$con = mysqli_connect('localhost','root','admin','mbaDB_dev');
		if (!$con) {
		    die('Could not connect: ' . mysqli_error($con));
		}	
		//$sql="SELECT Navigator_section.filename FROM Navigator_section WHERE Navigator_section.brain_id=$brain_id AND Navigator_section.label='$label' AND Navigator_section.modeIndex='$index'";
		$series_name = 'MouseBrain_' . $brain_id . ' ' . $label;

    	$sql="SELECT seriesbrowser_section.pngPathLow, seriesbrowser_section.jp2Path, seriesbrowser_section.sectionOrder FROM seriesbrowser_series, seriesbrowser_section WHERE seriesbrowser_series.desc='$series_name' AND seriesbrowser_series.id = seriesbrowser_section.series_id AND seriesbrowser_section.sectionOrder='$index'";
		$count = 0;
		if ($result = mysqli_query($con, $sql)) {
	       while($row = mysqli_fetch_array($result)) {
	            $dect_num = str_replace('&','%26', $row['jp2Path']);
	            $section_num = $row['sectionOrder'];
       			echo 'brain_id='.$brain_id.'&label='.$label.'&pid='.$dect_num;
       			return;
	       }
	    }
    }
?>
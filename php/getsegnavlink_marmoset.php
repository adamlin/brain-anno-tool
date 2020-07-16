<?php

	//testing
	//$test = '{"brainno":"1231","label":"F","filelocation":"m1231/m1231F/JP2","index":"198"}';
	//$args = json_decode($test,true);
	$args = json_decode($_POST['qry'],true);

	if(true) {
		$brain_id = $args['brainno'];
		$label = $args['label'];
		$filelocation = $args['filelocation'];
		$index = $args['index'];
		//echo 'brain_id='.$brain_id.'&label='.$label.'&pid='.'&fid='.$filelocation;
		
		$con = mysqli_connect('localhost','root','admin','marmoset_riken');
		if (!$con) {
		    die('Could not connect: ' . mysqli_error($con));
		}	
		//$sql="SELECT Navigator_section.filename FROM Navigator_section WHERE Navigator_section.brain_id=$brain_id AND Navigator_section.label='$label' AND Navigator_section.modeIndex='$index'";
		$sql="SELECT Navigator_section.filename FROM Navigator_section WHERE Navigator_section.brain_id=$brain_id AND Navigator_section.label='$label' ORDER BY Navigator_section.slideIndex ASC";
		$count = 0;
		if ($result = mysqli_query($con, $sql)) {
	       while($row = mysqli_fetch_array($result)) {
	       		$filename = $row['filename']; 
	       		if ($count == $index){
	       			echo 'brain_id=m'.$brain_id.'&label='.$label.'&pid='.$filelocation.'/'.$filename;
	       			return;
	       		}
	       		$count ++;
	       		//echo 'brain_id='.$brain_id.'&label='.$label.'&pid='.'&fid='.$filelocation;
	       }
	    }
    }

?>
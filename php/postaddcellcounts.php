<?php
	header('Access-Control-Allow-Origin: *');
	$args = json_decode($_POST['qry'],true);

	if(true) {
		$sliceno = $args['sliceno'];
		$color = $args['color'];
		//$brainno = $args['brainno'];
		$dir = "/brainimg/detection/annotate/annotated".$color."/*";

		foreach(glob($dir) as $file) {  
		  	$pathinfo = pathinfo($file);

		  	if ($pathinfo['filename'] == $sliceno){
		  		$source_file = fopen('/brainimg/detection/annotate/annotated'.$color.'/'.$pathinfo['filename'].'.txt', "r" ) or die("Couldn't open $filename");
		  		$coor_type = array();

		  		while (!feof($source_file)) {
				   $coor_type[] = fgets($source_file);
				}
				echo $coor_type[1];
				fclose($source_file);
				return;
		  	}
		}
	}
?>
s
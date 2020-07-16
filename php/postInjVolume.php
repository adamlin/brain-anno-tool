<?php
	header('Access-Control-Allow-Origin: *');
	$args = json_decode($_POST['qry'],true);

	if(true) {
		$sliceno = $args['sliceno'];
		$brainno = $args['brainno'];
		$color = $args['color'];

		//$brainno = '3318';
		//$sliceno = 'PMD3319%263318-F29-2019.02.27-00.03.42_PMD3318_2_0086.jp2';

		if(strpos($brainno, 'PTM') === 0 || strpos($brainno, 'HUA') === 0 || strpos($brainno, 'MD') === 0 ){
			$brainno = $brainno;
		}else{
			$brainno = 'PMD'.$brainno;
		}

		$dir = "/brainimg/detection/injectionvolume/annotated".$color.'/'.$brainno.'/*';
		foreach(glob($dir) as $file) {  
		  	$pathinfo = pathinfo($file);
		  	$sliceno = str_replace('.jp2', '', $sliceno);

		  	if ($pathinfo['filename'] == $sliceno){
		  		$source_file = fopen('/brainimg/detection/injectionvolume/annotated'.$color.'/'.$brainno.'/'.$pathinfo['filename'].'.json', "r" ) or die("Couldn't open $filename");

		  		while (!feof($source_file)) {
				   $output = fgets($source_file);
				}

				echo $output;
				fclose($source_file);
				return;
		  	}
		}
	}
?>
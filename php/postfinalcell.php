<?php
	$args = $_POST['qry'];

	if(true) {
		$sliceno = $args['sliceno'];
		$brainno = $args['brainno'];
		$color = $args['color'];

		if(strpos($brainno, 'PTM') === 0 || strpos($brainno, 'HUA') === 0 || strpos($brainno, 'MD') === 0 || strpos($brainno, 'm') === 0){
			$brainno = $brainno;
		}else{
			$brainno = 'PMD'.$brainno;
		}

		$dirsavegeojson = "/brainimg/detection/wholebraincells/annotated".$color."/".$brainno; 

		if (!file_exists($dirsavegeojson)) {
		    mkdir($dirsavegeojson, 0777, true);
		}

		$sliceno = str_replace('.jp2', '.json', $sliceno);

		$file = $dirsavegeojson.'/'.$sliceno;

		$fh = fopen($file, 'w') or die();

	    //fwrite($fh, json_encode($args['final']));
	    fwrite($fh, $args['final']);

	    fclose($fh);
	    echo $_POST;
	}
?>

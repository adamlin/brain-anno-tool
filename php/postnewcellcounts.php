<?php
	$args = json_decode($_POST['qry'],true);

	if(true) {
		$sliceno = $args['sliceno'];
		$color = $args['color'];
		//$brainno = $args['brainno'];

		$file = '/brainimg/detection/annotate/annotated'.$color.'/'.$sliceno.".json";
		$filetxt = '/brainimg/detection/annotate/annotated'.$color.'/'.$sliceno.".txt";

		$fh = fopen($file, 'w') or die();
		$fhtxt = fopen($filetxt, 'w') or die();

	    fwrite($fh, serialize($args)."\n");
	    fwrite($fhtxt, $args['del_id']."\n".$args['add_id']."\n");

	    fclose($fh);
	    fclose($fhtxt);
	    echo $_POST;
	}
?>
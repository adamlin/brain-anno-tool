<?php
	
	//$text = '{"brainno": 1144,"sliceno":"M1144-F74--_1_0146.jp2","countall":"all"}';
	//$args = json_decode($text,true);
	$args = json_decode($_POST['qry'],true);
	// echo "{ret:";
	// print_r($args);
	// echo "}";

if(true) {

	$brainno = 'm'. $args['brainno'];
	$algo = 'celllocations';
	$slicename = $args['sliceno'];
	$sliceno = 0;
	$countall = $args['countall'];
	//$geompts = $args['marking']['coordinates'][0];

	$fp = fopen(sprintf('data/%s/sectionfiles.txt', $brainno),"r");
	while(($buffer = fgets($fp))!==false) {
		$parts=explode(',', $buffer);
		if(trim($parts[1])==$slicename) {
			$sliceno = intval($parts[0]);
		}
	}
	fclose($fp);

	$slicedims = array(0,0);
	$fp = fopen(sprintf('data/%s/sectionsize.txt', $brainno),"r");
	while(($buffer = fgets($fp))!==false) {
		$parts=explode(',', $buffer);
		if($parts[0]==$slicename) {
			$slicedims[0] = intval($parts[1]);
			$slicedims[1] = intval($parts[2]);
		}
	}
	fclose($fp);


	// $longlat = '['; 
	// foreach($geompts as $pt) {
	// 	$b = ($pt[0]/($slicedims[0]/360))-180;
	// 	$a = (($pt[1]/($slicedims[1]/180))+90) * (-1);
	// 	$longlat.="[".$b.",".$a."],";
	// }
	// $longlat=substr($longlat,0,-1).']';

	// // echo "{npts:".count($geompts).",sliceno:".$sliceno;
	// // echo ",slicedims:";
	// // print_r($slicedims);
	// // echo ",longlat:".$longlat;

	// $mongocmd = "mongo ".$brainno." --eval 'db.".$algo.".find(".
	// 	'{$and:[{sliceno:'.$sliceno.'}, {coordinate:{$geoWithin:{$geometry:{type:"Polygon", coordinates:['.$longlat.']}}}}]},{coordinate:1,_id:0}).'.
	// 	"toArray().forEach(printjson)'";

	#NOTE: mongocmd2 ignores the drawn geompts

	$mongocmd2 = "mongo ".$brainno." --eval 'db.".$algo.".find(".
		'{sliceno:'.$sliceno.'},{coordinate:1,_id:0}).'.
		"toArray().forEach(printjson)'";


	//echo ",mongocmd:".$mongocmd;
	if($countall !=='all'){
		$ret = shell_exec($mongocmd);
	}else{
		$ret = shell_exec($mongocmd2);
	}	
	
	$retlines = explode("\n",$ret);
	//echo ",resp:";
	//print_r($retlines);
	$xy = '[';
	for($k=2;$k<count($retlines)-1;++$k) {
		$pt = json_decode($retlines[$k],true);
		$pt_ll=$pt['coordinate'];
		$b = ($pt_ll[0]+180)/360*$slicedims[0];
		$a = (($pt_ll[1]+90)/180*$slicedims[1]) * (-1);
		$xy.="[".$b.",".$a."],";

	}
	echo substr($xy,0,-1)."]";
	//echo "}" ;
}

?>

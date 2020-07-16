<?php
	$args = json_decode($_POST['qry'],true);
    if(true) {
        $brain_id = $args['brainno'];
        //$brain_id = 'PMD786';
    	/* $label = intval($_GET['label']); */
    	$con = mysqli_connect('localhost','root','admin','mbaDB_dev');
    	if (!$con) {
    	    die('Could not connect: ' . mysqli_error($con));
    	}	
    	$sql="SELECT * FROM seriesbrowser_summary WHERE seriesbrowser_summary.brain_name='$brain_id'";

    	$count = 0;
    	if ($result = mysqli_query($con, $sql)) {
           while($row = mysqli_fetch_array($result)) {
                $isInjSiteVolumeR   = $row['isInjSiteVolumeR'];  
                $isInjSiteVolumeG   = $row['isInjSiteVolumeG'];
                $isProcessVolumeR   = $row['isProcessVolumeR'];
                $isProcessVolumeG   = $row['isProcessVolumeG'];
                $InjLocationXYZ     = $row['InjLocationXYZ'];
                $finalRegion        = $row['finalRegion'];

    	    	echo '["'.$finalRegion.'",'.$isInjSiteVolumeR.','.$isInjSiteVolumeG.','.$isProcessVolumeR.','.$isProcessVolumeG.',"'.$InjLocationXYZ.'"]';
    		}
        }
    	mysqli_free_result($result);
    }
?>
<?php
    $args = json_decode($_POST['qry'],true);

    if(true) {

        $con = mysqli_connect('localhost','root','admin','mbaDB_dev');
        // Check connection
        if (!$con) {
            die('Could not connect: ' . mysqli_error($con));
        }          
        $filename = $args['filename'];
        $sql="SELECT seriesbrowser_section.id FROM seriesbrowser_section WHERE seriesbrowser_section.jp2Path = '$filename'";
        if ($result = mysqli_query($con, $sql)) {
           while($row = mysqli_fetch_array($result)) {
                $section_id = $row['id'];
            }
        }

        $sql2="SELECT seriesbrowser_sectionnote.id, seriesbrowser_sectionnote.annotating_section FROM seriesbrowser_sectionnote WHERE seriesbrowser_sectionnote.section_id='$section_id'";
        $hasdata = 0;
        if ($result = mysqli_query($con, $sql2)) {
           while($row = mysqli_fetch_array($result)) {
                $section_annotated_id = $row['id'];
                $section_annotated_onoff = $row['annotating_section'];
                $hasdata = 1;
            }
        }
        $date = strtotime($args['datetime']);
        $date = date('d/M/Y h:i:s', $date);
        $onofflock = intval($args['lock']);

        if($hasdata == 1 && $section_annotated_onoff == 0){
            $sql = "UPDATE seriesbrowser_sectionnote SET annotating_section='$onofflock', annotated_time='$date', write_date='$date' WHERE id='$section_annotated_id'";

            if ($con->query($sql) === TRUE) {
                echo "updated";
            } else {
                echo "failed";
            }

        } else if($hasdata == 1 && $section_annotated_onoff == 1){
            $sql = "UPDATE seriesbrowser_sectionnote SET annotating_section='$onofflock', annotated_time='$date', write_date='$date' WHERE id='$section_annotated_id'";

            if ($con->query($sql) === TRUE) {
                echo "updated";
            } else {
                echo "failed";
            }

        } else {
            $sql = "INSERT INTO seriesbrowser_sectionnote (section_id, updater_id, annotating_tiles, annotating_section, annotated_section, annotated_time, annotated_location, score, comment, write_date)
            VALUES ($section_id, '2', '[]', '1', '0', $date, '/brainimg/hhaha', '0', 'hello world', '$date')";

            if ($con->query($sql) === TRUE) {
                echo "created";
            } else {
                echo "failed";
            }
        }

        $con->close();
    }
?>

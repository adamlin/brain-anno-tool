<?php
	header("Cache-Control: no-cache, must-revalidate");
	require_once('../wp-load.php');
	require_once("../mamo/getsession.php");
	login();
	$user = wp_get_current_user();
	if ($user->user_firstname !=''){
		echo 'Welcome Back - '.$user->user_firstname . " " . $user->user_lastname . '<br>';
		echo 'username -> '.$user->user_login. '<br>';
		echo 'email -> '.$user->user_email. '<br>';
		echo 'userID -> '.$user->ID. '<br>';
		echo 'userDisplayName -> '.$user->display_name.'<br>';
	}
	$brain_id= $_POST['brain_id'];
	$label= $_POST['label'];
	$color= $_POST['color'];
	$pid= $_POST['pid'];
	$timezone = $_POST['timezone'];
	if(true) {
        $con = mysqli_connect('localhost','root','admin','mbaDB_dev');
        // Check connection
        if (!$con) {
            die('Could not connect: ' . mysqli_error($con));
        }
	echo 'BrainID: '.$brain_id.'<br>';
	echo 'Label: '.$label.'<br>';
	echo 'Color: '.$color.'<br>';
	echo 'Pid: '.$pid.'<br>';
	$timestamp = date('Y-m-d H:i:s');
	$write_date = date('Y-m-d');

	$sql="SELECT seriesbrowser_section.id FROM seriesbrowser_section WHERE seriesbrowser_section.jp2Path = '$pid'";
        if ($result = mysqli_query($con, $sql)) {
           while($row = mysqli_fetch_array($result)) {
                $section_id = $row['id'];
            }
        }
	echo 'SectionID: '.$section_id.'<br>';

        $sql2 = "INSERT INTO seriesbrowser_userannotation (user_id, brain_id, section_id, label, pid, color, first_name, email, user_name, start_time, location, comment, write_date, status) VALUES ($user->ID, $brain_id, $section_id, '$label', '$pid', '$color', '$user->user_firstname', '$user->user_email', '$user->user_login', '$timestamp', '$timezone', '', '$write_date', 'Available')";
        
	echo 'SQL Query: '.$sql2.'<br>';

	if ($con->query($sql2) === TRUE) {
           echo "user annotation record inserted";
        } else {
           echo "failed". "<br>". $con->error;
        }
	$con->close();
    }
?>

<?php
	header("Cache-Control: no-cache, must-revalidate");
	header("Expires: Sat, 26 Jul 1997 05:00:00 GMT");
	require_once('../wp-load.php');
	require_once("../mamo/getsession.php");
	login();
	$user = wp_get_current_user();
	if ($user->user_firstname !=''){
		echo 'Welcome Back - '.$user->user_firstname . " " . $user->user_lastname;
	}
?>
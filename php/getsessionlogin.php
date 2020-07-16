<?php
/*** PREVENT THE PAGE FROM BEING CACHED BY THE WEB BROWSER ***/header("Cache-Control: no-cache, must-revalidate");
   header("Expires: Sat, 26 Jul 1997 05:00:00 GMT");
   require_once('../wp-load.php');
   require_once("../mamo/getsession.php");

   /*** LOG OUT CURRENT USER ***/if($_GET['logout'] == 'true')
      wp_logout();

   /*** IF THE FORM HAS BEEN SUBMITTED, ATTEMPT AUTHENTICATION ***/if(count($_POST) > 0)
      authenticate();

?>
<!DOCTYPE html>
<html lang="en">
<head>
   <title>Control Panel</title>
</head>
<body>
<form action="login.php" method="post">
   <?php
   if(count($_POST) > 0)
      echo "<p>Invalid user name or password.</p>";
   ?>
   <input type="text" autocomplete="off" placeholder="Username" name="username"/>
   <input type="text" autocomplete="off" placeholder="Password" name="password"/>
   <label><input type="checkbox" name="remember" value="1" />Remember me</label>
   <button type="submit" value="Submit">Submit</button>
</form>
</body>
</html>
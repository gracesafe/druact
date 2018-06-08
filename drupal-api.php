<?php

/**
 * Database access for Drupal and existing data imported from Drupal 6
 *  content_type_document
 *  content_type_event_for_timeline 
 *  files
 *  group__field_description + related group/user content and membership
 * 
 */
//var_dump($_SERVER);
//var_dump($_REQUEST);
//var_dump($_SESSION);
//echo "Drupal API for GRiST";

//$uid = $_REQUEST['uid'];
//$groupid = $_REQUEST['group_id'];
//$type =  $_REQUEST['type'];
//$debug =  $_REQUEST['debug'];
$debug =  false;
    $username = "drupaluser";
    $password = "3A5-gr15t04_drupal8";
    $hostname = "localhost";
    $dbname = "grist_new";
    $db_drupal6 = "grist";

    $type = 'doc';
 if(isset($_REQUEST['type'])) {
    $type = $_REQUEST['type'];
 }   

    $uid = 'uid';
 if(isset($_REQUEST['uid'])) {
    $uid = $_REQUEST['uid'];
 }  


    switch ($type){
        case "doc":
$sql = "select * from node inner join content_type_document on content_type_document.vid = node.vid";
	break;

        case "news":
	break;

        case "timeline":
        $sql = " select * from grist.content_type_event_for_timeline";
	break;

        case "group":
        $sql = "select  group__field_body.entity_id, field_description_value, field_body_value from org_launch_patients inner join  group__field_description on  org_launch_patients.group_nid =  group__field_description.entity_id left outer join group__field_body on group__field_description.entity_id =  group__field_body.entity_id where CONVERT(org_launch_patients.patient_indentifier, UNSIGNED INTEGER)=$uid";
//	var_dump($sql);
	break;


    }

////////// start of functionql);


    $conn = new mysqli('localhost', $username, $password, $db_drupal6);
    if ($conn->connect_error) {
        var_dump("Error connecting to database");
    }
    $data = [];
    $result = $conn->query($sql);
    if ($result->num_rows > 0) {
      while($row = $result->fetch_assoc()) {
//reject overly long 2 byte sequences, as well as characters above U+10000 and replace with ?
$row = preg_replace('/[\x00-\x08\x10\x0B\x0C\x0E-\x19\x7F]'. '|[\x00-\x7F][\x80-\xBF]+'. '|([\xC0\xC1]|[\xF0-\xFF])[\x80-\xBF]*'.'|[\xC2-\xDF]((?![\x80-\xBF])|[\x80-\xBF]{2,})'. '|[\xE0-\xEF](([\x80-\xBF](?![\x80-\xBF]))|(?![\x80-\xBF]{2})|[\x80-\xBF]{3,})/S', '?', $row );
 
//reject overly long 3 byte sequences and UTF-16 surrogates and replace with ?
$row = preg_replace('/\xE0[\x80-\x9F][\x80-\xBF]'.
 '|\xED[\xA0-\xBF][\x80-\xBF]/S','?', $row );
            $data[] = $row;
        }
    }
//var_dump($data);

header('Content-Type: application/json');
        $sql = " select * from grist.content_type_event_for_timeline";
//$json  = json_encode($data);
echo json_encode($data);
//$json  = json_encode($data);
$error = json_last_error();
if (isset($error)){
//echo "encode error";
//var_dump($error);
}
 //   echo $json;
//    echo $data;
    
/** 

if (isset($type)){
    switch ($type){
        case "groups":
        $conn = getDBConnection(false);
        $sql = "select  group__field_body.entity_id, field_description_value, field_body_value from group__field_description left outer join group__field_body on group__field_description.entity_id =  group__field_body.entity_id";
        break;

        case "doc":
        $conn = getDBConnection(false);
        $sql = "select * from content_type_document";
        break;

        case "timeline":
        $conn = getDBConnection(false);
        $sql = " select * from grist.content_type_event_for_timeline";
        break;

        default: // group content for loggedin user
        $conn = getDBConnection(true);
        $sql = "select  group__field_body.entity_id, field_description_value, field_body_value from org_launch_patients inner join  group__field_description on  org_launch_patients.group_nid =  group__field_description.entity_id left outer join group__field_body on group__field_description.entity_id =  group__field_body.entity_id where CONVERT(org_launch_patients.patient_indentifier, UNSIGNED INTEGER)=$uid";
    }
    returnJson($conn, $sql, $debug);
}
*/

function getDBConnection($drupal = true){
    $username = "drupaluser";
    $password = "3A5-gr15t04_drupal8";
    $hostname = "localhost";
    $dbname = "grist_new";
    $db_drupal6 = "grist";

    if ($drupal) {
        // Create connection
        $conn = new mysqli('localhost', $username, $password, $dbname);
    } else {
        // Create connection
        $conn = new mysqli('localhost', $username, $password, $db_drupal6);
    }

    // Check connection
    if ($conn->connect_error) {
        returnJson("Error connecting to database");
    } else {
	return $conn;
    }
}

function returnJson($conn, $sql, $debug =false){
    $data = [];
    $result = $conn->query($sql);
    
    if ($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $data[] = $row;
        }
    }
    
//    if ($debug){
//        var_dump($sql);
//        var_dump($conn);
//        var_dump($data);
//    } 
    header('Content-Type: application/json');
    echo json_encode($data);
    
}




<?php

/**
 * Database access for Drupal and existing data imported from Drupal 6
 *  content_type_document
 *  content_type_event_for_timeline
 *  files
 *  group__field_description + related group/user content and membership
 *
 */
//var_dump($_SERVER);
//var_dump($_SESSION);
//echo "Drupal API for GRiST";

//$uid = $_REQUEST['uid'];
//$groupid = $_REQUEST['group_id'];
//$type =  $_REQUEST['type'];
//$debug =  $_REQUEST['debug'];
$debug =  false;
    $username = "drupaluser";
    $password = "3A5-gr15t04_drupal8";
    $hostname = "localhost";
    $dbname = "grist_new";
    $db_drupal6 = "grist";

    $conn = new mysqli('localhost', $username, $password, $db_drupal6);
    if ($conn->connect_error) {
        var_dump("Error connecting to database");
    }
$sql = "select * from node inner join content_type_document on content_type_document.vid = node.vid";
//    $sql = "select vid , nid , field_document_type_value , field_document_author_value , field_document_description_value, field_document_description_format  from content_type_document ";
    $data = [];
    $result = $conn->query($sql);
    if ($result->num_rows > 0) {
      while($row = $result->fetch_assoc()) {
//reject overly long 2 byte sequences, as well as characters above U+10000 and replace with ?
$row = preg_replace('/[\x00-\x08\x10\x0B\x0C\x0E-\x19\x7F]'.
 '|[\x00-\x7F][\x80-\xBF]+'.
 '|([\xC0\xC1]|[\xF0-\xFF])[\x80-\xBF]*'.
 '|[\xC2-\xDF]((?![\x80-\xBF])|[\x80-\xBF]{2,})'.
 '|[\xE0-\xEF](([\x80-\xBF](?![\x80-\xBF]))|(?![\x80-\xBF]{2})|[\x80-\xBF]{3,})/S',
 '?', $row );

//reject overly long 3 byte sequences and UTF-16 surrogates and replace with ?
$row = preg_replace('/\xE0[\x80-\x9F][\x80-\xBF]'.
 '|\xED[\xA0-\xBF][\x80-\xBF]/S','?', $row );
            $data[] = $row;
        }
    }
//var_dump($data);

header('Content-Type: application/json');
//$json  = json_encode($data);
echo json_encode($data);
//$json  = json_encode($data);
$error = json_last_error();
if (isset($error)){
//echo "encode error";
//var_dump($error);
}
 //   echo $json;
//    echo $data;

/**

if (isset($type)){
    switch ($type){
        case "groups":
        $conn = getDBConnection(false);
        $sql = "select  group__field_body.entity_id, field_description_value, field_body_value from group__field_description left outer join group__field_body on group__field_description.entity_id =  group__field_body.entity_id";
        break;

        case "doc":
        $conn = getDBConnection(false);
        $sql = "select * from content_type_document";
        break;

        case "timeline":
        $conn = getDBConnection(false);
        $sql = " select * from content_type_event_for_timeline";
        break;

        default: // group content for loggedin user
        $conn = getDBConnection(true);
        $sql = "select  group__field_body.entity_id, field_description_value, field_body_value from org_launch_patients inner join  group__field_description on  org_launch_patients.group_nid =  group__field_description.entity_id left outer join group__field_body on group__field_description.entity_id =  group__field_body.entity_id where CONVERT(org_launch_patients.patient_indentifier, UNSIGNED INTEGER)=$uid";
    }
    returnJson($conn, $sql, $debug);
}
*/

function getDBConnection($drupal = true){
    $username = "drupaluser";
    $password = "3A5-gr15t04_drupal8";
    $hostname = "localhost";
    $dbname = "grist_new";
    $db_drupal6 = "grist";

    if ($drupal) {
        // Create connection
        $conn = new mysqli('localhost', $username, $password, $dbname);
    } else {
        // Create connection
        $conn = new mysqli('localhost', $username, $password, $db_drupal6);
    }

    // Check connection
    if ($conn->connect_error) {
        returnJson("Error connecting to database");
    } else {
        return $conn;
    }
}

function returnJson($conn, $sql, $debug =false){
    $data = [];
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $data[] = $row;
        }
    }

//    if ($debug){
//        var_dump($sql);
//        var_dump($conn);
//        var_dump($data);
//    }
    header('Content-Type: application/json');
    echo json_encode($data);

}
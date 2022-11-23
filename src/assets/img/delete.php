<?php 

if(isset($_GET["key"]) && $_GET["key"] == "AIzaSyDCbhaDnOD2_zb5TXc2Eqwbc8AYBnjFZyI"){

	header('Access-Control-Allow-Origin: *');
	header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");
	header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
	header('content-type: application/json; charset=utf-8');

	if(isset($_POST["fileDelete"])){ 

		/*=============================================
		Eliminamos el archivo
		=============================================*/

		unlink($_POST["fileDelete"]);

		/*=============================================
		Retornar el estado 200
		=============================================*/
		
		$json = array(

		 	'status' => 200
		
		);

		echo json_encode($json, true);

		return;

	}

}

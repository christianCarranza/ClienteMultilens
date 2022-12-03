<?php 

require __DIR__  . '/vendor/autoload.php';

/*=============================================
Dominio
=============================================*/

$domain = "http://proyectotesis.test/ClienteMultilens/src/"; //YOUR DOMAIN

/*=============================================
Credenciales
=============================================*/

$sandbox = true;

if($sandbox){

  $public_key = "TEST-88d9d308-983c-4cbd-b62d-76f079c6ebe3";
  $access_token = "TEST-6787605783967155-112201-927cac55773051c0e03fd2e98b53853a-1235472589";

}else{

  $public_key = "";
  $access_token = "";

}

if(isset($_GET["x"]) ){
  setcookie("_x", $_GET["cx"], time() + 60*60*24);
  setcookie("_p", $_GET["cp"], time() + 60*60*24);
  setcookie("_e", $_GET["ce"], time() + 60*60*24);
}

/*=============================================
Petición a la API de Cambio de Moneda
=============================================*/
// $curl = curl_init();

// curl_setopt_array($curl, array(
//   CURLOPT_URL => "http://free.currconv.com/api/v7/convert?q=USD_COP&compact=ultra&apiKey=[YOUR_API_KEY]",
//   CURLOPT_RETURNTRANSFER => true,
//   CURLOPT_ENCODING => "",
//   CURLOPT_MAXREDIRS => 10,
//   CURLOPT_TIMEOUT => 0,
//   CURLOPT_FOLLOWLOCATION => true,
//   CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
//   CURLOPT_CUSTOMREQUEST => "GET",
//   CURLOPT_HTTPHEADER => array(
//     "Cookie: __cfduid=d33a8b671902df6f1dfc8eb1d98756da61592509616"
//   ),
// ));

// $response = curl_exec($curl);

// curl_close($curl);

// $jsonResponse = json_decode($response, true);

/*=============================================
Formulario de MercadoPago
=============================================*/



if(isset($_GET["x"]) && $_GET["x"] == md5(base64_decode($_GET["cx"]))){
  
  echo '
  <div style="width:100%; height:100vh; position:fixed; background:url(mp-bg.jpg); background-repeat:no-repeat; background-size:cover">

  <div style="text-align:center; position:absolute; top:45vh; right:120px">

  <form action="'.$domain.'assets/mercadopago/index.php" method="POST">
    <script
      src="https://www.mercadopago.com.pe/integrations/v1/web-tokenize-checkout.js"
      data-public-key="'.$public_key.'"
      data-button-label="Siguiente"
      data-summary-product-label="'.$_GET["cp"].'"
      data-transaction-amount="'.base64_decode($_GET["cx"]).'">
    </script>
  </form>

  </div>

</div>';

}

/*=============================================
Recibir la respuesta de Mercado Pago
=============================================*/
if(isset($_REQUEST["token"])){

  /*=============================================
  Obtener los datos del comprador
  =============================================*/

  $token = $_REQUEST["token"];
  $payment_method_id = $_REQUEST["payment_method_id"];
  $installments = $_REQUEST["installments"];
  $issuer_id = $_REQUEST["issuer_id"];

  /*=============================================
  Realizar el pago con el SDK de Mercado Pago
  =============================================*/

  MercadoPago\SDK::setAccessToken($access_token);
    //...
    $payment = new MercadoPago\Payment();
    $payment->transaction_amount = base64_decode($_COOKIE["_x"]);
    $payment->token = $token;
    $payment->description = $_COOKIE["_p"];
    $payment->installments = $installments;
    $payment->payment_method_id = $payment_method_id;
    $payment->issuer_id = $issuer_id;
    $payment->payer = array(
    "email" => $_COOKIE["_e"]
    );
    // Guarda y postea el pago
    $payment->save();

    echo $payment->status;
    
    //...
    // Imprime el estado del pago
    if($payment->status == "approved"){


      echo '<script>

      localStorage.setItem("_i", "'.$payment->id.'");
      localStorage.setItem("_k", "'.$public_key.'");
      localStorage.setItem("_a", "'.$access_token.'");

      window.close();

      </script>';

    }

}

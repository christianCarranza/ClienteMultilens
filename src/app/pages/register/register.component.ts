import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth";

import { Capitalize, Sweetalert } from '../../functions';

import { UsersModel } from '../../models/users.model';

import { UsersService } from '../../services/users.service';

declare var jQuery: any;
declare var $: any;

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  user: UsersModel;

  constructor(private usersService: UsersService) {

    this.user = new UsersModel();
  }

  ngOnInit(): void {

    /*=============================================
    Validar formulario de Bootstrap 4
    =============================================*/

    // Disable form submissions if there are invalid fields
    (function () {
      'use strict';
      window.addEventListener('load', function () {
        // Get the forms we want to add validation styles to
        var forms = document.getElementsByClassName('needs-validation');
        // Loop over them and prevent submission
        var validation = Array.prototype.filter.call(forms, function (form) {
          form.addEventListener('submit', function (event: { preventDefault: () => void; stopPropagation: () => void; }) {
            if (form.checkValidity() === false) {
              event.preventDefault();
              event.stopPropagation();
            }
            form.classList.add('was-validated');
          }, false);
        });
      }, false);
    })();

  }


  /*=============================================
  Capitalizar la primera letra de nombre y apellido
  =============================================*/

  capitalize(input: { value: any; }) {

    input.value = Capitalize.fnc(input.value)

  }

  /*=============================================
  Validación de expresión regular del formulario
  =============================================*/
  validate(input: { value: string; }) {

    let pattern;

    if ($(input).attr("name") == "username") {

      pattern = /^[A-Za-z]{2,8}$/;

      input.value = input.value.toLowerCase();

      this.usersService.getFilterData("username", input.value)
        .subscribe(resp => {

          if (Object.keys(resp).length > 0) {

            $(input).parent().addClass('was-validated')

            input.value = "";

            Sweetalert.fnc("error", "Username already exists", null)

            return;

          }

        })

    }

    if ($(input).attr("name") == "password") {

      pattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{4,}$/;

    }

    if (!pattern.test(input.value)) {

      $(input).parent().addClass('was-validated')

      input.value = "";

    }

  }

  /*=============================================
  Envío del formulario
  =============================================*/

  onSubmit(f: NgForm) {

    if (f.invalid) {

      return;

    }

    /*=============================================
    Alerta suave mientras se registra el usuario
    =============================================*/

    Sweetalert.fnc("loading", "Loading...", null)

    /*=============================================
    Registro en Firebase Authentication
    =============================================*/

    this.user.returnSecureToken = true;

    this.usersService.registerAuth(this.user)
      .subscribe(resp => {

        if (resp["email"] == this.user.email) {

          /*=============================================
           Enviar correo de verificación
           =============================================*/

          let body = {

            requestType: "VERIFY_EMAIL",
            idToken: resp["idToken"]

          }

          this.usersService.sendEmailVerificationFnc(body)
            .subscribe(resp => {

              if (resp["email"] == this.user.email) {

                /*=============================================
                Registro en Firebase Database
                =============================================*/

                this.user.displayName = `${this.user.first_name} ${this.user.last_name}`;
                this.user.method = "direct";
                this.user.needConfirm = false;
                this.user.username = this.user.username.toLowerCase();

                this.usersService.registerDatabase(this.user)
                  .subscribe(resp => {

                    Sweetalert.fnc("success", "Confirm your account in your email (check spam)", "login")

                  })

              }

            })

        }

      }, err => {

        Sweetalert.fnc("error", err.error.error.message, null)

      })

  }

  /*=============================================
  Registro con Facebook
  =============================================*/

  facebookRegister() {

    let localUsersService = this.usersService;
    let localUser = this.user;

    // https://firebase.google.com/docs/web/setup
    // Crea una nueva APP en Settings
    // npm install --save firebase
    // Agregar import * as firebase from "firebase/app";
    // import "firebase/auth";

    /*=============================================
    Inicializa Firebase en tu proyecto web
    =============================================*/

    // Your web app's Firebase configuration
    const firebaseConfig = {
      apiKey: "AIzaSyDCbhaDnOD2_zb5TXc2Eqwbc8AYBnjFZyI",
      authDomain: "multi-lens.firebaseapp.com",
      databaseURL: "https://multi-lens-default-rtdb.firebaseio.com",
      projectId: "multi-lens",
      storageBucket: "multi-lens.appspot.com",
      messagingSenderId: "1073333159100",
      appId: "1:1073333159100:web:7aedad4b110da722dd3cb9",
      measurementId: "G-8K3BJ1NPM6"
    };

    // Initialize Firebase
    // firebase.initializeApp(firebaseConfig);
    const app = initializeApp(firebaseConfig);

    //https://firebase.google.com/docs/auth/web/facebook-login

    /*=============================================
    Crea una instancia del objeto proveedor de Facebook
    =============================================*/
    const auth = getAuth();
    const provider = new FacebookAuthProvider();

    /*=============================================
    acceder con una ventana emergente y con certificado SSL (https)
    =============================================*/
    //ng serve --ssl true --ssl-cert "/path/to/file.crt" --ssl-key "/path/to/file.key"

    signInWithPopup(auth, provider)
      .then((result) => {

        registerFirebaseDatabase(result, localUser, localUsersService)

      })
      .catch((error) => {

        var errorMessage = error.message;

        Sweetalert.fnc("error", "Error al registrar cuenta", "register");

      });


    // firebase.auth().signInWithPopup(provider).then(function (result: any) {

    //   registerFirebaseDatabase(result, localUser, localUsersService)

    // }).catch(function (error: { message: any; }) {

    //   var errorMessage = error.message;

    //   Sweetalert.fnc("error", errorMessage, "register");

    // });

    /*=============================================
  Registramos al usuario en Firebase Database
  =============================================*/

    function registerFirebaseDatabase(result: { user: any; }, localUser: UsersModel, localUsersService: UsersService) {

      var user = result.user;

      if (user.P) {

        localUser.displayName = user.displayName;
        localUser.email = user.email;
        localUser.idToken = user.b.b.g;
        localUser.method = "facebook";
        localUser.username = user.email.split('@')[0];
        localUser.picture = user.photoURL;

        /*=============================================
        Evitar que se dupliquen los registros en Firebase Database
        =============================================*/

        localUsersService.getFilterData("email", user.email)
          .subscribe((resp: { [x: string]: { method: any; }; }) => {

            if (Object.keys(resp).length > 0) {

              Sweetalert.fnc("error", `You're already signed in, please login with ${resp[Object.keys(resp)[0]].method} method`, "login")

            } else {

              localUsersService.registerDatabase(localUser)
                .subscribe((resp: { [x: string]: string; }) => {

                  if (resp["name"] != "") {

                    Sweetalert.fnc("success", "Please Login with facebook", "login");

                  }

                })

            }

          })

      }
    }

  }

  /*=============================================
  Registro con Google
  =============================================*/

  googleRegister() {

    let localUsersService = this.usersService;
    let localUser = this.user;

    // https://firebase.google.com/docs/web/setup
    // Crea una nueva APP en Settings
    // npm install --save firebase
    // Agregar import * as firebase from "firebase/app";
    // import "firebase/auth";

    /*=============================================
    Inicializa Firebase en tu proyecto web
    =============================================*/

    // Your web app's Firebase configuration
    const firebaseConfig = {
      apiKey: "AIzaSyDCbhaDnOD2_zb5TXc2Eqwbc8AYBnjFZyI",
      authDomain: "multi-lens.firebaseapp.com",
      databaseURL: "https://multi-lens-default-rtdb.firebaseio.com",
      projectId: "multi-lens",
      storageBucket: "multi-lens.appspot.com",
      messagingSenderId: "1073333159100",
      appId: "1:1073333159100:web:7aedad4b110da722dd3cb9",
      measurementId: "G-8K3BJ1NPM6"
    };

    // Initialize Firebase
    // firebase.initializeApp(firebaseConfig);
    const app = initializeApp(firebaseConfig);

    //https://firebase.google.com/docs/auth/web/google-signin

    /*=============================================
    Crea una instancia del objeto proveedor de Google
    =============================================*/
    const provider = new GoogleAuthProvider();

    // var provider = new firebase.auth.GoogleAuthProvider();

    /*=============================================
    acceder con una ventana emergente 
    =============================================*/
    const auth = getAuth();
    signInWithPopup(auth, provider)
      .then((result) => {
        debugger
        registerFirebaseDatabase(result, localUser, localUsersService)

      }).catch((error) => {

        var errorMessage = error.message;

        Sweetalert.fnc("error", "Error al registrar cuenta", "register");
      });

    // firebase.auth().signInWithPopup(provider).then(function (result: any) {

    //   registerFirebaseDatabase(result, localUser, localUsersService)

    // }).catch(function (error: { message: any; }) {

    //   var errorMessage = error.message;

    //   Sweetalert.fnc("error", errorMessage, "register");

    // });

    /*=============================================
  Registramos al usuario en Firebase Database
  =============================================*/
    function registerFirebaseDatabase(result: { user: any; }, localUser: UsersModel, localUsersService: UsersService) {

      var user = result.user;

      if (user.emailVerified) {

        localUser.displayName = user.displayName;
        localUser.email = user.email;
        localUser.idToken = user.accessToken;
        localUser.method = "google";
        localUser.username = user.email.split('@')[0];
        localUser.picture = user.photoURL;

        /*=============================================
        Evitar que se dupliquen los registros en Firebase Database
        =============================================*/

        localUsersService.getFilterData("email", user.email)
          .subscribe((resp: { [x: string]: { method: any; }; }) => {

            if (Object.keys(resp).length > 0) {

              Sweetalert.fnc("error", `Ya se encuentra registrado, Por favor inicie sesion con el metodo ${resp[Object.keys(resp)[0]].method} `, "login")

            } else {

              localUsersService.registerDatabase(localUser)
                .subscribe((resp: { [x: string]: string; }) => {

                  if (resp["name"] != "") {

                    Sweetalert.fnc("success", "Por favor inicie sesión con google", "login");

                  }

                })

            }

          })

      }

    }

  }

}

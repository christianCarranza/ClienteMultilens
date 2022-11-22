import { Component, OnInit, Input, OnDestroy} from '@angular/core';
import { NgForm } from '@angular/forms';

import { Path } from '../../../../config';

import  {Sweetalert, Rating} from '../../../../functions';

import { DisputesModel } from '../../../../models/disputes.model';

import { OrdersService } from '../../../../services/orders.service';
import { StoresService } from '../../../../services/stores.service';
import { UsersService } from '../../../../services/users.service';
import { DisputesService } from '../../../../services/disputes.service';
import { ProductsService } from '../../../../services/products.service';

import { Subject } from 'rxjs';

declare var jQuery:any;
declare var $:any;

@Component({
  selector: 'app-account-my-shopping',
  templateUrl: './account-my-shopping.component.html',
  styleUrls: ['./account-my-shopping.component.css']
})
export class AccountMyShoppingComponent implements OnInit, OnDestroy {

	@Input() childItem:any;

	path:string = Path.url;
	myShopping: any[] = [];
	process:any[] = [];
	is_vendor:boolean = false;

	dispute: DisputesModel;
	id_order:any[] = [];

	disputes:any[]=[];

	username:string;
	picture:string;
	method:string;
	idProduct:string;

	reviews:any[] = [];
	render:boolean = false;

	dtOptions: DataTables.Settings = {};
	dtTrigger: Subject<any> = new Subject();

	constructor(private ordersService: OrdersService,
				private storesService:StoresService,
				private disputesService:DisputesService,
				private usersService:UsersService,
				private productsService:ProductsService) {

		this.dispute = new DisputesModel();
 	
 	}

	ngOnInit(): void {

		/*=============================================
	  	Agregamos opciones a DataTable
	  	=============================================*/

	  	this.dtOptions = {
	  		pagingType: 'full_numbers',
	  		processing: true,
	  		order:[[0, 'desc']]
	  	}

	  	/*=============================================
		Validamos si el usuario ya tiene una tienda habilitada
		=============================================*/

      	this.storesService.getFilterData("username", this.childItem)
      	.subscribe(resp=>{

	        if(Object.keys(resp).length > 0){

	          this.is_vendor = true;

	        }

	    })

	  	/*=============================================
  		Traemos las órdenes de compras de este usuario
  		=============================================*/
  		this.ordersService.getFilterData("user", this.childItem)
  		.subscribe(resp=>{

  			let load = 0;
  			
  			for(const i in resp){

  				load++

  				this.myShopping.push(resp[i]);
  				this.process.push(JSON.parse(resp[i]["process"]));
  				this.id_order.push(i);

  				/*=============================================
		  		Traemos las disputas
		  		=============================================*/

		  		this.id_order.forEach(order=>{

		  			this.disputesService.getFilterData("order", order)
		  			.subscribe(resp=>{

		  				if(Object.keys(resp).length > 0){	

		  					let count = 0;	

			  				for(const i in resp){

			  					count++;

			  					this.storesService.getFilterData("store", resp[i].receiver)
			  					.subscribe(resp1=>{

			  						for(const f in resp1){

			  							resp[i].store = resp1[f];
			  						}


			  					})

			  					this.usersService.getFilterData("username", resp[i].transmitter)
			  					.subscribe(resp1=>{

			  						for(const f in resp1){

			  							resp[i].user = resp1[f];
			  						}


			  					})

			  					let localDisputes = this.disputes;

			  					setTimeout(function(){

			  						localDisputes.push(resp[i]);

			  					},count*1000)

				  				
				  			}

			  			}
					

					})


		  		})


		  		/*=============================================
		  		Traemos las reseñas del producto
		  		=============================================*/

		  		this.productsService.getFilterDataMyStore("url", resp[i].url)
		  		.subscribe(resp=>{

		  			for(const i in resp){
						
						this.reviews.push(JSON.parse(resp[i].reviews));

					}
					

				})
  				


  				
  			}

  			/*=============================================
			Pintar el render en DataTable
			=============================================*/	

  			if(load == this.myShopping.length){

  				this.dtTrigger.next();

  			}

  			Rating.fnc();

  		})
	}

	/*=============================================
	Función nueva disputa
	=============================================*/
	newDispute(id_order, store, user){
		
		this.dispute.order = id_order;
		this.dispute.receiver = store;
		this.dispute.transmitter = user;
		this.dispute.date_dispute = new Date();

		/*=============================================
        Abrir la ventana modal
        =============================================*/  
        $("#newDispute").modal() 

	}

	/*=============================================
	Formulario disputas
	=============================================*/

	onSubmit(f: NgForm){

		/*=============================================
  		Validamos formulario para evitar campos vacíos
  		=============================================*/

		if(f.invalid ){

			Sweetalert.fnc("error", "Invalid Request", null);

			return;

		}
		
		/*=============================================
        Crear una disputa en la BD
        =============================================*/

        this.disputesService.registerDatabase(this.dispute, localStorage.getItem("idToken"))
        .subscribe(resp=>{

			if(resp["name"] != ""){

				 Sweetalert.fnc("success", "The dispute was created successfully", "account/my-shopping");  
			}

		}, err =>{

            Sweetalert.fnc("error", err.error.error.message, null)

        })

	}

	/*=============================================
	Función nueva reseña
	=============================================*/

	newReview(user, url){

		/*=============================================
		Almaceno el usuario
		=============================================*/

		this.username = user;

		/*=============================================
		Traemos el producto para capturar su ID
		=============================================*/

		this.usersService.getFilterData("username", user)
		.subscribe(resp=>{ 
			
			for(const i in resp){

				this.picture = resp[i].picture;
				this.method = resp[i].method;	
			}

		});

		/*=============================================
		Traemos el producto para capturar su ID
		=============================================*/

		this.productsService.getFilterDataMyStore("url", url)
		.subscribe(resp=>{ 
			
			this.idProduct = Object.keys(resp)[0];

		});

		/*=============================================
        Abrir la ventana modal
        =============================================*/  

        $("#newReview").modal() 


	}

	/*=============================================
	Enviar nueva reseña
	=============================================*/

	submitReview(comment, review){

		/*=============================================
		Validar que la reseña no venga vacía
		=============================================*/

		if(review.value == "" || comment.value == ""){

			Sweetalert.fnc("error", "Invalid Request", null);

			return;

		}

		/*=============================================
		Crear el cuerpo de la reseña
		=============================================*/

		let body = [{	

			"review":review.value,
			"comment":comment.value,
			"name":this.username,
			"image":this.picture,
			"method":this.method

		}];

		/*=============================================
		Traer las reseñas del producto
		=============================================*/

		this.productsService.getUniqueData(this.idProduct)
		.subscribe(resp=>{
			
			let reviews = JSON.parse(resp["reviews"]);

			/*=============================================
			Eliminar la reseña creada por el usuario anteriormente
			=============================================*/

			reviews.forEach((review,index)=>{	

				if(review.name == this.username){

					reviews.splice(index, 1);

				}

			})

			/*=============================================
			Actualizar la información de las reseñas
			=============================================*/

			reviews.forEach(review=>{	

				body.push(review);				

			})

			/*=============================================
			Actualizar las reseñas del producto
			=============================================*/

			let value = {

				"reviews":JSON.stringify(body)
			}

			this.productsService.patchData(this.idProduct, value)
			.subscribe(resp=>{

				if(resp["reviews"] != ""){

				 	Sweetalert.fnc("success", "The review was created successfully", "account/my-shopping");  
				}

			}, err =>{

	            Sweetalert.fnc("error", err.error.error.message, null)

	        })

		})

	}

	callback(iReview){

		if(!this.render){

			this.render = true;

			setTimeout(function(){

				let reviews = $("[reviews]");

				for(let i = 0; i < reviews.length; i++){

				  	for(let r = 0; r < 5; r++){

			        	$(reviews[i]).append(`
							
							<option value="2">${r+1}</option>

			        	`)

			        	if($(reviews[i]).attr("reviews") == (r+1)){

			        		$(reviews[i]).children("option").val(1)
			        	}
			        }

			    }

			    Rating.fnc();

			},100*(iReview+1))
		}

	}

	/*=============================================
	Destruímos el trigger de angular
	=============================================*/

	ngOnDestroy():void{

		this.dtTrigger.unsubscribe();
	}

}

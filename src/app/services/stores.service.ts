import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Api } from '../config';

import { StoresModel } from '../models/stores.model';


@Injectable({
  providedIn: 'root'
})

export class StoresService {

  	private api:string = Api.url;

  	constructor(private http:HttpClient) { }

  	getData(){

		return this.http.get(`${this.api}stores.json`);

	}

	getFilterData(orderBy:string, equalTo:string){

		return this.http.get(`${this.api}stores.json?orderBy="${orderBy}"&equalTo="${equalTo}"&print=pretty`);

	}


	/*=============================================
	Registro en Firebase Database
	=============================================*/

	registerDatabase(body: StoresModel, idToken:string){

		return this.http.post(`${this.api}/stores.json?auth=${idToken}`, body);

	}

	/*=============================================
	Actualizar en Firebase Database
	=============================================*/

	patchDataAuth(id:string, value:StoresModel, idToken:string){

		return this.http.patch(`${this.api}stores/${id}.json?auth=${idToken}`,value);

	}



}

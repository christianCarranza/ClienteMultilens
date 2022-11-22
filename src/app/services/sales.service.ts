import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Api } from '../config';

@Injectable({
  providedIn: 'root'
})
export class SalesService {

	private api:string = Api.url;

  	constructor(private http:HttpClient) { }

	getData(){

		return this.http.get(`${this.api}sales.json`);

	}

	/*=============================================
	Registro en Firebase Database
	=============================================*/

	registerDatabase(body:object, idToken:string){

		return this.http.post(`${this.api}/sales.json?auth=${idToken}`, body);

	}

	/*=============================================
	Filtrado de datos
	=============================================*/

	getFilterData(orderBy:string, equalTo:string){

		return this.http.get(`${this.api}sales.json?orderBy="${orderBy}"&equalTo="${equalTo}"&print=pretty`);

	}

	/*=============================================
	Actualizar en Firebase Database
	=============================================*/

	patchDataAuth(id:string, value:object, idToken:string){

		return this.http.patch(`${this.api}sales/${id}.json?auth=${idToken}`,value);

	}
}

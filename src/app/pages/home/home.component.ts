import { Component, OnInit } from '@angular/core';
import { initializeApp } from "firebase/app";
import { getAnalytics, logEvent } from "firebase/analytics";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
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
		initializeApp(firebaseConfig);
    const analytics = getAnalytics();
    logEvent(analytics, 'notification_received');

    logEvent(analytics, 'screen_view');
  }

}

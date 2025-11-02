import { Routes } from '@angular/router';
import {AppComponent} from "./app.component";
import {DashboardComponent} from "./components/dashboard.component";
import {LoginComponent} from "./components/login.component";
import {RestapiComponent} from "./components-api/restapi.component";


/**
 * 
 */
export const routes: Routes = [
  // { path: 'app-root', redirectTo: '/login', pathMatch: 'full' }, // Default route
  { path: 'app-root', component: AppComponent, // Parent component
    children: [
      { path: 'dashboard', component: DashboardComponent }, // Child route
      { path: 'login', component: LoginComponent }
    ],
  },
  { path: 'restapi', component: RestapiComponent },
];

import { Routes } from '@angular/router';
import { loadRemoteModule } from '@angular-architects/native-federation';
import { HomeComponent } from './pages/home/home.component';

export const routes: Routes = [
    { 
        path: '', 
        component: HomeComponent 
    },
    {
        path: 'auth',
        loadComponent: () =>
            loadRemoteModule('auth', './Component').then((m) => m.AppComponent),
    },
    {
        path: 'worktime',
        loadComponent: () =>
            loadRemoteModule('worktime', './Component').then((m) => m.AppComponent),
    },
    {
        path: 'weekly-summary',
        loadComponent: () =>
            loadRemoteModule('weeklySummary', './Component').then((m) => m.AppComponent),
    },
    {
        path: 'calendar',
        loadComponent: () =>
            loadRemoteModule('calendar', './Component').then((m) => m.AppComponent),
    },
    {
        path: '**',
        redirectTo: ''
    },
];

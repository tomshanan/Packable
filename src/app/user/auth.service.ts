import * as firebase from 'firebase';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import * as fromApp from '../shared/app.reducers'
import * as authActions from './store/auth.actions'
import { Logout } from './store/auth.actions';
import { Subject, Subscription } from 'rxjs';

@Injectable()
export class AuthService {
    token: string;
    isAuthenticated: boolean

    constructor(
        private store:Store<fromApp.appState>
    ){
        this.store.select('auth').subscribe(state =>{
            this.isAuthenticated = state.authenticated
            this.token = state.token
        })
        
    }

    logout(){
        firebase.auth().signOut()
        this.store.dispatch(new authActions.Logout());
    }
}
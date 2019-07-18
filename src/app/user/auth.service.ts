import * as firebase from 'firebase';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import * as fromApp from '../shared/app.reducers'
import * as authActions from './store/auth.actions'
import { Logout } from './store/auth.actions';
import { Subject, Subscription, BehaviorSubject } from 'rxjs';

@Injectable()
export class AuthService {
    token: string;
    isAuthenticated: boolean
    isAuthenticated$ = new BehaviorSubject<boolean>(false)
    authenticating$ = new BehaviorSubject<boolean>(false)
    constructor(
        private store:Store<fromApp.appState>
    ){
        this.store.select('auth').subscribe(state =>{
            this.isAuthenticated = state.authenticated
            this.isAuthenticated$.next(state.authenticated)
            this.authenticating$.next(state.authenticated)
            this.token = state.token
        })
        
    }

    logout(){
        firebase.auth().signOut()
        this.store.dispatch(new authActions.Logout());
    }
}
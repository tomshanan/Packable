import * as firebase from 'firebase/app';
import 'firebase/auth'
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import * as fromApp from '../shared/app.reducers'
import * as authActions from './store/auth.actions'
import { firebaseSettings } from '@app/user/firebase-settings.object';
import { Logout } from './store/auth.actions';
import { Subject, Subscription, BehaviorSubject } from 'rxjs';
import { ActivatedRouteSnapshot } from '@angular/router';

@Injectable()
export class AuthService {
    token: string;
    isAuthenticated: boolean
    isAuthenticated$ = new BehaviorSubject<boolean>(false)
    authenticating$ = new BehaviorSubject<boolean>(true)
    user: firebase.User;
    routeAfterAuth: ActivatedRouteSnapshot;

    constructor(
        private store: Store<fromApp.appState>
    ) {
        this.store.select('auth').subscribe(state => {
            this.isAuthenticated = state.authenticated
            this.isAuthenticated$.next(state.authenticated)
            this.authenticating$.next(state.loading)
            this.token = state.token
        })

        firebase.initializeApp(firebaseSettings)
        console.log(`firebase.initializeApp`)
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                user.getIdToken().then((token) => {
                    this.store.dispatch(new authActions.Login())
                    this.store.dispatch(new authActions.SetToken(token))
                })
            }
            this.user = user
        });
    }
    tryLogin(email:string,password){
        this.store.dispatch(new authActions.TryLogin({email:email, password:password}))
      }
    logout() {
        firebase.auth().signOut()
        this.store.dispatch(new authActions.Logout());
    }

    requestResetPassword(email: string): Promise<void>{
        let auth = firebase.auth();
        return auth.sendPasswordResetEmail(email)
    }
    verifyPasswordResetCode(code: string): Promise<string> {
        let auth = firebase.auth();
        return auth.verifyPasswordResetCode(code)
    }
    resetPasswordWithActionhCode    (actionCode: string, newPassword: string): Promise<void>{
        let auth = firebase.auth();
        return auth.confirmPasswordReset(actionCode, newPassword)
    }
    setPassword(email:string,oldPassword:string ,newPassword: string){
        var credential = firebase.auth.EmailAuthProvider.credential(
            email, 
            oldPassword
        )
        return this.user.reauthenticateWithCredential(credential).then(()=>{
            this.user.updatePassword(newPassword)
        }) 
    }
}
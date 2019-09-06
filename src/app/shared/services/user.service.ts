import { Injectable } from "@angular/core";
import { Store } from "@ngrx/store";
import * as fromApp from '../app.reducers'
import { Observable } from 'rxjs';
import { AuthService } from '../../user/auth.service';
import {State as UserState, UserSettings, userPermissions }from '@app/user/store/userState.model'
import * as firebase from 'firebase/app';
import * as  userActions from '../../user/store/user.actions';



@Injectable({providedIn:'root'})
export class UserService {
    public userState$: Observable<UserState>
    private _userSettings: UserSettings
    private _permissions: userPermissions
    private _state: UserState
    
    public get state(): UserState { return this._state}
    public get settings(): UserSettings { return this._userSettings}
    public get permissions(): userPermissions { return this._permissions}
    public get id(): string { return firebase.auth().currentUser.uid}
    public get email(): string { return firebase.auth().currentUser.email}
    public get currentUser(): firebase.User { return firebase.auth().currentUser}
    
    constructor(
        private store:Store<fromApp.appState>,
    ){
        this.userState$ = this.store.select('user');
        this.userState$.subscribe(userState =>{
            this._state = userState;
            this._userSettings = userState.settings;
            this._permissions = userState.permissions;
        })
    }
    changeAlias(alias:string){
        const newSettings = {...this.settings}
        newSettings.alias = alias
        this.store.dispatch(new userActions.setUserSettings(newSettings))
    }


}
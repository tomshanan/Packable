import { Injectable } from "@angular/core";
import { Store } from "@ngrx/store";
import * as fromApp from '../app.reducers'
import { Observable } from 'rxjs';
import { AuthService } from '../../user/auth.service';
import {State as UserState, UserSettings, userPermissions }from '@app/user/store/userState.model'
import * as firebase from 'firebase';



@Injectable({providedIn:'root'})
export class UserService {
    public userState_obs: Observable<UserState>
    private _userSttings: UserSettings
    private _permissions: userPermissions
    private _state: UserState
    public get state(): UserState { return this._state}
    public get settings(): UserSettings { return this._userSttings}
    public get permissions(): userPermissions { return this._permissions}
    public get id(): string { return firebase.auth().currentUser.uid}
    
    constructor(
        private store:Store<fromApp.appState>,
    ){
        this.userState_obs = this.store.select('user');
        this.userState_obs.subscribe(userState =>{
            this._state = userState;
            this._userSttings = userState.settings;
            this._permissions = userState.permissions;
        })
    }

}
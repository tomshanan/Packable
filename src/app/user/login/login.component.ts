import { Component, OnInit, EventEmitter, Output, OnDestroy, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import * as fromStore from '../../shared/app.reducers';
import { Store } from '@ngrx/store';
import * as authActions from '../store/auth.actions'
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
  
  loginForm: FormGroup;
  loading: boolean = false;
  error:string = null;
  state_sub: Subscription;

  @Output('onSuccess') onSuccess = new EventEmitter<void>();
  @Input() email: string = '';
  @Output() emailChange = new EventEmitter<string>();
 
   constructor(
     private fb:FormBuilder,
     private authService:AuthService,
     private store:Store<fromStore.appState>
   ) { 
     
   }
 
   onSubmit(){
     if(this.loginForm.valid){
      let formValues = this.loginForm.value
      this.store.dispatch(new authActions.TryLogin({email:formValues.email, password:formValues.password}))
     }
   }
   ngOnInit() {
     this.loginForm = this.fb.group({
       email: [this.email,[Validators.required, Validators.email]],
       password: ['',[Validators.required, Validators.minLength(6)]]
     })
     this.state_sub = this.store.select('auth').subscribe(authState =>{
      this.error = authState.error
      this.loading = authState.loading
      if(this.loading){
        this.loginForm.disable();
      } else {
        this.loginForm.enable();
      }
    })
   }
   ngOnDestroy(): void {
    this.emailChange.emit(this.loginForm.get('email').value)
    this.store.dispatch(new authActions.AuthClean())
    this.state_sub.unsubscribe();
  }
}

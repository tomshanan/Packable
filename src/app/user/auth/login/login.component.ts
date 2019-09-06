import { Component, OnInit, EventEmitter, Output, OnDestroy, Input, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../auth.service';
import * as fromStore from '../../../shared/app.reducers';
import { Store } from '@ngrx/store';
import * as authActions from '../../store/auth.actions'
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material';
import { take } from 'rxjs/operators';
import { ForgotPasswordDialogComponent } from './forgot-password-dialog/forgot-password-dialog.component';
import { RecaptchaComponent } from 'ng-recaptcha';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
  
  loginForm: FormGroup;
  loading: boolean = false;
  error:string = null;
  msg:string = null;
  state_sub: Subscription;

  @Output('onSuccess') onSuccess = new EventEmitter<void>();
  @Input() email: string = '';
  @Output() emailChange = new EventEmitter<string>();
  @ViewChild('captchaRef') captchaRef: RecaptchaComponent;

   constructor(
     private fb:FormBuilder,
     private authService:AuthService,
     private store:Store<fromStore.appState>,
     private dialog: MatDialog,
   ) { 
     
   }
 
   onSubmit(){
     this.error = null;
     this.msg = null;
     if(this.loginForm.valid){
      let formValues = this.loginForm.value
      this.authService.tryLogin(formValues.email, formValues.password)
     }
   }
   ngOnInit() {
     this.loginForm = this.fb.group({
       email: [this.email,[Validators.required, Validators.email]],
       password: ['',[Validators.required, Validators.minLength(8)]]
     })
     this.state_sub = this.store.select('auth').subscribe(authState =>{
      this.error = authState.error
      this.loading = authState.loading
      if(this.loading){
        this.loginForm.disable();
      } else if(this.error){
        this.loginForm.enable();
        if(this.captchaRef){
          this.captchaRef.reset()
        }
      } 
      if(authState.authenticated){
        this.onSuccess.emit()
      }
    })
   }
   ngOnDestroy(): void {
    this.emailChange.emit(this.loginForm.get('email').value)
    this.store.dispatch(new authActions.AuthClean())
    this.state_sub.unsubscribe();
  }

  requestNewPassword(){
    let confirmEmailDialog = this.dialog.open(ForgotPasswordDialogComponent, {
      data: this.loginForm.get('email').value
    })
    confirmEmailDialog.afterClosed().pipe(take(1)).subscribe(email=>{
      if(email){
        this.authService.requestResetPassword(email).then(()=>{
          this.msg = 'Reset Password email sent.'
          this.error = null
        }).catch(()=>{
          this.msg = null
          this.error = 'Could not complete the request'
        })
      }
      // SEND PASSWORD RESET
    })
  }
}

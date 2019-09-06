import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { UserService } from '../../shared/services/user.service';
import { Observable, Subscription } from 'rxjs';
import { take, combineLatest, first } from 'rxjs/operators';
import { FormControl, Validators, FormBuilder, FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import * as fromStore from '@shared/app.reducers';
import * as authActions from '@app/user/store/auth.actions'
import { RecaptchaComponent } from 'ng-recaptcha';
@Component({
  selector: 'app-user-actions',
  templateUrl: './user-actions.component.html',
  styleUrls: ['./user-actions.component.css']
})
export class UserActionsComponent implements OnInit, OnDestroy {
  email: string;
  mode: string; // 'resetPassword' | 'verifyEmail'
  actionCode: string;
  passwordResetForm: FormGroup;
  @ViewChild('captchaRef') captchaRef:RecaptchaComponent;

  authenticated: boolean = false;
  loading: boolean = true;
  sub: Subscription;
  error: string;
  msg: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthService,
    private user: UserService,
    private fb:FormBuilder,
    private store: Store<fromStore.appState>,
  ) { 
    this.passwordResetForm = fb.group({
      newPassword: [''],
      currentPassword: ['']
    })
  }

  ngOnInit() {
    this.mode = this.route.snapshot.queryParamMap.get('mode')
    this.actionCode = this.route.snapshot.queryParamMap.get('oobCode');
    this.authenticated = this.auth.isAuthenticated
    
    if(this.authenticated && !this.actionCode){
      this.passwordResetForm.get('currentPassword').setValidators([Validators.required, Validators.minLength(8)])
    }

    if (!this.mode || (!this.actionCode && !this.authenticated)) {
      this.router.navigate(['user'])
    } else if (this.actionCode) {
      console.log('this.mode = true',this.mode);
      switch (this.mode) {
        case 'resetPassword':
          console.log('verifyPasswordResetCode started');
          this.auth.verifyPasswordResetCode(this.actionCode).then(email => {
            console.log('verifyPasswordResetCode finished');
            this.email = email
            this.loading = false
          }).catch(e => {
            console.log('verifyPasswordResetCode failed');
            this.error = "Could not complete the requst"
            this.loading = false
            this.msg = null
          })
          break;
        case 'verifyEmail':
            console.log('this.mode verifyEmail');
          break;
        default:
            console.log('this.mode default');
            break
      }
    } else if (this.authenticated) {
      this.email = this.user.email
      this.loading = false
    } else {
      console.log('this.actionCode = false; this.authenticated= false');
    }
  }
  requestResetPassword(){
    this.auth.requestResetPassword(this.email).then(()=>{
          this.msg = 'Reset Password email sent. Please check your Inbox.'
          this.error = null
        }).catch(()=>{
          this.msg = null
          this.error = 'Could not complete the request'
        })
  }

  onConfirmPasswordReset() {
    if (this.passwordResetForm.get('newPassword').valid) {
      const newPassword = this.passwordResetForm.get('newPassword').value
      const currentPassword = this.passwordResetForm.get('currentPassword').value
      this.loading = true
      this.error = null
      this.msg = null
      if (this.authenticated && !this.actionCode) {
        this.auth.setPassword(this.email,currentPassword,newPassword)
        .then(() => this.router.navigate(['user', 'settings']))
        .catch((e)=> this.errorResettingPassword(e))
      } else {
        this.auth.resetPasswordWithActionhCode(this.actionCode, newPassword).then(() => {
          // password reset success
          this.msg = 'Password Reset was successfull. Logging you in.'
          this.auth.isAuthenticated$.pipe(first(bool => bool)).subscribe(() => {
            //login success
            this.router.navigate(['home'])
          })
          this.auth.tryLogin(this.email, newPassword)
        }).catch((e) => this.errorResettingPassword(e))
      }
    }
  }
  errorResettingPassword(e:any){
    this.error = 'Could not reset password'
    this.msg = null
    this.loading = false
    this.captchaRef.reset()
    console.log(e)
  }
  ngOnDestroy() {
    this.sub && this.sub.unsubscribe()
  }
}

import { Component, OnInit, Output, EventEmitter, OnDestroy, Input, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ValidatorFn, FormControl } from '@angular/forms';
import { AuthService } from '../../auth.service';
import * as fromStore from '../../../shared/app.reducers';
import { Store } from '@ngrx/store';
import * as authActions from '../../store/auth.actions'
import { Subscription } from 'rxjs';
import { RecaptchaComponent } from 'ng-recaptcha';
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit, OnDestroy {
  registerForm: FormGroup;
  loading: boolean = false;
  error: string = null;
  state_sub: Subscription;

  @Output('onSuccess') onSuccess = new EventEmitter<void>();
  @Input() email: string = '';
  @Output() emailChange = new EventEmitter<string>();
  @ViewChild('captchaRef') captchaRef: RecaptchaComponent;

    constructor(
      private fb: FormBuilder,
      private authService: AuthService,
      private store: Store<fromStore.appState>
    ) {

  }

  onSubmit() {
    if (this.registerForm.valid) {
      let formValues = this.registerForm.value
      this.store.dispatch(new authActions.TryRegister({ email: formValues.email, password: formValues.password }))
    }
  }
  ngOnInit() {
    this.registerForm = this.fb.group({
      email: [this.email, [Validators.required, Validators.email]],
      password: [''],
    })
    this.state_sub = this.store.select('auth').subscribe(authState => {
      this.error = authState.error
      this.loading = authState.loading
      if (this.loading) {
        this.registerForm.disable();
      } else if (this.error) {
        this.registerForm.enable();
        if(this.captchaRef){
          this.captchaRef.reset()
        }
      }
      if (authState.authenticated) {
        this.onSuccess.emit()
      }
    })
  }
  
  ngOnDestroy(): void {
    this.emailChange.emit(this.registerForm.get('email').value)
    this.store.dispatch(new authActions.AuthClean())
    this.state_sub.unsubscribe();
  }
}

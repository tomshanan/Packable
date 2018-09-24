import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { element } from 'protractor';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
 registerForm: FormGroup;
 loading: boolean = false;
 error:string = null;
 @Output('onSuccess') onSuccess = new EventEmitter<void>();

  constructor(
    private fb:FormBuilder,
    private authService:AuthService
  ) { 
    
  }

  onSubmit(){
    if(this.registerForm.valid){
      let formValues = this.registerForm.value
      this.registerForm.disable();
      this.error = null;
      this.loading = true;
      this.authService.registerUser(
        formValues.email,
        formValues.password
      ).then(
        resolve => {
          this.loading = false;
          this.onSuccess.emit();
        },
        error => {
          this.registerForm.enable();
          this.loading = false;
          this.error = 'Could Not create new user'
        }
      )
    }
  }
  ngOnInit() {
    this.registerForm = this.fb.group({
      email: ['',[Validators.required, Validators.email]],
      password: ['',[Validators.required, Validators.minLength(6)]]
    })
  }

}

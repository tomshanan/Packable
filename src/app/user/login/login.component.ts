import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading: boolean = false;
  error:string = null;
  @Output('onSuccess') onSuccess = new EventEmitter<void>();
 
   constructor(
     private fb:FormBuilder,
     private authService:AuthService
   ) { 
     
   }
 
   onSubmit(){
     if(this.loginForm.valid){
       let formValues = this.loginForm.value
       this.loginForm.disable();
       this.error = null;
       this.loading = true;
       this.authService.loginUser(
         formValues.email,
         formValues.password
       ).then(
         resolve => {
           this.loading = false;
           this.onSuccess.emit();
         },
         error => {
           this.loginForm.enable();
           this.loading = false;
           this.error = 'Could Not Login'
         }
       )
     }
   }
   ngOnInit() {
     this.loginForm = this.fb.group({
       email: ['',[Validators.required, Validators.email]],
       password: ['',[Validators.required, Validators.minLength(6)]]
     })
   }
}

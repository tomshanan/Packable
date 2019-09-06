import { Component, OnInit, Input, Output, EventEmitter, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { FormGroup, Validators, FormControl, FormBuilder } from '@angular/forms';
import { Subscription, combineLatest } from 'rxjs';
import { isDefined } from '../../shared/global-functions';

@Component({
  selector: 'app-password-form-control',
  templateUrl: './password-form-control.component.html',
  styleUrls: ['./password-form-control.component.css']
})
export class PasswordFormControlComponent implements OnInit,OnChanges,OnDestroy {
  inputControl: FormControl;
  @Input('disabled') disabled: boolean = false;
  @Output('passwordControlChange') inputControlChange = new EventEmitter<FormControl>()
  @Output('onSubmit') submitEmitter = new EventEmitter<void>()
  passwordForm: FormGroup;
  sub:Subscription;
  constructor(
    private fb: FormBuilder,
  ) { }
  
  ngOnInit() {
    this.passwordForm = this.fb.group({
      password: ['',[Validators.required, Validators.pattern(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}$/)]],
      verifyPassword: ['', [Validators.required, this.verifyPasswordValidator.bind(this)]]
    })
    this.inputControl = new FormControl(null,Validators.required)
    this.inputControlChange.emit(this.inputControl)

    this.sub = this.passwordForm.valueChanges.subscribe(()=>{
      this.inputControl.setValue(this.passwordForm.get('password').value)
      if(this.passwordForm.invalid){
        this.inputControl.setErrors({'formInvalid':true})
      } else {
        this.inputControl.setErrors(null)
      }
    })
  }
  ngOnChanges(changes:SimpleChanges){
    if(isDefined(this.passwordForm) && changes['disabled']){
      if(this.disabled){
        this.passwordForm.disable()
      } else {
        this.passwordForm.enable()
      }
    }
  }
  ngOnDestroy(){
    this.sub && this.sub.unsubscribe()
  }
  verifyPasswordValidator(control: FormControl): { [s: string]: boolean } | null {
    let value = control.value
    let parent = control.parent
    if (parent) {
      let passwordValue = parent.get('password').value
      if (value != passwordValue) {
        return { notTheSame: true }
      }
    }
    return null
  }
  submit(){
    this.submitEmitter.emit()
  }
}

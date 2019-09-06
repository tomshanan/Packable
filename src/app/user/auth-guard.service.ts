import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, CanActivateChild, Router } from "@angular/router";
import { Injectable } from "@angular/core";
import { AuthService } from './auth.service';
import { UserService } from '../shared/services/user.service';
import { Observable, from } from 'rxjs';
import { first, filter, mapTo, map } from 'rxjs/operators';

@Injectable()
export class AuthGuard implements CanActivate,CanActivateChild {
    
    constructor(
        private authService:AuthService,
        private userService:UserService,
        private router:Router,
        ){

    }
    canActivate(route:ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Observable<boolean>{
        let returnTo:string = state.url.split('/').clearUndefined().join(',')
        console.log('REACHED THIS POINT',returnTo)
        if(this.authService.isAuthenticated){
            return true
        } else {
            this.router.navigate(['user','auth'],{queryParams:{returnTo:returnTo}})
        }
    }
    canActivateChild(route:ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Promise<boolean>{
        let returnTo = route.url.join('')
        if(this.authService.isAuthenticated){
            return true
        } else {
            this.router.navigate(['user','auth'],{queryParams:{returnTo:returnTo}})
        }
    }
}

@Injectable({providedIn:'root'})
export class UnauthGuard implements CanActivate,CanActivateChild {

    constructor(
        private authService:AuthService,
        private userService:UserService,
        ){

    }
    canActivate(route:ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean{
        return !this.authService.isAuthenticated
    }
    canActivateChild(route:ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean{
        return !this.authService.isAuthenticated
    }
}
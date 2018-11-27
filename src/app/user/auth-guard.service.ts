import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, CanActivateChild } from "@angular/router";
import { Injectable } from "@angular/core";
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate,CanActivateChild {

    constructor(
        private authService:AuthService,
        ){

    }
    canActivate(route:ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean{
        return true //this.authService.isAuthenticated
    }
    canActivateChild(route:ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean{
        return true //this.authService.isAuthenticated
    }
}
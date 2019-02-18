import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, CanActivateChild } from "@angular/router";
import { Injectable } from "@angular/core";
import { AuthService } from './auth.service';
import { UserService } from '../shared/services/user.service';

@Injectable()
export class AuthGuard implements CanActivate,CanActivateChild {

    constructor(
        private authService:AuthService,
        private userService:UserService,
        ){

    }
    canActivate(route:ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean{
        return true //this.authService.isAuthenticated
    }
    canActivateChild(route:ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean{
        return true //this.authService.isAuthenticated
    }
    creatorCanActivate(route:ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean{
        return true 
        // return this.authService.isAuthenticated && this.userService.permissions.creator
    }
    creatorCanActivateChild(route:ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean{
        return true //this.authService.isAuthenticated
        //  return this.authService.isAuthenticated && this.userService.permissions.creator
    }
    userManagerCanActivate(route:ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean{
        return true 
        // return this.authService.isAuthenticated && this.userService.permissions.userManagement
    }
    userManagerCanActivateChild(route:ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean{
        return true //this.authService.isAuthenticated
        // return this.authService.isAuthenticated && this.userService.permissions.userManagement
    }
}
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from "@angular/common/http";
import { Observable } from 'rxjs';
import { Injectable } from "@angular/core";
import { AuthService } from '../user/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    constructor(
        private authService:AuthService
    ){}
    intercept(req: HttpRequest<any>, next: HttpHandler):Observable<HttpEvent<any>>{
        const modReq = req.clone({params:req.params.set('auth', this.authService.token)});
        return next.handle(modReq)
    }
}
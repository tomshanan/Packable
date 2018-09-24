import * as firebase from 'firebase';

export class AuthService {
    registerUser(email:string, password:string){
        return firebase.auth().createUserWithEmailAndPassword(email,password)
    }
}
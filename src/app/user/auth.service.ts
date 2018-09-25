import * as firebase from 'firebase';

export class AuthService {
    token: string;
    registerUser(email:string, password:string){
        return firebase.auth().createUserWithEmailAndPassword(email,password)
    }
    loginUser(email:string, password:string){
        return firebase.auth().signInWithEmailAndPassword(email,password)
        .then(
            s=>{
                this.getToken();
            },
            e=>console.log(e)
            )
    }
    getToken(){
        firebase.auth().currentUser.getIdToken().then((token:string)=>{
            this.token = token;
        })
        return this.token;
    }
    logout(){
        firebase.auth().signOut()
        this.token = null;
    }
    isAuthenticated():boolean{
        return this.token !=null;
    }

}
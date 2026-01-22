import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
    private http = inject(HttpClient);


  login(email:string,password:string){
    return this.http.post(`${environment.apiUrl}/api/auth/login`,{email,password},{withCredentials:true});
  }

}

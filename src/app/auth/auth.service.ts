import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, from } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { User } from './user.model';
import { Storage } from '@capacitor/storage';

@Injectable({
  providedIn: 'root'
})
export class AuthService implements OnDestroy {
  private _user = new BehaviorSubject<User>(null);
  private activeLogoutTimer: any;

  get userIsAuthenticated() {
    return this._user.asObservable().pipe(map(user => {
        if (user) {
          return !!user.token;
        } else {
          return false;
        }
      })
    );
  }

  get userId() {
    return this._user.asObservable().pipe(map(user => {
        if (user) {
          return user.id;
        } else {
          return null;
        }  
      })
    );
  }

  get token() {
    return this._user.asObservable().pipe(map(user => {
        if (user) {
          return user.token;
        } else {
          return null;
        }  
      })
    );
  }

  constructor(private http: HttpClient) { }

  autoLogin() {
    return from(Storage.get({key: 'authData'})).pipe(
      map(storedData => {
        if (!storedData || !storedData['value']) {
          return null;
        }
        const parsedData = JSON.parse(storedData['value']) as {
          token: string; 
          tokenExpiration: string;
          userId: string;
          email: string;
        };
        const expirationTime = new Date(parsedData.tokenExpiration);
        if (expirationTime <= new Date()) {
          return null;
        }
        const user = new User(
          parsedData.userId, 
          parsedData.email, 
          parsedData.token, 
          expirationTime
        );
        return user;
      }),
      tap(user => {
        if (user) {
          this._user.next(user);
          this.autoLogout(user.tokenDuration);
        }
      }),
      map(user => {
        return !!user;
      })
    );
  }

  signup(email: string, password: string) {
    return this.http.post<any>(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${environment.firebaseApiKey}`,
      {email: email, password: password, returnSecureToken: true}
    ).pipe(tap(this.setUserData.bind(this)));
  }

  login(email: string, password: string) {
    return this.http.post<any>(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${environment.firebaseApiKey}`,
      {email: email, password: password, returnSecureToken: true}
    ).pipe(tap(this.setUserData.bind(this)));
  }

  logout() {
    if (this.activeLogoutTimer) {
      clearTimeout(this.activeLogoutTimer);
    }

    this._user.next(null);
    Storage.remove({key: 'authData'});
  }

  ngOnDestroy() {
    if (this.activeLogoutTimer) {
      clearTimeout(this.activeLogoutTimer);
    }
  }

  private autoLogout(duration: number) {
    if (this.activeLogoutTimer) {
      clearTimeout(this.activeLogoutTimer);
    }

    this.activeLogoutTimer = setTimeout(() => {
      this.logout();
    }, duration);
  }

  private setUserData(userData: any) {
    const tokenExpiration = new Date(new Date().getTime() + (+userData.expiresIn * 1000));
    const user = new User(
      userData.localId,
      userData.email,
      userData.idToken,
      tokenExpiration
    )
    this._user.next(user);
    this.autoLogout(user.tokenDuration);
    this.storeAuthData(userData.localId, userData.idToken, tokenExpiration.toISOString(), userData.email);
  }

  private storeAuthData(userId: string, token: string, tokenExpiration: string, email: string) {
    const data  = JSON.stringify({
      userId: userId, 
      token: token, 
      tokenExpiration: tokenExpiration,
      email: email
    });
    Storage.set({key: 'authData', value: data})
  }
}

import { Component, OnInit } from '@angular/core';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { AlertController, LoadingController } from '@ionic/angular';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage implements OnInit {
 
  isLogin = true;
  isLoading = false;

  constructor(
    private authService: AuthService, 
    private router: Router,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController
  ) { }

  ngOnInit() {
  }

  authenticate(email: string, password: string){
    this.isLoading = true;
    this.loadingCtrl
      .create({keyboardClose: true, message: 'Logging in...'})
      .then(loadingEl => {
        loadingEl.present();
        let authObs: Observable<any>;

        if (this.isLogin) {
          authObs = this.authService.login(email, password);
        } else {
          authObs = this.authService.signup(email, password);
        }

        authObs.subscribe(data => {
          this.isLoading = false;
          loadingEl.dismiss();
          this.router.navigateByUrl('/places/tabs/search')
        }, errorRes => {
          loadingEl.dismiss();
          const errorCode = errorRes.error.error.message;
          let message = 'An error occured signing you in'

          if (errorCode === 'EMAIL_EXISTS') {
            message = 'An account with this email address already exists';
          } else if (errorCode === 'EMAIL_NOT_FOUND') {
            message = 'No account associated with this email address. Please sign up.'
          } else if (errorCode === 'INVALID_PASSWORD') {
            message = "Invalid credentials."
          }

          this.showAlert(message);
        });
      })
  }

  onSubmit(form: NgForm){
    if (!form.valid) {
      return;
    }
    const email = form.value.email;
    const password = form.value.password;

    this.authenticate(email, password);
    form.reset();
  }

  private showAlert(message: string) {
    this.alertCtrl.create({
      header: 'Authentication failed', message: message, buttons: ['Okay']
    }).then(alertEl => alertEl.present());
  }

  onSwitchAuthMode() {
    this.isLogin = !this.isLogin;
  }
}

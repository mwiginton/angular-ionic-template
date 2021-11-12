import { Component, OnInit } from '@angular/core';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage implements OnInit {
 
  isLogin = true;

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit() {
  }

  onLogin(){
    this.authService.login();
    this.router.navigateByUrl('/places/tabs/search')
  }

  onSubmit(form: NgForm){
    if (!form.valid) {
      return;
    }

    if (this.isLogin) {
      // handle login
    } else {
      // handle sign up
    }
  }

  onSwitchAuthMode() {
    this.isLogin = !this.isLogin;
  }
}

import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { PlacesService } from '../../places.service';

@Component({
  selector: 'app-new-offer',
  templateUrl: './new-offer.page.html',
  styleUrls: ['./new-offer.page.scss'],
})
export class NewOfferPage implements OnInit {

  offerForm: FormGroup;

  constructor(
    private placesService: PlacesService, 
    private router: Router,
    private loadingCtrl: LoadingController
  ) { }

  ngOnInit() {
    this.offerForm = new FormGroup({
      title: new FormControl(null, {updateOn: 'blur', validators: [Validators.required]}),
      description: new FormControl(null, {updateOn: 'blur', validators: [Validators.required, Validators.maxLength(180)]}),
      price: new FormControl(null, {updateOn: 'blur', validators: [Validators.required, Validators.min(1)]}),
      dateFrom: new FormControl(null, {updateOn: 'blur', validators: [Validators.required]}),
      dateTo: new FormControl(null, {updateOn: 'blur', validators: [Validators.required]})
    });
  }

  onCreateOffer() {
    if (!this.offerForm.valid) {
      return;
    }

    this.loadingCtrl.create({
      message: 'Creating Place...'
    }).then(loadingEl => {
      loadingEl.present();

      this.placesService.addPlace(this.offerForm.value).subscribe(() => {
        loadingEl.dismiss();
        this.offerForm.reset();
        this.router.navigate(['/places/tabs/offers']);
      });  
    });

    
  }
}

import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController, NavController } from '@ionic/angular';
import { Place } from '../../place.model';
import { PlacesService } from '../../places.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-edit-offer',
  templateUrl: './edit-offer.page.html',
  styleUrls: ['./edit-offer.page.scss'],
})
export class EditOfferPage implements OnInit, OnDestroy {
  place: Place;
  offerForm: FormGroup;
  private placesSub: Subscription;
  isLoading = false;

  constructor(
    private route: ActivatedRoute, 
    private navCtrl: NavController, 
    private placesService: PlacesService,
    private router: Router,
    private loadingCtrl: LoadingController
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(paramMap => {
      if(!paramMap.has('placeId')) {
        this.navCtrl.navigateBack('/places/tabs/offers');
        return;
      }

      this.isLoading = true;

      this.placesSub = this.placesService.getPlace(paramMap.get('placeId')).subscribe(place => {
        this.place = place;

        this.offerForm = new FormGroup({
          title: new FormControl(this.place.title, {updateOn: 'blur', validators: [Validators.required]}),
          description: new FormControl(this.place.description, {updateOn: 'blur', validators: [Validators.required, Validators.maxLength(180)]})
        });

        this.isLoading = false;
      });
    });
  }

  onUpdateOffer() {
    if (!this.offerForm.valid) {
      return;
    }

    this.loadingCtrl.create({
      message: "Updating Place..."
    }).then(loadingEl => {
      loadingEl.present();
      const newPlace = {
        id: this.place.id,
        title: this.offerForm.value.title,
        description: this.offerForm.value.description
      }
      this.placesService.updatePlace(
        newPlace
      ).subscribe(() => {
        loadingEl.dismiss();
        this.offerForm.reset();
        this.router.navigate(['/places/tabs/offers']);
      });
    })   
  }

  ngOnDestroy() {
    if (this.placesSub) {
      this.placesSub.unsubscribe();
    }
  }
}

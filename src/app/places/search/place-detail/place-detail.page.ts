import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController, ModalController, ActionSheetController, LoadingController } from '@ionic/angular';
import { Place } from '../../place.model';
import { PlacesService } from '../../places.service';
import { CreateBookingComponent } from 'src/app/bookings/create-booking/create-booking.component';
import { Subscription } from 'rxjs';
import { BookingsService } from 'src/app/bookings/bookings.service';
import { AuthService } from 'src/app/auth/auth.service';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-place-detail',
  templateUrl: './place-detail.page.html',
  styleUrls: ['./place-detail.page.scss'],
})
export class PlaceDetailPage implements OnInit, OnDestroy {
  place: Place;
  private placesSub: Subscription;
  isBookable = false;
  loggedInUser: any;

  constructor(
    private navCtrl: NavController,
    private route: ActivatedRoute,
    private placesService: PlacesService,
    private modalCtrl: ModalController,
    private actionSheetCtrl: ActionSheetController,
    private bookingService: BookingsService,
    private authService: AuthService,
    private loadingCtrl: LoadingController
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(paramMap => {
      if(!paramMap.has('placeId')) {
        this.navCtrl.navigateBack('/places/tabs/offers');
        return;
      }
      let fetchedUserId: string;
      this.authService.userId.pipe(switchMap(userId => {
        if (!userId) {
          throw new Error("No User found");
        }
        fetchedUserId = userId;
        this.loggedInUser = userId;
        return this.placesService.getPlace(paramMap.get('placeId'))
      }))
      .subscribe(place => {
        this.place = place;
        this.isBookable = this.place.userId !== fetchedUserId;
      });
    });
  }

  onBookPlace() {
    this.actionSheetCtrl.create({
      header: 'Choose an Action',
      buttons: [
        {
          text: 'Select Date',
          handler: () => {
            this.openBookingModal('select');
          }
        },
        {
          text: 'Random Date',
          handler: () => {
            this.openBookingModal('random');
          }
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    }).then(actionSheetEl => {
      actionSheetEl.present();
    });
  }

  openBookingModal(mode: 'select' | 'random') {
    console.log(mode);
    // this.navCtrl.navigateBack('places/tabs/search');
    this.modalCtrl.create({
      component: CreateBookingComponent, componentProps: {selectedPlace: this.place, selectedMode: mode}
    }).then(modalElement => {
      modalElement.present();
      return modalElement.onDidDismiss();
    }).then(resultData => {
      this.loadingCtrl.create({message: "Booking Place..."}).then(loadingEl => {
        loadingEl.present();
        console.log('Modal Result');
        console.log(resultData);
        let newBooking = {
          id: Math.random().toString(),
          placeId: this.place.id,
          placeTitle: this.place.title,
          firstName: resultData.data.bookingData.firstName,
          lastName: resultData.data.bookingData.lastName,
          guestNumber: resultData.data.bookingData.guestNumber,
          bookedFrom: resultData.data.bookingData.startDate,
          bookedTo: resultData.data.bookingData.endDate,
          userId: this.loggedInUser
        }
        this.bookingService.addBooking(newBooking).subscribe(() => {
          loadingEl.dismiss();
        });
      });      
    });
  }

  ngOnDestroy() {
    if (this.placesSub) {
      this.placesSub.unsubscribe();
    }
  }
}

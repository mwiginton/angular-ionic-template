import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { Booking } from './booking-model';
import { take, map, tap, delay, switchMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class BookingsService {
  private _bookings = new BehaviorSubject<Booking[]>([]) ;

  constructor(
    private authService: AuthService,
    private http: HttpClient
  ) { }

  get bookings() {
    return this._bookings.asObservable()
  }

  addBooking(booking: Booking) {
    // let generatedId: string;
    // place.id = null;
    // place.userId = this.authService.userId;

    // return this.http
    // .post<{name: string}>('https://angular-ionic-template-default-rtdb.firebaseio.com/offered-places.json', { 
    //   ...place
    // })
    // .pipe(
    //   switchMap(data => {
    //     generatedId = data.name;
    //     return this.places;
    //   }),
    //   take(1),
    //   tap(places => {
    //     place.id = generatedId;
    //     this._places.next(places.concat(place));
    //   })
    // );

    let generatedId: string;
    booking.id = null;
    booking.userId = this.authService.userId;

    return this.http
    .post<{name: string}>('https://angular-ionic-template-default-rtdb.firebaseio.com/bookings.json', { 
      ...booking
    })
    .pipe(
      switchMap(data => {
        generatedId = data.name;
        return this.bookings;
      }),
      take(1),
      tap(bookings => {
        booking.id = generatedId;
        this._bookings.next(bookings.concat(booking));
      })
    );

    // return this.bookings.pipe(
    //   take(1),
    //   delay(1000),
    //   tap(bookings => {
    //     this._bookings.next(bookings.concat(booking));
    //   })
    // );
  }

  cancelBooking(bookingId: string) {
    return this.bookings.pipe(take(1),
      delay(1000),
      tap(bookings => {
        this._bookings.next(bookings.filter(booking => booking.id !== bookingId));
      })
    );
  }
}

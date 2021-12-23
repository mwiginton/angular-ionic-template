import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { Booking } from './booking-model';
import { take, map, tap, delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BookingsService {
  private _bookings = new BehaviorSubject<Booking[]>([]) ;

  constructor(private authService: AuthService) { }

  get bookings() {
    return this._bookings.asObservable()
  }

  addBooking(booking: Booking) {
    // let newBooking = booking;
    return this.bookings.pipe(take(1),
      delay(1000),
      tap(bookings => {
        this._bookings.next(bookings.concat(booking));
      })
    );
  }

  cancelBooking(bookingId: string) {}
}

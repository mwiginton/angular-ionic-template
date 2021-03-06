import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { Booking } from './booking-model';
import { take, map, tap, delay, switchMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { tokenName } from '@angular/compiler';

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

  getBookings() {
    let fetchedUserId: string;
    return this.authService.userId.pipe(take(1), switchMap(userId => {
      if (!userId) {
        throw new Error("User ID not found");
      }
      fetchedUserId = userId;
      return this.authService.token;
    }),
    take(1),
    switchMap(token =>{
      return this.http
      .get<{[key: string]: any}>(`https://angular-ionic-template-default-rtdb.firebaseio.com/bookings.json?orderBy="userId"&equalTo="${fetchedUserId}"&auth=${token}`)
    }),
    map(data => {
      const bookings = []
      for (let key in data) {
        if (data.hasOwnProperty(key)) {
          bookings.push(new Booking(
            key, data[key].placeId, data[key].userId, data[key].placeTitle, data[key].firstName, data[key].lastName, data[key].guestNumber, new Date(data[key].bookedFrom), new Date(data[key].bookedTo)
          ));
        }
      }
      return bookings;
    }),
    tap(bookings => {
      this._bookings.next(bookings);
    }));
  }

  addBooking(booking: Booking) {
    let generatedId: string;
    booking.id = null;
    let fetchedUserId: string;

    return this.authService.userId.pipe(take(1), switchMap(userId => {
        if (!userId) {
          throw new Error("User ID not found");
        }
        fetchedUserId = userId;
        booking.userId = userId;
        return this.authService.token;
      }),
      take(1),
      switchMap(token => {
        return this.http
        .post<{name: string}>(`https://angular-ionic-template-default-rtdb.firebaseio.com/bookings.json?auth=${token}`, { 
          ...booking
        })
      }),
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
  }

  cancelBooking(bookingId: string) {
    return this.authService.token.pipe(take(1), switchMap(token => {
      return this.http
        .delete(`https://angular-ionic-template-default-rtdb.firebaseio.com/bookings/${bookingId}.json?auth=${token}`)
    }),
    switchMap(() => {
      return this.bookings
    }),
    take(1),
    tap(bookings => {
      this._bookings.next(bookings.filter(booking => booking.id !== bookingId));
    }));
  }
}

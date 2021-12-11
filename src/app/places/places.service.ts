import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { Place } from './place.model';
import { take, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PlacesService {

  private _places = new BehaviorSubject<Place[]>([
    new Place('p1', 'Place 1', 'Place 1 Description', 150, new Date('2019-01-01'), new Date('2019-12-31'), 'abc'),
    new Place('p2', 'Place 2', 'Place 2 Description', 200, new Date('2019-01-01'), new Date('2019-12-31'), 'abc'),
    new Place('p3', 'Place 3', 'Place 3 Description', 250, new Date('2019-01-01'), new Date('2019-12-31'), 'abc')
  ]);

  get places() {
    return this._places.asObservable();
  }

  constructor(private authService: AuthService) { }

  getPlace(id: any) {
    return this.places.pipe(
      take(1), 
      map(places => {
        return {...places.find(place => place.id === id)};
      })
    );   
  }

  addPlace(place: Place) {
    place.id = Math.random().toString();
    place.userId = this.authService.userId;
    //this._places.push(place);
    this.places.pipe(take(1)).subscribe(places => {
      this._places.next(places.concat(place));
    });  
  }
}

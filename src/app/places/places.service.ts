import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { Place } from './place.model';
import { take, map, tap, delay, switchMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PlacesService {

  private _places = new BehaviorSubject<Place[]>([]);

  get places() {
    return this._places.asObservable();
  }

  constructor(
    private authService: AuthService,
    private http: HttpClient
  ) { }

  getPlaces() {
    return this.http
      .get<{[key: string]: any}>('https://angular-ionic-template-default-rtdb.firebaseio.com/offered-places.json')
      .pipe(map(data => {
        const places = []
        for (let key in data) {
          if (data.hasOwnProperty(key)) {
            places.push(new Place(
              key, data[key].title, data[key].description, data[key].price, new Date(data[key].availableFrom), new Date(data[key].availableTo), data[key].userId
            ));
          }
        }
        return places;
      }),
      tap(places => {
        this._places.next(places);
      }));
  }

  getPlace(id: any) {
    return this.http.get<any>(`https://angular-ionic-template-default-rtdb.firebaseio.com/offered-places/${id}.json`
    ).pipe(
      map(data => {
        return new Place(
          id, 
          data.title, 
          data.description, 
          data.price, 
          new Date(data.availableFrom), 
          new Date(data.availableTo), 
          data.userId
        );
      })
    );
    // return this.places.pipe(
    //   take(1), 
    //   map(places => {
    //     return {...places.find(place => place.id === id)};
    //   })
    // );   
  }

  addPlace(place: Place) {
    // place.id = Math.random().toString();
    let generatedId: string;
    place.id = null;
    place.userId = this.authService.userId;

    return this.http
    .post<{name: string}>('https://angular-ionic-template-default-rtdb.firebaseio.com/offered-places.json', { 
      ...place
    })
    .pipe(
      switchMap(data => {
        generatedId = data.name;
        return this.places;
      }),
      take(1),
      tap(places => {
        place.id = generatedId;
        this._places.next(places.concat(place));
      })
    );
  }

  updatePlace(place: any) {
    let updatedPlaces: Place[];
    return this.places.pipe(
      take(1), switchMap(places => {
        const updatedPlaceIndex = places.findIndex(currentPlace => currentPlace.id === place.id);
        updatedPlaces = [...places];
        const oldPlace = updatedPlaces[updatedPlaceIndex];
        
        updatedPlaces[updatedPlaceIndex] = new Place(
          oldPlace.id, 
          place.title, 
          place.description,
          oldPlace.price,
          oldPlace.availableFrom,
          oldPlace.availableTo,
          oldPlace.userId
        );
        return this.http.put(
          `https://angular-ionic-template-default-rtdb.firebaseio.com/offered-places/${place.id}.json`,
          { ...updatedPlaces[updatedPlaceIndex], id: null}
        );
      }), tap(() => {
        this._places.next(updatedPlaces);
      }))
  }
}

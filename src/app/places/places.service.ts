import { Injectable } from '@angular/core';
import { Place } from './place.model';

@Injectable({
  providedIn: 'root'
})
export class PlacesService {

  private _places: Place[] = [
    new Place('p1', 'Place 1', 'Place 1 Description', 150),
    new Place('p2', 'Place 2', 'Place 2 Description', 200),
    new Place('p3', 'Place 3', 'Place 3 Description', 250)
  ]

  get places() {
    return [...this._places];
  }

  constructor() { }

  getPlace(id: any) {
    return {...this._places.find(place => place.id === id)};
  }
}

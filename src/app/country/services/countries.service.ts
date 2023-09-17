import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Country, Region, SmallContry } from '../interfaces/country.inteface';
import { environments } from '../enviroments/enviroments';
import { Observable, catchError, combineLatest, map, of, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CoutriesService {
  constructor(private http: HttpClient) { }

  private baseUrl: string = environments.baseUrl;

  private _regions: Region[] = [Region.Americas, Region.Europe, Region.Asia, Region.Oceania, Region.Africa]

  get regions(): Region[] {
    //crea una copia del objeto _regions
    return [...this._regions];
  }

  public searchCountryByRegion(region: Region): Observable<SmallContry[]> {
    if (!region) return of([])
    return this.http.get<Country[]>(`${this.baseUrl}/region/${region}?fields=cca3,name,borders`).pipe(
      map(countries => countries.map(country => ({
        name: country.name.common,
        cca3: country.cca3,
        //si la respuesta de borders es nula devuelve un arreglo vacio
        borders: country.borders ?? []
      })))
    )
  }

  public getCountryByAlphaCode(countryCode: string): Observable<SmallContry> {
    return this.http.get<Country>(`${this.baseUrl}/alpha/${countryCode}?fields=cca3,name,borders`).pipe(
      map(({ name, cca3, borders }) =>
        ({ name: name.common, cca3, borders: borders ?? [] })
      ),
      catchError(err => of())
    )
  }

  public getCountryBorderByCodes(borders:string[]): Observable<SmallContry[]>{
    if(!borders || borders.length === 0 ) return of([])

    const countriesRequest: Observable<SmallContry>[] = [];

    borders.forEach(code => {
      const request= this.getCountryByAlphaCode(code);
      countriesRequest.push(request);
    })

    return combineLatest(countriesRequest)
  }

  // public getSmallCountryData(countryCode: string): Observable<SmallContry> {
  //   return this.http.get<Country>(`${this.baseUrl}/alpha/${countryCode}?fields=cca3,name,borders`).pipe(
  //     map(({ name, cca3, borders }) =>
  //       ({ name: name.common, cca3, borders: borders ?? [] })
  //     ),
  //   )
  // }

}

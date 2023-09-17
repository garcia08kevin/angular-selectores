import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Region, SmallContry } from '../../interfaces/country.inteface';
import { CoutriesService } from '../../services/countries.service';
import { filter, map, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-selector-page',
  templateUrl: './selector-page.component.html',
  styles: [
  ]
})
export class SelectorPageComponent implements OnInit {

  constructor(
    private fb: FormBuilder,
    private coutriesService: CoutriesService
  ) { }

  ngOnInit(): void {
    this.OnRegionChange();
    this.OnCountriesChange()
  }

  public countries: SmallContry[] = [];
  public bortersCountries: SmallContry[] = [];

  get regions(): Region[] {
    return this.coutriesService.regions;
  }

  public myForm: FormGroup = this.fb.group({
    region: ['', Validators.required],
    country: ['', Validators.required],
    borters: ['', Validators.required],
  })



  OnRegionChange(): void {
    this.myForm.get('region')!.valueChanges
      .pipe(
        tap(() => this.myForm.get('country')!.setValue('')),
        tap(() => this.bortersCountries = []),
        switchMap(region =>
          this.coutriesService.searchCountryByRegion(region)
        )
      ).subscribe(countries => {
        this.countries = countries;
        console.log(countries)
      })
  }

  OnCountriesChange(): void {
    this.myForm.get('country')!.valueChanges
      .pipe(
        filter((value: string) => value.length > 0),
        tap(() => this.myForm.get('borters')!.setValue('')),
        switchMap(alphaCode =>
          this.coutriesService.getCountryByAlphaCode(alphaCode)
        ),
        switchMap(country =>
          this.coutriesService.getCountryBorderByCodes(country.borders)
        )
      ).subscribe(contries => {
        this.bortersCountries = contries;
      })
  }


  // OnCountriesChange(): void {
  //   this.myForm.get('country')!.valueChanges
  //     .pipe(
  //       tap(() => this.myForm.get('borters')!.setValue('')),
  //       switchMap(country =>
  //         this.countries.filter(countries => countries.cca3 === country)
  //       )
  //     ).subscribe(contries => {
  //       this.bortersCountries= [];
  //       for (let index = 0; index < contries.borders.length; index++) {
  //         this.coutriesService.getSmallCountryData(contries.borders[index]).subscribe(resp => {
  //           this.bortersCountries.push(resp);
  //         })

  //       }
  //     })
  // }

}

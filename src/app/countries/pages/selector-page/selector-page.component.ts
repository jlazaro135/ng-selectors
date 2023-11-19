import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CountriesService } from '../../services/countries.service';
import { Region, SmallCountry } from '../../interfaces/countries.interface';
import { filter, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-selector-page',
  templateUrl: './selector-page.component.html',
})
export class SelectorPageComponent implements OnInit {
  public countriesByRegion: SmallCountry[] = [];
  public borders: SmallCountry[] = []

  public myForm: FormGroup = this.fb.group({
    region: ['', Validators.required],
    country: ['', Validators.required],
    border: ['', Validators.required],
  });

  constructor(
    private fb: FormBuilder,
    private countriesService: CountriesService
  ) {}

  ngOnInit(): void {
    this.onRegionChange();
    this.onCountryChange();
  }

  get regions(): Region[] {
    return this.countriesService.regions;
  }

  onRegionChange(): void {
    this.myForm.get('region')!.valueChanges
    .pipe(
        tap( () => this.myForm.get('country')!.reset('')),
        tap( () => this.borders = []),
        switchMap((region) =>
          this.countriesService.getCountriesByRegion(region)),
      )
      .subscribe((countries) => {
        countries.sort((a, b) => a.name.localeCompare(b.name))
        this.countriesByRegion = countries;
      });
  }

  onCountryChange():void {
    this.myForm.get('country')!.valueChanges
    .pipe(
        tap( () => this.myForm.get('border')!.reset('')),
        filter((value: string) => value.length > 0),
        switchMap((alphaCode) => this.countriesService.getCountryByAlphaCode(alphaCode)),
        switchMap((country) => this.countriesService.getCountriesBordersByCodes(country.borders)),
      )
      .subscribe((countries) => {
        this.borders = countries;
      });
  }
}

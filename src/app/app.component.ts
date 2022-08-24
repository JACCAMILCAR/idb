import { Component, VERSION } from '@angular/core';
import { Hero } from './models/hero';
import { IdbService } from './services/item.service';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  name = 'Angular ' + VERSION.major;
  heroList: Hero[];

  constructor(public item$: IdbService) {
    this.item$.connectToIDB();
    this.item$.getAllData('Hero').subscribe((list) => {
      this.heroList = list;
      console.log(list);
    });
  }

  saveHero(name: HTMLInputElement, power: HTMLInputElement): void {
    const h = new Hero();
    // h.id = 1;
    h.name = name.value;
    h.power = Number(power.value);
    this.item$.addItem('Hero', h).subscribe();
  }

  deleteDB() {
    this.item$.deleteDB();
  }
}

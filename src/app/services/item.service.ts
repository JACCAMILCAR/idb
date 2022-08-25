import { Injectable } from '@angular/core';
import { openDB, IDBPDatabase, deleteDB, DBSchema } from 'idb';
import { from, Observable, of } from 'rxjs';

import { map, switchMap } from 'rxjs/operators';
import { Hero } from '../models/hero';

interface MyDB {
  // Status: any;
  Hero: {
    key: string;
    value: Hero;
  };

  Heros: {
    key: string;
    value: Hero;
  };
}

type MyDBKeys = keyof MyDB;
const aux: MyDBKeys = 'Hero';
console.log(aux);

@Injectable({
  providedIn: 'root',
})
export class IdbService {
  version = 1;
  databaseName = 'pwa-extrudapp-crs-store';

  dbConnection$: Observable<IDBPDatabase<MyDB>>;

  connectToIDB() {
    this.dbConnection$ = from(
      openDB<MyDB>(this.databaseName, this.version, {
        upgrade(db) {
          console.log('IndexedDB upgrade');
          db.createObjectStore('Status', { keyPath: 'AppName' });
          db.createObjectStore('Hero', { keyPath: 'id', autoIncrement: true });
          db.createObjectStore('Heros', { keyPath: 'id', autoIncrement: true });
        },
      })
    );
    return this.dbConnection$;
  }

  getItem<T>(target: MyDBKeys, value: string | number): Observable<T> {
    return this.dbConnection$.pipe(
      switchMap((db) => {
        const tx = db.transaction(target, 'readwrite');
        const store = tx.objectStore(target);
        return from(store.get(value));
      })
    );
  }

  addItem(target: MyDBKeys, value: Hero): Observable<Hero> {
    return this.dbConnection$.pipe(
      map((db) => {
        const tx = db.transaction(target, 'readwrite');
        tx.objectStore(target)
          .add({ ...value })
          .then((v) => {
            console.log('add', v);
          })
          .catch((err) => {
            console.log(err);
          });
        return value;
      })
    );
  }

  addItems(target: MyDBKeys, value: Hero[]): Observable<Hero[]> {
    return this.dbConnection$.pipe(
      map((db) => {
        const tx = db.transaction(target, 'readwrite');
        value.map((v) => tx.objectStore(target).add({ ...v }));
        return value;
      })
    );
  }

  deleteItem(
    target: MyDBKeys,
    value: string | number
  ): Observable<string | number> {
    return this.dbConnection$.pipe(
      map((db) => {
        const tx = db.transaction(target, 'readwrite');
        const store = tx.objectStore(target);
        store.delete(value);
        return value;
      })
    );
  }

  deleteItems(
    target: MyDBKeys,
    value: (string | number)[]
  ): Observable<(string | number)[]> {
    return this.dbConnection$.pipe(
      map((db) => {
        const tx = db.transaction(target, 'readwrite');
        const store = tx.objectStore(target);
        value.map((v) => store.delete(v));
        return value;
      })
    );
  }

  getAllData(target: MyDBKeys): Observable<Hero[]> {
    console.log(target);
    return this.dbConnection$.pipe(
      switchMap((db) => {
        const tx = db.transaction(target, 'readonly');
        const store = tx.objectStore(target);
        return from(store.getAll());
      })
    );
  }

  deleteDB() {
    deleteDB(this.databaseName, {
      blocked() {
        console.log('deleteDB blocked');
      },
    });
  }

  checkOfflineReady<T>(): Observable<T[]> {
    return this.dbConnection$.pipe(
      switchMap((db) => {
        const tx = db.transaction('Status', 'readonly');
        const store = tx.objectStore('Status');
        return from(store.getAll('concrete-record-sheets'));
      })
    );
  }
}

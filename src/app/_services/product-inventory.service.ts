import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { delay, filter, map } from 'rxjs/operators';

import { environment } from '@app/environments/environment';
import { ProductInventory } from '@app/_models/product-inventory';

@Injectable({ providedIn: 'root' })
export class ProductInventoryService {

    constructor(
        private router: Router,
        private http: HttpClient
    ) { }

    getAll(fitlerDate: Date, cut_off: string) {
        return this.http.get<ProductInventory[]>(`${environment.apiUrl}/product-inventory/${fitlerDate}/${cut_off}`);
    }

    create(productInventory: ProductInventory) {
        return this.http.post(`${environment.apiUrl}/product-inventory`, productInventory);
    }

    createBatch(cut_off: string) {
        console.log('createBatch ', cut_off);
        return this.http.post(`${environment.apiUrl}/product-inventory/create-batch/${cut_off}`, '').pipe(
            delay(5000)
        );
    }

    getById(id: string) {
        return this.http.get<ProductInventory>(`${environment.apiUrl}/product-inventory/edit/${id}`);
    }

    update(id: string, params: any) {
        return this.http.put(`${environment.apiUrl}/product-inventory/${id}`, params)
            .pipe(map(x => {
                return x;
            }));
    }
}
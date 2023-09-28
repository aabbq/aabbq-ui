import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

import { environment } from '@app/environments/environment';
import { Bank } from '@app/_models';
import { ProductCategory } from '@app/_models/product-category';

@Injectable({ providedIn: 'root' })
export class ProductCategoryService {

    constructor(
        private router: Router,
        private http: HttpClient
    ) { }

    getAll() {
        return this.http.get<Bank[]>(`${environment.apiUrl}/products-category`);
    }

    getAllEnabled() {
        return this.http.get<Bank[]>(`${environment.apiUrl}/products-category/enabled`);
    }

    create(productCategory: ProductCategory) {
        return this.http.post(`${environment.apiUrl}/products-category`, productCategory);
    }

    getById(id: string) {
        return this.http.get<Bank>(`${environment.apiUrl}/products-category/${id}`);
    }

    update(id: string, params: any) {
        return this.http.put(`${environment.apiUrl}/products-category/${id}`, params)
            .pipe(map(x => {
                return x;
            }));
    }
}
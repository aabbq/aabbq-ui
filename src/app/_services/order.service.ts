import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

import { environment } from '@app/environments/environment';
import { Order } from '@app/_models/order';
import { OrderDetail } from '@app/_models/order-detail';

@Injectable({ providedIn: 'root' })
export class OrderService {

    constructor(
        private router: Router,
        private http: HttpClient
    ) { }

    getAll(filterDate: any, cut_off: string) {
        return this.http.get<Order[]>(`${environment.apiUrl}/orders/${filterDate}/${cut_off}`);
    }

    create(order: Order) {
        return this.http.post(`${environment.apiUrl}/orders`, order);
    }

    getById(id: string) {
        return this.http.get<Order>(`${environment.apiUrl}/orders/edit/${id}`);
    }

    update(id: string, params: any) {
        return this.http.put(`${environment.apiUrl}/orders/${id}`, params)
            .pipe(map(x => {
                return x;
            }));
    }

    createDetail(orderDetail: OrderDetail) {
        return this.http.post(`${environment.apiUrl}/order-details`, orderDetail);
    }

    updateDetail(id: string, params: any) {
        return this.http.put(`${environment.apiUrl}/order-details/${id}`, params)
            .pipe(map(x => {
                return x;
            }));
    }

    deleteDetail(id: string) {
        return this.http.delete(`${environment.apiUrl}/order-details/delete/${id}`)
            .pipe(map(x => {
                return x;
            }));
    }

    getDetailById(id: string) {
        return this.http.get<Order>(`${environment.apiUrl}/order-details/edit/${id}`);
    }
}
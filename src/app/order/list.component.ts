import { Component, OnInit, ViewChild } from '@angular/core';
import { NgFor, NgIf, CommonModule, DatePipe } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { first } from 'rxjs/operators';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule} from '@angular/material/select';

import { TableUtil } from '@app/_helpers/table.util';
import { FormControl } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { Order } from '@app/_models/order';
import { OrderService } from '@app/_services/order.service';
import { CutOff } from '@app/_helpers/enums/prod-inv';

@Component({ 
    selector: 'order-list-component',
    templateUrl: 'list.component.html',
    styleUrls: ['orders.component.css'],
    standalone: true,
    imports: [
        RouterLink, NgFor, NgIf, CommonModule, ReactiveFormsModule,
        MatCardModule, MatButtonModule, MatInputModule, MatFormFieldModule, MatTableModule, MatPaginatorModule, MatSortModule,
        MatIconModule, MatDatepickerModule, MatNativeDateModule, MatSelectModule
    ],
    providers: [DatePipe]
})
export class ListComponent implements OnInit {

    orders?: Order[];
    dataSource: any;
    displayedColumns: string[] = [
        'id', 'transaction_date', 'cutoff', 'or_number', 'ordered_to', 
        'payment_type', 'total_amount', 'cash_amount', 'credit_card_amount', 'gcash_amount', 
        'grab_amount', 'panda_amount', 'total_discount', 'order_type', 'action'];
    @ViewChild(MatPaginator) paginator !:MatPaginator;
    @ViewChild(MatSort) sort !:MatSort;
    
    filterDate = new FormControl(new Date());
    selectedCutOff: string = 'ALL';
    cutOffOptions: string[] = ['ALL', 'AM', 'PM'];

    constructor(
        private orderService: OrderService,
        public datePipe: DatePipe
    ) {}

    ngOnInit() {
        this.getAll(new Date(), 'ALL');
    }

    getAll(filterDate: any, cut_off: string) {
        this.orderService.getAll(filterDate, cut_off)
            .pipe(first())
            .subscribe(orders => {
                this.orders = orders;
                this.dataSource = new MatTableDataSource<Order>(this.orders);
                this.dataSource.paginator=this.paginator;
                this.dataSource.sort=this.sort;
                this.dataSource.filterPredicate = (data: any, filter: string) => {
                    const dataDate = new Date(data.transaction_date);
                    const filterDate = new Date(filter);
                    
                    return data.or_number?.toLocaleLowerCase().includes(filter) ||
                    (
                        dataDate.getFullYear() === filterDate.getFullYear() &&
                        dataDate.getMonth() === filterDate.getMonth() &&
                        dataDate.getDate() === filterDate.getDate()
                    );
                }
            });
    }

    filterChange(data: Event){
        const value = (data.target as HTMLInputElement).value;
        this.dataSource.filter = value;
    }

    exportTable() {
        TableUtil.exportTableToExcel("orders", "Orders");
    }

    onDateChange(event: any) {
        const selectedDate = event.value;
        this.getAll(new Date(selectedDate), CutOff.AM)
        this.dataSource.filter = this.datePipe.transform(selectedDate, 'yyyy-MM-dd HH:mm:ss');
    }
    
    getTotalAmount() {
        return this.orders?.map(t => t.total_amount).reduce((acc: any, value) => acc + value, 0);    
    }

    getTotalCash() {
        return this.orders?.map(t => t.cash_amount).reduce((acc: any, value) => acc + value, 0);    
    }

    getTotalCC() {
        return this.orders?.map(t => t.credit_card_amount).reduce((acc: any, value) => acc + value, 0);    
    }

    getTotalGCash() {
        return this.orders?.map(t => t.gcash_amount).reduce((acc: any, value) => acc + value, 0);    
    }

    getTotalGrab() {
        return this.orders?.map(t => t.grab_amount).reduce((acc: any, value) => acc + value, 0);    
    }

    getTotalPanda() {
        return this.orders?.map(t => t.panda_amount).reduce((acc: any, value) => acc + value, 0);    
    }

    getTotalDiscounts() {
        return this.orders?.map(t => t.total_discount).reduce((acc: any, value) => acc + value, 0);    
    }

    applyFilterCutOff() {
        console.log('applyFilterCutOff...', this.selectedCutOff);
        this.getAll(new Date(), this.selectedCutOff);
    }
}
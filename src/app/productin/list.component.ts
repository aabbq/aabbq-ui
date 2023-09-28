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

import { TableUtil } from '@app/_helpers/table.util';
import { ProductIn } from '@app/_models/product-in';
import { ProductInService } from '@app/_services/product-in.service';
import { FormControl, FormGroup } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';

@Component({ 
    selector: 'product-in-list-component',
    templateUrl: 'list.component.html',
    styleUrls: ['product-ins.component.css'],
    standalone: true,
    imports: [
        RouterLink, NgFor, NgIf, CommonModule, ReactiveFormsModule,
        MatCardModule, MatButtonModule, MatInputModule, MatFormFieldModule, MatTableModule, MatPaginatorModule, MatSortModule,
        MatIconModule, MatDatepickerModule, MatNativeDateModule
    ],
    providers: [DatePipe]
})
export class ListComponent implements OnInit {

    productIns?: ProductIn[];
    dataSource: any;
    displayedColumns: string[] = ['id', 'transaction_date', 'cutoff', 'product', 'qty', 'action'];
    @ViewChild(MatPaginator) paginator !:MatPaginator;
    @ViewChild(MatSort) sort !:MatSort;
    
    filterDate = new FormControl(new Date());

    constructor(
        private productInService: ProductInService,
        public datePipe: DatePipe
    ) {}

    ngOnInit() {
        this.getAll(new Date());
    }

    getAll(filterDate: any) {
        this.productInService.getAll(filterDate)
            .pipe(first())
            .subscribe(productIns => {
                this.productIns = productIns;
                this.dataSource = new MatTableDataSource<ProductIn>(this.productIns);
                this.dataSource.paginator=this.paginator;
                this.dataSource.sort=this.sort;
                this.dataSource.filterPredicate = (data: any, filter: string) => {
                    const dataDate = new Date(data.transaction_date);
                    const filterDate = new Date(filter);
                    console.log(filter)
                    return data.product?.name?.toLocaleLowerCase().includes(filter) ||
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
        TableUtil.exportTableToExcel("productIns", "Product Ins");
    }

    onDateChange(event: any) {
        const selectedDate = event.value;
        console.log(this.datePipe.transform(selectedDate, 'MM/dd/yyyy'));
        this.getAll(new Date(selectedDate))
        this.dataSource.filter = this.datePipe.transform(selectedDate, 'yyyy-MM-dd HH:mm:ss');
    }
    

}
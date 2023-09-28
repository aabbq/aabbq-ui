import { Component, OnInit, ViewChild } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
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

import { TableUtil } from '@app/_helpers/table.util';
import { ProductCategory } from '@app/_models/product-category';
import { ProductCategoryService } from '@app/_services';

@Component({ 
    selector: 'product-category-list-component',
    templateUrl: 'list.component.html',
    styleUrls: ['product-categorys.component.css'],
    standalone: true,
    imports: [
        RouterLink, NgFor, NgIf,
        MatCardModule, MatButtonModule, MatInputModule, MatFormFieldModule, MatTableModule, MatPaginatorModule, MatSortModule,
        MatIconModule
    ]
})
export class ListComponent implements OnInit {

    categories?: ProductCategory[];
    dataSource: any;
    displayedColumns: string[] = ['id', 'name', 'status', 'action'];
    @ViewChild(MatPaginator) paginator !:MatPaginator;
    @ViewChild(MatSort) sort !:MatSort;
    
    constructor(private productCategoryService: ProductCategoryService) {}

    ngOnInit() {
        this.getBanks();
    }

    getBanks() {
        this.productCategoryService.getAll()
            .pipe(first())
            .subscribe(categories => {
                this.categories = categories;
                this.dataSource = new MatTableDataSource<ProductCategory>(this.categories);
                this.dataSource.paginator=this.paginator;
                this.dataSource.sort=this.sort;
            });
    }

    filterChange(data: Event){
        const value = (data.target as HTMLInputElement).value;
        this.dataSource.filter = value;
    }

    exportTable() {
        TableUtil.exportTableToExcel("product-categories", "Product Categories");
    }
}
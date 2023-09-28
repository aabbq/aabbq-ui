import { Component, OnInit, ViewChild } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { first } from 'rxjs/operators';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';

import { Product } from '@app/_models';
import { ProductService } from '@app/_services/product.service';
import { TableUtil } from '@app/_helpers/table.util';
import { ConfirmationDialog } from '@app/_components/dialog/confirmation-dialog.component';
import { AlertService } from '@app/_components/alert/alert.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

@Component({ 
    templateUrl: 'list.component.html',
    styleUrls: ['products.component.css'],
    standalone: true,
    imports: [
        RouterLink, NgFor, NgIf,
        MatCardModule, MatButtonModule, MatInputModule, MatFormFieldModule, MatTableModule, MatPaginatorModule, MatSortModule,
        MatIconModule, MatDialogModule
    ]
})
export class ListComponent implements OnInit {

    products?: Product[];
    dataSource: any;
    displayedColumns: string[] = ['id', 'category', 'name', 'uom', 'qty', 'status', 'action'];
    @ViewChild(MatPaginator) paginator !:MatPaginator;
    @ViewChild(MatSort) sort !:MatSort;
    isDeleting = false;

    options = {
        autoClose: true,
        keepAfterRouteChange: true
    };

    constructor(
        private productService: ProductService,
        private alertService: AlertService,
        private router: Router,
        public dialog: MatDialog
    ) {}

    ngOnInit() {
        this.getProducts();
    }

    getProducts() {
        this.productService.getAll()
            .pipe(first())
            .subscribe(products => {
                this.products = products;
                this.dataSource = new MatTableDataSource<Product>(this.products);
                this.dataSource.paginator=this.paginator;
                this.dataSource.sort=this.sort;
            });
    }

    filterChange(data: Event){
        const value = (data.target as HTMLInputElement).value;
        this.dataSource.filter = value;
    }

    exportTable() {
        TableUtil.exportTableToExcel("products", "Products");
    }

    delete(id: string) {
        this.isDeleting = true;
        this.productService.delete(id)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.isDeleting = false;
                    // this.alertService.success('Product Inventory Batch created', this.options);
                    this.getProducts();
                    // this.router.navigateByUrl('/products');
                }
            });
    }

    openDialog(detailId: any) {
        const dialogRef = this.dialog.open(ConfirmationDialog, {
            data: {
                title: 'Delete Product',
                message: 'Are you sure want to delete?',
                buttonText: {
                    ok: 'Yes',
                    cancel: 'Cancel'
                }
            }
        });

        dialogRef.afterClosed().subscribe((confirmed: boolean) => {
            if (confirmed) {
                this.productService.delete(detailId)
                    .pipe(first())
                    .subscribe({
                        next: () => {
                            this.alertService.success('Product deleted', this.options);
                            this.router.navigateByUrl('/products').then(() => {
                                window.location.reload();
                            });
                        },
                    })
            }
        });
    }
}
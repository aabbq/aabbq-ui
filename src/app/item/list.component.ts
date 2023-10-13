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

import { Item } from '@app/_models';
import { ItemService } from '@app/_services/item.service';
import { TableUtil } from '@app/_helpers/table.util';

@Component({ 
    selector: 'item-list-component',
    templateUrl: 'list.component.html',
    styleUrls: ['items.component.css'],
    standalone: true,
    imports: [
        RouterLink, NgFor, NgIf,
        MatCardModule, MatButtonModule, MatInputModule, MatFormFieldModule, MatTableModule, MatPaginatorModule, MatSortModule,
        MatIconModule
    ]
})
export class ListComponent implements OnInit {

    items?: Item[];
    dataSource: any;
    displayedColumns: string[] = ['id', 'name', 'description', 'uom', 'status', 'action'];
    @ViewChild(MatPaginator) paginator !:MatPaginator;
    @ViewChild(MatSort) sort !:MatSort;
    
    constructor(private itemService: ItemService) {}

    ngOnInit() {
        this.getItems();
    }

    getItems() {
        this.itemService.getAll()
            .pipe(first())
            .subscribe(items => {
                this.items = items;
                this.dataSource = new MatTableDataSource<Item>(this.items);
                this.dataSource.paginator=this.paginator;
                this.dataSource.sort=this.sort;
            });
    }

    filterChange(data: Event){
        const value = (data.target as HTMLInputElement).value;
        this.dataSource.filter = value;
    }

    exportTable() {
        TableUtil.exportTableToExcel("items", "Items", 0, 5);
    }
}
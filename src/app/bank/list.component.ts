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

import { Bank } from '@app/_models';
import { BankService } from '@app/_services/bank.service';
import { TableUtil } from '@app/_helpers/table.util';

@Component({ 
    selector: 'bank-list-component',
    templateUrl: 'list.component.html',
    styleUrls: ['banks.component.css'],
    standalone: true,
    imports: [
        RouterLink, NgFor, NgIf,
        MatCardModule, MatButtonModule, MatInputModule, MatFormFieldModule, MatTableModule, MatPaginatorModule, MatSortModule,
        MatIconModule
    ]
})
export class ListComponent implements OnInit {

    banks?: Bank[];
    dataSource: any;
    displayedColumns: string[] = ['id', 'name', 'description', 'status', 'action'];
    @ViewChild(MatPaginator) paginator !:MatPaginator;
    @ViewChild(MatSort) sort !:MatSort;
    
    constructor(private bankService: BankService) {}

    ngOnInit() {
        this.getBanks();
    }

    getBanks() {
        this.bankService.getAll()
            .pipe(first())
            .subscribe(banks => {
                this.banks = banks;
                this.dataSource = new MatTableDataSource<Bank>(this.banks);
                this.dataSource.paginator=this.paginator;
                this.dataSource.sort=this.sort;
            });
    }

    filterChange(data: Event){
        const value = (data.target as HTMLInputElement).value;
        this.dataSource.filter = value;
    }

    exportTable() {
        TableUtil.exportTableToExcel("banks", "Banks", 0, 4);
    }
}
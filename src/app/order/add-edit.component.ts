import { Component, OnInit, } from '@angular/core';
import { NgIf, NgClass, CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { first, map, startWith } from 'rxjs/operators';

import { AlertService } from '@app/_components/alert/alert.service';
import { merge, Observable, Subscription } from 'rxjs';
import { Order } from '@app/_models/order';
import { OrderService } from '@app/_services/order.service';
import { OrderDetail } from '@app/_models/order-detail';
import { PaymentType } from '@app/_helpers/enums/payment-type';
import { ConfirmationDialog } from '@app/_components/dialog/confirmation-dialog.component';
import { OrderType } from '@app/_helpers/enums/order-type';
import { Bank } from '@app/_models';
import { BankService } from '@app/_services';

@Component({
    selector: 'order-add-edit-component',
    templateUrl: 'add-edit.component.html',
    styleUrls: ['orders.component.css'],
    standalone: true,
    imports: [
        NgIf, ReactiveFormsModule, NgClass, CommonModule, RouterLink,
        MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule,
        MatSelectModule, MatAutocompleteModule, MatTableModule, MatDialogModule,
        MatCheckboxModule
    ]
})
export class AddEditComponent implements OnInit {

    form!: FormGroup;
    id?: string;
    title!: string;
    loading = false;
    submitting = false;
    submitted = false;
    totalAmount!: number;
    sub!: Subscription;

    options = {
        autoClose: true,
        keepAfterRouteChange: true
    };

    filteredOptions!: Observable<Bank[]>;

    orderDetails!: OrderDetail[];
    dataSource: any;
    displayedColumns: string[] = ['product', 'qty', 'price', 'total', 'action'];

    banks!: Bank[];

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private orderService: OrderService,
        private alertService: AlertService,
        public dialog: MatDialog,
        private bankService: BankService,
    ) { }

    ngOnInit() {
        this.id = this.route.snapshot.params['id'];

        // form with validation rules
        this.form = this.formBuilder.group({
            or_number: [''],
            ordered_to: [''],
            address: [''],
            business_name: [''],
            description: [''],
            payment_type: [PaymentType.CASH, Validators.required],
            total_amount: [0],
            order_type: [OrderType.DINEIN, Validators.required],
            cash_amount: [0],
            gcash_amount: [0],
            grab_amount: [0],
            panda_amount: [0],
            credit_card: [false],
            credit_card_amount: [0],
            credit_card_bank: [''],
            credit_card_ref_num: [''],
            total_discount: [0]
            // status: [Status.ENABLED, Validators.required]
        });

        this.title = 'Add Order';
        if (this.id) {
            // edit mode
            this.title = 'Edit Order';
            this.loading = true;
            this.orderService.getById(this.id)
                .pipe(first())
                .subscribe(x => {
                    this.orderDetails = x.details;
                    this.dataSource = new MatTableDataSource<OrderDetail>(this.orderDetails);
                    // x.cash_amount = x.total_amount;
                    this.totalAmount = x.total_amount ? x.total_amount : 0;
                    this.form.patchValue(x);
                    this.loading = false;
                });
        }

        this.loadBanks();

        this.filteredOptions = this.form.get('credit_card_bank')!.valueChanges.pipe(
            startWith(''),
            map(value => {
                const name = typeof value === 'string' ? value : value?.name;
                return name ? this._listfilter(name as string) : this.banks?.slice();
            }),
        );

        this.sub = merge(
            this.form.get('credit_card_amount')!.valueChanges,
            this.form.get('total_amount')!.valueChanges,
        ).subscribe((res: any) => {
            // this.computeCash();
        })

    }

    // convenience getter for easy access to form fields
    get f() { return this.form.controls; }

    onSubmit() {
        this.submitted = true;

        // reset alerts on submit
        this.alertService.clear();

        // stop here if form is invalid
        if (this.form.invalid) {
            return;
        }

        // if (this.form.get('gcash_amount')?.value > this.form.get('total_amount')?.value) { 
        //     this.alertService.error("GCash amount must not exceed the total amount!!!", this.options);
        //     return;
        // }

        this.submitting = true;

        
        if (this.form.get('gcash_amount')?.value > 0) { 
            this.form.get('cash_amount')?.setValue('0');
            this.form.get('grab_amount')?.setValue('0');
            this.form.get('panda_amount')?.setValue('0');  
        }
        if (this.form.get('grab_amount')?.value > 0) { 
            this.form.get('cash_amount')?.setValue('0'); 
            this.form.get('gcash_amount')?.setValue('0'); 
            this.form.get('panda_amount')?.setValue('0');
        }
        if (this.form.get('panda_amount')?.value > 0) { 
            this.form.get('cash_amount')?.setValue('0'); 
            this.form.get('gcash_amount')?.setValue('0');
            this.form.get('grab_amount')?.setValue('0'); 
        }
        // if (this.form.get('total_discount')?.value > 0) { 
        //     const total_discount = +this.form.get('total_discount')?.value;
        //     const total_amount = +this.form.get('total_amount')?.value;
        //     this.form.get('total_amount')?.setValue(total_amount - total_discount);
        // } 

        // if (this.form.get('credit_card_amount')?.value > 0) { 
        //     const cash_amount = +this.form.get('cash_amount')?.value;
        //     const credit_card_amount = +this.form.get('credit_card_amount')?.value;
        //     this.form.get('cash_amount')?.setValue(cash_amount - credit_card_amount); 
        // }

        this.saveOrder()
            .pipe(first())
            .subscribe({
                next: (o: Order) => {
                    this.alertService.success('Order saved', this.options);
                    if (this.id) this.submitting = false;
                    this.router.navigateByUrl('/orders/edit/' + o.id).then(() => {
                        window.location.reload();
                    });
                },
                error: (error: string) => {
                    this.alertService.error(error, this.options);
                    this.submitting = false;
                }
            })
    }

    private saveOrder() {
        // create or update order based on id param
        return this.id
            ? this.orderService.update(this.id!, this.form.value)
            : this.orderService.create(this.form.value);
    }

    addDetail() {
        this.router.navigateByUrl('/orders/add-detail/' + this.id);
    }

    editDetail(detailId: any) {
        this.router.navigateByUrl('/orders/edit-detail/' + detailId);
    }

    // deleteDetail(detailId: any) {
    //     this.deleteOrderDetail(detailId)
    //         .pipe(first())
    //         .subscribe({
    //             next: () => {
    //                 this.alertService.success('Order detail deleted', this.options);
    //                 this.router.navigateByUrl('/orders/edit/'+this.id).then(()=>{
    //                     window.location.reload();
    //                 });
    //             },
    //             error: (error: string) => {
    //                 this.alertService.error(error, this.options);
    //             }
    //         })
    // }

    private deleteOrderDetail(detailId: any) {
        return this.orderService.deleteDetail(detailId);
    }

    openDialog(detailId: any) {
        const dialogRef = this.dialog.open(ConfirmationDialog, {
            data: {
                title: 'Remove order detail',
                message: 'Are you sure want to remove?',
                buttonText: {
                    ok: 'Yes',
                    cancel: 'Cancel'
                }
            }
        });

        dialogRef.afterClosed().subscribe((confirmed: boolean) => {
            if (confirmed) {
                this.deleteOrderDetail(detailId)
                    .pipe(first())
                    .subscribe({
                        next: () => {
                            this.alertService.success('Order detail deleted', this.options);
                            this.router.navigateByUrl('/orders/edit/' + this.id).then(() => {
                                window.location.reload();
                            });
                        },
                        error: (error: string) => {
                            this.alertService.error(error, this.options);
                        }
                    })
            }
        });
    }

    computeCash() {
        const cc_amount = +this.form.get('credit_card_amount')?.value;
        const total_amount = +this.form.get('total_amount')?.value;
        this.form.get('cash_amount')?.setValue(total_amount - cc_amount);
    }

    loadBanks() {
        this.bankService.getAllEnabled().subscribe(banks => {
            this.banks = banks;
        })
    }

    private _listfilter(name: string): Bank[] {
        const filterValue = name.toLowerCase();
        return this.banks.filter(option => option.name?.toLowerCase().includes(filterValue));
    }

    displayFn(bank: string): string {
        return bank;
        // return bank && bank.name ? bank.name : '';
    }

    updateCreditCard() {
        if (!this.form.get('credit_card')?.value) {
            this.form.get('credit_card_amount')?.setValue(0);
            this.form.get('credit_card_bank')?.setValue('');
            this.form.get('credit_card_ref_num')?.setValue('');
        }
    }

    resetPaymentAmounts(){
        // console.log('resetPaymentAmounts');
        if(this.form.get('payment_type')?.value === 'CASH'){
            console.log('resetPaymentAmounts');
            const total_discount = +this.form.get('total_discount')?.value;
            const total_amount = +this.form.get('total_amount')?.value;
            console.log(total_discount + total_amount);
            this.form.get('cash_amount')?.setValue(total_discount + total_amount);
        }
        // this.form.get('cash_amount')?.setValue('0');
        this.form.get('gcash_amount')?.setValue('0');
        this.form.get('grab_amount')?.setValue('0');
        this.form.get('panda_amount')?.setValue('0');  
    }

    getTotalAmount() {
        return this.orderDetails?.map(t => t.total).reduce((acc: any, value) => acc + value, 0);    
    }

}
import { Component, OnInit,  } from '@angular/core';
import { NgIf, NgClass, CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { first, map, startWith } from 'rxjs/operators';

import { AlertService } from '@app/_components/alert/alert.service';
import { merge, Observable, Subscription } from 'rxjs';
import { Order } from '@app/_models/order';
import { OrderService } from '@app/_services/order.service';
import { OrderDetail } from '@app/_models/order-detail';
import { ProductService } from '@app/_services';
import { Product } from '@app/_models';

@Component({ 
    selector: 'order-add-edit-detail-component',
    templateUrl: 'add-edit-detail.component.html',
    styleUrls: ['orders.component.css'],
    standalone: true,
    imports: [
        NgIf, ReactiveFormsModule, NgClass, CommonModule, RouterLink,
        MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule,
        MatSelectModule, MatAutocompleteModule
    ]
})
export class AddEditDetailComponent implements OnInit {
    form!: FormGroup;
    id?: string;
    orderId?: string;
    title!: string;
    loading = false;
    submitting = false;
    submitted = false;
    sub!:Subscription
    
    options = {
        autoClose: true,
        keepAfterRouteChange: true
    };

    // filteredOptions!: Observable<Order[]>;
    products!:Product[];
    filteredOptions!: Observable<Product[]>;

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private orderService: OrderService,
        private productService: ProductService,
        private alertService: AlertService
    ) { }

    ngOnInit() {
        this.orderId = this.route.snapshot.params['orderId'];
        this.id = this.route.snapshot.params['id'];
        
        // form with validation rules
        this.form = this.formBuilder.group({
            product: ['', Validators.required],
            qty: [0, Validators.required],
            price: [0, Validators.required],
            total: [0],
            orderId: [this.orderId],
            // status: [Status.ENABLED, Validators.required]
        });

        this.title = 'Add Order Detail';
        if (this.id) {
            // edit mode
            this.title = 'Edit Order Detail';
            this.loading = true;
            this.orderService.getDetailById(this.id)
                .pipe(first())
                .subscribe(x => {
                    this.orderId = x.order?.id;
                    this.form.patchValue(x);
                    this.loading = false;
                });
        }

        this.loadProducts();

        this.filteredOptions = this.form.get('product')!.valueChanges.pipe(
            startWith(''),
            map(value => {
                const name = typeof value === 'string' ? value : value?.name;
                return name ? this._listfilter(name as string) : this.products?.slice();
            }),
        );

        this.sub=merge(
            this.form.get('qty')!.valueChanges,
            this.form.get('price')!.valueChanges
          ).subscribe((res:any)=>{
            this.computeTotal()
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
        
        this.submitting = true;
        this.saveOrder()
            .pipe(first())
            .subscribe({
                next: ( o: OrderDetail) => {
                    this.alertService.success('Order saved', this.options);
                    if(this.id) this.submitting = false;
                    this.router.navigateByUrl('/orders/edit/'+o.order?.id).then(() => {
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
            ? this.orderService.updateDetail(this.id!, this.form.value)
            : this.orderService.createDetail(this.form.value);
    }

    loadProducts(){
        this.productService.getAllEnabledQty().subscribe(products => {
            this.products = products;
        })
    }

    private _listfilter(name: string): Product[] {
        const filterValue = name.toLowerCase();
        return this.products?.filter(option => option.name?.toLowerCase().includes(filterValue));
    }

    displayFn(product: Product): string {
        return product && product.name ? product.name + ' - ' + product.qty : '';
    }

    computeTotal() {
        const qty=+this.form.get('qty')?.value
        const price=+this.form.get('price')?.value
        this.form.get('total')?.setValue(qty*price)
    }
}
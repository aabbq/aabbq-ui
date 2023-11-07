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

import { ProductService } from '@app/_services';
import { AlertService } from '@app/_components/alert/alert.service';
import { ProductInService } from '@app/_services/product-in.service';
import { Product } from '@app/_models';
import { Observable } from 'rxjs';
import { CutOff } from '@app/_helpers/enums/prod-inv';

@Component({ 
    selector: 'product-in-add-edit-component',
    templateUrl: 'add-edit.component.html',
    styleUrls: ['product-ins.component.css'],
    standalone: true,
    imports: [
        NgIf, ReactiveFormsModule, NgClass, CommonModule, RouterLink,
        MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule,
        MatSelectModule, MatAutocompleteModule
    ]
})
export class AddEditComponent implements OnInit {
    form!: FormGroup;
    id?: string;
    title!: string;
    loading = false;
    submitting = false;
    submitted = false;
    prodName?: string;

    options = {
        autoClose: true,
        keepAfterRouteChange: true
    };

    // myControl = new FormControl('');
    products!:Product[];
    filteredOptions!: Observable<Product[]>;

    isDateGreaterThan: boolean = false;

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private productInService: ProductInService,
        private productService: ProductService,
        private alertService: AlertService
    ) { }

    ngOnInit() {
        this.id = this.route.snapshot.params['id'];

        // Replace this with the date you want to check
        const today = new Date(); // This creates a Date object representing the current date and time.

        // Create a Date object for 15:00 (3:00 PM)
        const threePM = new Date();
        threePM.setHours(15, 0, 0, 0); // Set the time to 15:00:00.000
        
        // Compare the time component of the givenDate with 15:00
        this.isDateGreaterThan = today.getTime() < threePM.getTime();

        // form with validation rules
        this.form = this.formBuilder.group({
            product: ['', Validators.required],
            qty: [0, Validators.required],
            description: [''],
            cutoff: [this.isDateGreaterThan ? CutOff.AM : CutOff.PM, Validators.required]
            // status: [Status.ENABLED, Validators.required]
        });

        this.loadProducts();

        this.title = 'Add Product In';
        if (this.id) {
            // edit mode
            this.title = 'Edit Product In';
            this.loading = true;
            this.productInService.getById(this.id)
                .pipe(first())
                .subscribe(x => {
                    this.form.get('product')?.patchValue(x.product);
                    this.prodName = x.product?.name;
                    this.form.patchValue(x);
                    this.loading = false;
                });
        }

        this.filteredOptions = this.form.get('product')!.valueChanges.pipe(
            startWith(''),
            map(value => {
                const name = typeof value === 'string' ? value : value?.name;
                return name ? this._listfilter(name as string) : this.products?.slice();
            }),
        );
        
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
        this.saveProduct()
            .pipe(first())
            .subscribe({
                next: () => {
                    this.alertService.success('Product In saved', this.options);
                    this.router.navigateByUrl('/product-ins');
                },
                error: (error: string) => {
                    this.alertService.error(error, this.options);
                    this.submitting = false;
                }
            })
    }

    private saveProduct() {
        // create or update product based on id param
        return this.id
            ? this.productInService.update(this.id!, this.form.value)
            : this.productInService.create(this.form.value);
    }

    loadProducts(){
        this.productService.getAllEnabled().subscribe(products => {
            this.products = products;
        })
    }

    private _listfilter(name: string): Product[] {
        const filterValue = name.toLowerCase();
        return this.products.filter(option => option.name?.toLowerCase().includes(filterValue));
    }

    displayFn(product: Product): string {
        return product && product.name ? product.name : '';
    }

}
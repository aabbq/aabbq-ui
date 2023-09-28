import { Component, OnInit } from '@angular/core';
import { NgIf, NgClass, CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { first, map, startWith } from 'rxjs/operators';

import { ProductCategoryService, ProductService } from '@app/_services';
import { Status } from '@app/_helpers/enums/status';
import { UOM } from '@app/_helpers/enums/uom';
import { AlertService } from '@app/_components/alert/alert.service';
import { ProductCategory } from '@app/_models/product-category';
import { Observable } from 'rxjs';

@Component({ 
    selector: 'product-add-edit-component',
    templateUrl: 'add-edit.component.html',
    styleUrls: ['products.component.css'],
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

    options = {
        autoClose: true,
        keepAfterRouteChange: true
    };

    categories!: ProductCategory[];

    filteredOptions!: Observable<ProductCategory[]>;

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private productService: ProductService,
        private alertService: AlertService,
        private categoryService: ProductCategoryService
    ) { }

    ngOnInit() {
        this.id = this.route.snapshot.params['id'];

        // form with validation rules
        this.form = this.formBuilder.group({
            name: ['', Validators.required],
            description: [''],
            uom: [UOM.PC, Validators.required],
            status: [Status.ENABLED, Validators.required],
            qty: [0],
            category: [''],
        });

        this.loadCategories();

        this.title = 'Add Product';
        if (this.id) {
            // edit mode
            this.title = 'Edit Product';
            this.loading = true;
            this.productService.getById(this.id)
                .pipe(first())
                .subscribe(x => {
                    this.form.patchValue(x);
                    this.loading = false;
                });
        }
        
        this.filteredOptions = this.form.get('category')!.valueChanges.pipe(
            startWith(''),
            map(value => {
                const name = typeof value === 'string' ? value : value?.name;
                return name ? this._listfilter(name as string) : this.categories?.slice();
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
                    this.alertService.success('Product saved', this.options);
                    this.router.navigateByUrl('/products');
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
            ? this.productService.update(this.id!, this.form.value)
            : this.productService.create(this.form.value);
    }

    loadCategories() {
        this.categoryService.getAllEnabled().subscribe(categories => {
            this.categories = categories;
        })
    }

    private _listfilter(name: string): ProductCategory[] {
        const filterValue = name.toLowerCase();
        return this.categories.filter(option => option.name?.toLowerCase().includes(filterValue));
    }

    displayFn(category: string): string {
        return category;
    }
}
import { Component, OnInit } from '@angular/core';
import { NgIf, NgClass } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { first } from 'rxjs/operators';

import { ItemService, AlertService } from '@app/_services';
import { Status } from '@app/_helpers/enums/status';
import { UOM } from '@app/_helpers/enums/uom';

@Component({ 
    templateUrl: 'add-edit.component.html',
    styleUrls: ['items.component.css'],
    standalone: true,
    imports: [
        NgIf, ReactiveFormsModule, NgClass, RouterLink,
        MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule,
        MatSelectModule
    ]
})
export class AddEditComponent implements OnInit {
    form!: FormGroup;
    id?: string;
    title!: string;
    loading = false;
    submitting = false;
    submitted = false;

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private itemService: ItemService,
        private alertService: AlertService
    ) { }

    ngOnInit() {
        this.id = this.route.snapshot.params['id'];

        // form with validation rules
        this.form = this.formBuilder.group({
            name: ['', Validators.required],
            description: [''],
            uom: [UOM.PC, Validators.required],
            status: [Status.ENABLED, Validators.required]
        });

        this.title = 'Add Item';
        if (this.id) {
            // edit mode
            this.title = 'Edit Item';
            this.loading = true;
            this.itemService.getById(this.id)
                .pipe(first())
                .subscribe(x => {
                    this.form.patchValue(x);
                    this.loading = false;
                });
        }
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
        this.saveItem()
            .pipe(first())
            .subscribe({
                next: () => {
                    this.alertService.success('Item saved', true);
                    this.router.navigateByUrl('/items');
                },
                error: (error: string) => {
                    this.alertService.error(error);
                    this.submitting = false;
                }
            })
    }

    private saveItem() {
        // create or update item based on id param
        return this.id
            ? this.itemService.update(this.id!, this.form.value)
            : this.itemService.create(this.form.value);
    }
}
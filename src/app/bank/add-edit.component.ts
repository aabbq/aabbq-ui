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

import { BankService } from '@app/_services';
import { Status } from '@app/_helpers/enums/status';
import { AlertService } from '@app/_components/alert/alert.service';

@Component({ 
    selector: 'bank-add-edit-component',
    templateUrl: 'add-edit.component.html',
    styleUrls: ['banks.component.css'],
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

    options = {
        autoClose: true,
        keepAfterRouteChange: true
    };

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private bankService: BankService,
        private alertService: AlertService
    ) { }

    ngOnInit() {
        this.id = this.route.snapshot.params['id'];

        // form with validation rules
        this.form = this.formBuilder.group({
            name: ['', Validators.required],
            description: [''],
            status: [Status.ENABLED, Validators.required]
        });

        this.title = 'Add Bank';
        if (this.id) {
            // edit mode
            this.title = 'Edit Bank';
            this.loading = true;
            this.bankService.getById(this.id)
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
        this.saveBank()
            .pipe(first())
            .subscribe({
                next: () => {
                    this.alertService.success('Bank saved', this.options);
                    this.router.navigateByUrl('/banks');
                },
                error: (error: string) => {
                    this.alertService.error(error, this.options);
                    this.submitting = false;
                }
            })
    }

    private saveBank() {
        // create or update bank based on id param
        return this.id
            ? this.bankService.update(this.id!, this.form.value)
            : this.bankService.create(this.form.value);
    }
}
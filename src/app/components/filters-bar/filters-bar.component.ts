import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { ScraperRequest } from '../../models/job.model';

@Component({
    selector: 'app-filters-bar',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    templateUrl: './filters-bar.component.html',
    styleUrls: ['./filters-bar.component.scss']
})
export class FiltersBarComponent implements OnInit {
    @Output() scrape = new EventEmitter<ScraperRequest>();
    @Input() isLoading = false;
    @Input() jobs: any[] = [];

    readonly ALLOWED_JOB_LEVELS = ['entry level', 'mid-senior level'];

    searchTermsInput = '';
    jobLevelInput = '';
    showSearchTermsAddInput = false;
    showJobLevelAddInput = false;
    searchTerms: string[] = [
        'software engineer',
        'software developer',
        'software entwickler',
        'software entwicklung',
        'full stack developer',
        'web developer',
        'web entwickler',
        'backend developer',
        'frontend developer'
    ];
    jobLevels: string[] = ['entry level', 'mid-senior level'];

    private readonly DEFAULT_VALUES = {
        SEARCH_TERMS: this.searchTerms,
        LINKEDIN_JOB_LEVEL_ALLOWED_VALUES: this.jobLevels,
        LOCATION: 'Munich, Germany',
        DISTANCE_MILES: 31,
        HOURS_OLD: 24,
        RESULTS_WANTED: 10
    };

    form: FormGroup;

    constructor(private fb: FormBuilder) {
        this.form = this.createForm();
    }

    ngOnInit(): void {
        // Form already initialized in constructor
    }

    private createForm(): FormGroup {
        return this.fb.group({
            SEARCH_TERMS: [this.searchTerms],
            LINKEDIN_JOB_LEVEL_ALLOWED_VALUES: [this.jobLevels],
            LOCATION: [this.DEFAULT_VALUES.LOCATION],
            DISTANCE_MILES: [this.DEFAULT_VALUES.DISTANCE_MILES],
            HOURS_OLD: [this.DEFAULT_VALUES.HOURS_OLD],
            RESULTS_WANTED: [this.DEFAULT_VALUES.RESULTS_WANTED]
        });
    }

    private initializeForm(): void {
        this.form = this.createForm();
    }

    addSearchTerm(): void {
        const term = this.searchTermsInput.trim();
        if (term) {
            if (!this.searchTerms.includes(term)) {
                this.searchTerms = [...this.searchTerms, term];
                this.form.patchValue({ SEARCH_TERMS: this.searchTerms });
            }
            this.searchTermsInput = '';
        }
    }

    removeSearchTerm(index: number): void {
        this.searchTerms = this.searchTerms.filter((_: string, i: number) => i !== index);
        this.form.patchValue({ SEARCH_TERMS: this.searchTerms });
    }

    addJobLevel(level: string): void {
        if (level && !this.jobLevels.includes(level)) {
            this.jobLevels = [...this.jobLevels, level];
            this.form.patchValue({ LINKEDIN_JOB_LEVEL_ALLOWED_VALUES: this.jobLevels });
            this.showJobLevelAddInput = false;
            this.jobLevelInput = '';
        }
    }

    getAvailableJobLevels(): string[] {
        return this.ALLOWED_JOB_LEVELS.filter(level => !this.jobLevels.includes(level));
    }

    removeJobLevel(index: number): void {
        this.jobLevels = this.jobLevels.filter((_: string, i: number) => i !== index);
        this.form.patchValue({ LINKEDIN_JOB_LEVEL_ALLOWED_VALUES: this.jobLevels });
    }

    onScrape(): void {
        if (this.form.valid && !this.isLoading) {
            this.scrape.emit(this.form.getRawValue());
        }
    }

    exportCSV(): void {
        if (!this.jobs || this.jobs.length === 0) {
            alert('No jobs to export.');
            return;
        }

        const headers = ['Title', 'Company', 'Location', 'Job Level', 'Date Posted', 'Job URL'];
        const rows = this.jobs.map(job => [
            job.title || '',
            job.company || '',
            job.location || '',
            job.job_level || '',
            job.date_posted || '',
            job.job_url || ''
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `linkedin-jobs-${new Date().toISOString().slice(0, 10)}.csv`);
        link.click();
        URL.revokeObjectURL(url);
    }

    onSearchTermKeydown(event: KeyboardEvent): void {
        if (event.key === 'Enter') {
            event.preventDefault();
            this.addSearchTerm();
        }
    }

    onSearchTermAddClick(): void {
        this.showSearchTermsAddInput = true;
        setTimeout(() => {
            const input = document.querySelector('.search-term-add-input') as HTMLInputElement;
            if (input) input.focus();
        });
    }

    onJobLevelAddClick(): void {
        this.showJobLevelAddInput = true;
        setTimeout(() => {
            const input = document.querySelector('.job-level-add-input') as HTMLInputElement;
            if (input) input.focus();
        });
    }

    cancelSearchTermAdd(): void {
        this.showSearchTermsAddInput = false;
        this.searchTermsInput = '';
    }

    cancelJobLevelAdd(): void {
        this.showJobLevelAddInput = false;
        this.jobLevelInput = '';
    }
}

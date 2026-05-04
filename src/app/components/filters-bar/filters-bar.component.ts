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

    // ─── Search Terms ──────────────────────────────────────────────────────────
    searchTermsInput = '';
    showSearchTermsAddInput = false;
    showSearchTermsError = false;
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
    companyExclusionTerms: string[] = [
        'Helsing',
        'Ferchau',
        'check24',
        'Bending Spoons',
        'BMW Group',
        'NVIDIA',
        'Amazon',
    ];
    positionExclusionTerms: string[] = [
        'Senior',
        'Lead',
        'Professor',
        'Projektleiter',
        'Manager',
        'ERP',
        'Defence',
        'Architect',
        'Architekt',
        'Working Student',
        'Werkstudent',
        'Internship',
        'Praktikum',
        'Head of',
        'Leiter',
        'Teamleiter',
        'Geschäftsführer',
        'Chief',
        'Masterthesis',
        'Masterarbeit',
        'Student assistant',
        'Embedded Software Engineer',
        'Site Reliability Engineer',
        'Staff Frontend Developer',
        'Praktikant',
    ];

    // ─── Job Levels ────────────────────────────────────────────────────────────
    // Job levels are now fixed (same as ALLOWED_JOB_LEVELS) — no add/remove
    showJobLevelsError = false;

    // ─── Exclusion Terms Input ─────────────────────────────────────────────────
    companyExclusionInput = '';
    showCompanyExclusionAddInput = false;
    positionExclusionInput = '';
    showPositionExclusionAddInput = false;

    // ─── Selections ───────────────────────────────────────────────────────────
    selectedSearchTerms: Set<string> = new Set();
    selectedJobLevels: Set<string> = new Set(); selectedCompanyExclusions: Set<string> = new Set();
    selectedPositionExclusions: Set<string> = new Set();
    form: FormGroup;

    private readonly DEFAULT_VALUES = {
        LOCATION: 'Munich, Germany',
        DISTANCE_MILES: 31,
        HOURS_OLD: 24,
        RESULTS_WANTED: 10,
        ALLOW_DEUTSCH: false
    };

    constructor(private fb: FormBuilder) {
        this.form = this.createForm();
    }

    ngOnInit(): void {
        // Initialize exclusion terms with all selected by default
        this.selectedCompanyExclusions = new Set(this.companyExclusionTerms);
        this.selectedPositionExclusions = new Set(this.positionExclusionTerms);
        this.form.patchValue({
            COMPANY_EXCLUSION_TERMS: Array.from(this.selectedCompanyExclusions),
            POSITION_EXCLUSION_TERMS: Array.from(this.selectedPositionExclusions)
        });
    }

    private createForm(): FormGroup {
        return this.fb.group({
            SEARCH_TERMS: [[]],
            LINKEDIN_JOB_LEVEL_ALLOWED_VALUES: [[]],
            LOCATION: [this.DEFAULT_VALUES.LOCATION],
            DISTANCE_MILES: [this.DEFAULT_VALUES.DISTANCE_MILES],
            HOURS_OLD: [this.DEFAULT_VALUES.HOURS_OLD],
            RESULTS_WANTED: [this.DEFAULT_VALUES.RESULTS_WANTED],
            ALLOW_DEUTSCH: [this.DEFAULT_VALUES.ALLOW_DEUTSCH],
            POSITION_EXCLUSION_TERMS: [[]],
            COMPANY_EXCLUSION_TERMS: [[]]
        });
    }

    // ─── Search Terms ──────────────────────────────────────────────────────────

    addSearchTerm(): void {
        const term = this.searchTermsInput.trim();
        if (term) {
            if (!this.searchTerms.includes(term)) {
                this.searchTerms = [...this.searchTerms, term];
            }
            this.searchTermsInput = '';
            this.showSearchTermsAddInput = false;
        }
    }

    removeSearchTerm(index: number): void {
        const term = this.searchTerms[index];
        this.searchTerms = this.searchTerms.filter((_: string, i: number) => i !== index);
        this.selectedSearchTerms.delete(term);
        this.form.patchValue({ SEARCH_TERMS: Array.from(this.selectedSearchTerms) });
        if (this.selectedSearchTerms.size === 0) this.showSearchTermsError = true;
    }

    toggleSearchTerm(term: string): void {
        if (this.selectedSearchTerms.has(term)) {
            this.selectedSearchTerms.delete(term);
        } else {
            this.selectedSearchTerms.add(term);
        }
        this.form.patchValue({ SEARCH_TERMS: Array.from(this.selectedSearchTerms) });
        this.showSearchTermsError = this.selectedSearchTerms.size === 0;
    }

    isSearchTermSelected(term: string): boolean {
        return this.selectedSearchTerms.has(term);
    }

    selectAllSearchTerms(): void {
        this.selectedSearchTerms = new Set(this.searchTerms);
        this.form.patchValue({ SEARCH_TERMS: Array.from(this.selectedSearchTerms) });
        this.showSearchTermsError = false;
    }

    deselectAllSearchTerms(): void {
        this.selectedSearchTerms.clear();
        this.form.patchValue({ SEARCH_TERMS: Array.from(this.selectedSearchTerms) });
        this.showSearchTermsError = true;
    }

    onSearchTermKeydown(event: KeyboardEvent): void {
        if (event.key === 'Enter') {
            event.preventDefault();
            this.addSearchTerm();
        } else if (event.key === 'Escape') {
            this.cancelSearchTermAdd();
        }
    }

    onSearchTermAddClick(): void {
        this.showSearchTermsAddInput = true;
        setTimeout(() => {
            const input = document.querySelector('.search-term-add-input') as HTMLInputElement;
            if (input) input.focus();
        });
    }

    cancelSearchTermAdd(): void {
        this.showSearchTermsAddInput = false;
        this.searchTermsInput = '';
    }

    // ─── Job Levels (toggle-only, no add/remove) ───────────────────────────────

    toggleJobLevel(level: string): void {
        if (this.selectedJobLevels.has(level)) {
            this.selectedJobLevels.delete(level);
        } else {
            this.selectedJobLevels.add(level);
        }
        this.form.patchValue({ LINKEDIN_JOB_LEVEL_ALLOWED_VALUES: Array.from(this.selectedJobLevels) });
        this.showJobLevelsError = this.selectedJobLevels.size === 0;
    }

    isJobLevelSelected(level: string): boolean {
        return this.selectedJobLevels.has(level);
    }

    selectAllJobLevels(): void {
        this.selectedJobLevels = new Set(this.ALLOWED_JOB_LEVELS);
        this.form.patchValue({ LINKEDIN_JOB_LEVEL_ALLOWED_VALUES: Array.from(this.selectedJobLevels) });
        this.showJobLevelsError = false;
    }

    deselectAllJobLevels(): void {
        this.selectedJobLevels.clear();
        this.form.patchValue({ LINKEDIN_JOB_LEVEL_ALLOWED_VALUES: Array.from(this.selectedJobLevels) });
        this.showJobLevelsError = true;
    }

    // ─── Exclusion Terms (Positions and Companies) ──────────────────────────────

    toggleCompanyExclusion(term: string): void {
        if (this.selectedCompanyExclusions.has(term)) {
            this.selectedCompanyExclusions.delete(term);
        } else {
            this.selectedCompanyExclusions.add(term);
        }
        this.form.patchValue({ COMPANY_EXCLUSION_TERMS: Array.from(this.selectedCompanyExclusions) });
    }

    isCompanyExclusionSelected(term: string): boolean {
        return this.selectedCompanyExclusions.has(term);
    }

    selectAllCompanyExclusions(): void {
        this.selectedCompanyExclusions = new Set(this.companyExclusionTerms);
        this.form.patchValue({ COMPANY_EXCLUSION_TERMS: Array.from(this.selectedCompanyExclusions) });
    }

    deselectAllCompanyExclusions(): void {
        this.selectedCompanyExclusions.clear();
        this.form.patchValue({ COMPANY_EXCLUSION_TERMS: Array.from(this.selectedCompanyExclusions) });
    }

    togglePositionExclusion(term: string): void {
        if (this.selectedPositionExclusions.has(term)) {
            this.selectedPositionExclusions.delete(term);
        } else {
            this.selectedPositionExclusions.add(term);
        }
        this.form.patchValue({ POSITION_EXCLUSION_TERMS: Array.from(this.selectedPositionExclusions) });
    }

    isPositionExclusionSelected(term: string): boolean {
        return this.selectedPositionExclusions.has(term);
    }

    selectAllPositionExclusions(): void {
        this.selectedPositionExclusions = new Set(this.positionExclusionTerms);
        this.form.patchValue({ POSITION_EXCLUSION_TERMS: Array.from(this.selectedPositionExclusions) });
    }

    deselectAllPositionExclusions(): void {
        this.selectedPositionExclusions.clear();
        this.form.patchValue({ POSITION_EXCLUSION_TERMS: Array.from(this.selectedPositionExclusions) });
    }

    // ─── Add/Remove Company Exclusions ─────────────────────────────────────────

    addCompanyExclusion(): void {
        const term = this.companyExclusionInput.trim();
        if (term) {
            if (!this.companyExclusionTerms.includes(term)) {
                this.companyExclusionTerms = [...this.companyExclusionTerms, term];
            }
            this.companyExclusionInput = '';
            this.showCompanyExclusionAddInput = false;
        }
    }

    removeCompanyExclusion(index: number): void {
        const term = this.companyExclusionTerms[index];
        this.companyExclusionTerms = this.companyExclusionTerms.filter((_: string, i: number) => i !== index);
        this.selectedCompanyExclusions.delete(term);
        this.form.patchValue({ COMPANY_EXCLUSION_TERMS: Array.from(this.selectedCompanyExclusions) });
    }

    onCompanyExclusionKeydown(event: KeyboardEvent): void {
        if (event.key === 'Enter') {
            event.preventDefault();
            this.addCompanyExclusion();
        } else if (event.key === 'Escape') {
            this.cancelCompanyExclusionAdd();
        }
    }

    onCompanyExclusionAddClick(): void {
        this.showCompanyExclusionAddInput = true;
        setTimeout(() => {
            const input = document.querySelector('.company-exclusion-add-input') as HTMLInputElement;
            if (input) input.focus();
        });
    }

    cancelCompanyExclusionAdd(): void {
        this.showCompanyExclusionAddInput = false;
        this.companyExclusionInput = '';
    }

    // ─── Add/Remove Position Exclusions ────────────────────────────────────────

    addPositionExclusion(): void {
        const term = this.positionExclusionInput.trim();
        if (term) {
            if (!this.positionExclusionTerms.includes(term)) {
                this.positionExclusionTerms = [...this.positionExclusionTerms, term];
            }
            this.positionExclusionInput = '';
            this.showPositionExclusionAddInput = false;
        }
    }

    removePositionExclusion(index: number): void {
        const term = this.positionExclusionTerms[index];
        this.positionExclusionTerms = this.positionExclusionTerms.filter((_: string, i: number) => i !== index);
        this.selectedPositionExclusions.delete(term);
        this.form.patchValue({ POSITION_EXCLUSION_TERMS: Array.from(this.selectedPositionExclusions) });
    }

    onPositionExclusionKeydown(event: KeyboardEvent): void {
        if (event.key === 'Enter') {
            event.preventDefault();
            this.addPositionExclusion();
        } else if (event.key === 'Escape') {
            this.cancelPositionExclusionAdd();
        }
    }

    onPositionExclusionAddClick(): void {
        this.showPositionExclusionAddInput = true;
        setTimeout(() => {
            const input = document.querySelector('.position-exclusion-add-input') as HTMLInputElement;
            if (input) input.focus();
        });
    }

    cancelPositionExclusionAdd(): void {
        this.showPositionExclusionAddInput = false;
        this.positionExclusionInput = '';
    }

    // ─── ALLOW_DEUTSCH Toggle ──────────────────────────────────────────────────

    toggleAllowDeutsch(): void {
        const currentValue = this.form.get('ALLOW_DEUTSCH')?.value || false;
        this.form.patchValue({ ALLOW_DEUTSCH: !currentValue });
    }

    isAllowDeutschEnabled(): boolean {
        return this.form.get('ALLOW_DEUTSCH')?.value || false;
    }

    // ─── Validation ────────────────────────────────────────────────────────────

    isSearchTermsValid(): boolean {
        return this.selectedSearchTerms.size > 0;
    }

    isJobLevelsValid(): boolean {
        return this.selectedJobLevels.size > 0;
    }

    isFormValid(): boolean {
        return this.form.valid && this.isSearchTermsValid() && this.isJobLevelsValid();
    }

    // ─── Actions ───────────────────────────────────────────────────────────────

    onScrape(): void {
        // Trigger error messages on attempted scrape with invalid state
        this.showSearchTermsError = !this.isSearchTermsValid();
        this.showJobLevelsError = !this.isJobLevelsValid();

        if (!this.isLoading && this.isFormValid()) {
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
}
import { Component, EventEmitter, Output, Input, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { UserProfile, UserProfilePayload, DEFAULT_USER_PROFILE } from '../../models/user-profile.model';
import { UserProfileService } from '../../services/user-profile.service';

@Component({
    selector: 'app-filters-bar',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    templateUrl: './filters-bar.component.html',
    styleUrls: ['./filters-bar.component.scss']
})
export class FiltersBarComponent implements OnInit, OnDestroy {
    @Output() scrape = new EventEmitter<UserProfile>();
    @Input() isLoading = false;
    @Input() jobs: any[] = [];

    readonly ALLOWED_JOB_LEVELS = ['entry level', 'mid-senior level', 'internship'];

    profiles: UserProfile[] = [];
    selectedProfileId: string | null = null;
    profileName = '';
    isEditingProfileName = false;
    isCreatingProfile = false;
    profileStatusMessage: string | null = null;
    isProfilesLoading = false;
    isProfileSaving = false;

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

    // ─── Sites ────────────────────────────────────────────────────────────────
    // ─── Exclusion Terms Input ─────────────────────────────────────────────────
    companyExclusionInput = '';
    showCompanyExclusionAddInput = false;
    positionExclusionInput = '';
    showPositionExclusionAddInput = false;
    showCompanyExclusions = false;
    showPositionExclusions = false;

    // ─── Selections ───────────────────────────────────────────────────────────
    selectedSearchTerms: Set<string> = new Set();
    selectedJobLevels: Set<string> = new Set();
    selectedCompanyExclusions: Set<string> = new Set();
    selectedPositionExclusions: Set<string> = new Set();
    form: FormGroup;

    private readonly destroy$ = new Subject<void>();
    private readonly userProfileService = inject(UserProfileService);

    private readonly DEFAULT_VALUES = {
        allow_deutsch: DEFAULT_USER_PROFILE.allow_deutsch,
        last_hours: DEFAULT_USER_PROFILE.last_hours
    };

    constructor(private fb: FormBuilder) {
        this.form = this.createForm();
    }

    ngOnInit(): void {
        this.loadProfiles();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private createForm(): FormGroup {
        return this.fb.group({
            search_terms: [[]],
            job_levels: [[]],
            allow_deutsch: [this.DEFAULT_VALUES.allow_deutsch],
            last_hours: [this.DEFAULT_VALUES.last_hours, [Validators.required, Validators.min(1), Validators.pattern(/^\d+$/)]],
            excluded_positions: [[]],
            excluded_companies: [[]]
        });
    }

    private createBlankProfile(): UserProfile {
        return {
            profile_name: '',
            search_terms: [],
            job_levels: [],
            excluded_companies: [],
            excluded_positions: [],
            allow_deutsch: this.DEFAULT_VALUES.allow_deutsch,
            last_hours: this.DEFAULT_VALUES.last_hours
        };
    }

    private normalizeProfile(profile: Partial<UserProfile>): UserProfile {
        return {
            profile_id: profile.profile_id,
            profile_name: profile.profile_name?.trim() ?? '',
            search_terms: [...(profile.search_terms ?? [])],
            job_levels: [...(profile.job_levels ?? [])],
            excluded_companies: [...(profile.excluded_companies ?? [])],
            excluded_positions: [...(profile.excluded_positions ?? [])],
            allow_deutsch: Boolean(profile.allow_deutsch ?? this.DEFAULT_VALUES.allow_deutsch),
            last_hours: Number(profile.last_hours ?? this.DEFAULT_VALUES.last_hours)
        };
    }

    private mergeUniqueValues(existing: string[], incoming: string[]): string[] {
        const merged = [...existing];
        for (const value of incoming) {
            const trimmed = value.trim();
            if (trimmed && !merged.includes(trimmed)) {
                merged.push(trimmed);
            }
        }
        return merged;
    }

    private setProfileMessage(message: string | null): void {
        this.profileStatusMessage = message;
    }

    private syncSearchTerms(): void {
        this.form.patchValue({ search_terms: Array.from(this.selectedSearchTerms) });
        this.showSearchTermsError = this.selectedSearchTerms.size === 0;
    }

    private syncJobLevels(): void {
        this.form.patchValue({ job_levels: Array.from(this.selectedJobLevels) });
        this.showJobLevelsError = this.selectedJobLevels.size === 0;
    }

    private syncCompanyExclusions(): void {
        this.form.patchValue({ excluded_companies: Array.from(this.selectedCompanyExclusions) });
    }

    private syncPositionExclusions(): void {
        this.form.patchValue({ excluded_positions: Array.from(this.selectedPositionExclusions) });
    }

    private syncSelectionsFromProfile(profile: UserProfile): void {
        this.selectedSearchTerms = new Set(profile.search_terms ?? []);
        this.selectedJobLevels = new Set(profile.job_levels ?? []);
        this.selectedCompanyExclusions = new Set(profile.excluded_companies ?? []);
        this.selectedPositionExclusions = new Set(profile.excluded_positions ?? []);
        this.showSearchTermsError = false;
        this.showJobLevelsError = false;
    }

    private applyProfile(profile: UserProfile): void {
        const normalized = this.normalizeProfile(profile);
        this.selectedProfileId = normalized.profile_id ?? null;
        this.profileName = normalized.profile_name ?? '';
        this.isEditingProfileName = false;
        this.isCreatingProfile = false;
        this.searchTerms = [...normalized.search_terms];
        this.companyExclusionTerms = this.mergeUniqueValues(this.companyExclusionTerms, normalized.excluded_companies);
        this.positionExclusionTerms = this.mergeUniqueValues(this.positionExclusionTerms, normalized.excluded_positions);
        this.form.patchValue(
            {
                search_terms: [...normalized.search_terms],
                job_levels: [...normalized.job_levels],
                allow_deutsch: normalized.allow_deutsch,
                last_hours: normalized.last_hours,
                excluded_positions: [...normalized.excluded_positions],
                excluded_companies: [...normalized.excluded_companies]
            },
            { emitEvent: false }
        );
        this.syncSelectionsFromProfile(normalized);
        this.syncSearchTerms();
        this.syncJobLevels();
        this.syncCompanyExclusions();
        this.syncPositionExclusions();
        this.setProfileMessage(null);
    }

    private buildProfilePayload(): UserProfilePayload {
        const rawValue = this.form.getRawValue();

        return {
            profile_name: this.profileName.trim(),
            search_terms: Array.from(this.selectedSearchTerms),
            job_levels: Array.from(this.selectedJobLevels),
            excluded_companies: Array.from(this.selectedCompanyExclusions),
            excluded_positions: Array.from(this.selectedPositionExclusions),
            allow_deutsch: Boolean(rawValue.allow_deutsch),
            last_hours: Number(rawValue.last_hours)
        };
    }

    private buildActiveProfile(): UserProfile {
        return {
            profile_id: this.selectedProfileId ?? undefined,
            ...this.buildProfilePayload()
        };
    }

    private loadProfiles(selectProfileId?: string | null, successMessage?: string): void {
        this.isProfilesLoading = true;
        this.userProfileService.getProfiles().subscribe({
            next: (profiles: UserProfile[]) => {
                this.profiles = profiles;
                const profileToSelect = selectProfileId
                    ? profiles.find(profile => profile.profile_id === selectProfileId)
                    : undefined;

                if (profileToSelect) {
                    this.applyProfile(profileToSelect);
                } else {
                    this.applyProfile(this.createBlankProfile());
                }

                this.isProfilesLoading = false;
                this.setProfileMessage(successMessage ?? null);
            },
            error: (err) => {
                console.error('Profile load error:', err);
                this.profiles = [];
                this.applyProfile(this.createBlankProfile());
                this.setProfileMessage(err.error?.detail || 'Failed to load saved profiles.');
                this.isProfilesLoading = false;
            }
        });
    }

    selectProfile(profileId: string | null): void {
        const normalizedProfileId = profileId?.trim() ?? '';

        if (!normalizedProfileId) {
            this.applyProfile(this.createBlankProfile());
            this.setProfileMessage('Select a profile or create a new one.');
            return;
        }

        this.isProfilesLoading = true;
        this.userProfileService.getProfile(normalizedProfileId).subscribe({
            next: (profile: UserProfile) => {
                this.applyProfile(profile);
                this.isProfilesLoading = false;
            },
            error: (err) => {
                console.error('Profile select error:', err);
                const fallback = this.profiles.find(profile => String(profile.profile_id ?? '').trim() === normalizedProfileId);
                if (fallback) {
                    this.applyProfile(fallback);
                } else {
                    this.setProfileMessage(err.error?.detail || 'Failed to load selected profile.');
                }
                this.isProfilesLoading = false;
            }
        });
    }

    createNewProfile(): void {
        this.applyProfile(this.createBlankProfile());
        this.searchTerms = this.mergeUniqueValues(
            [],
            this.profiles.flatMap(profile => profile.search_terms ?? [])
        );
        this.isCreatingProfile = true;
        this.isEditingProfileName = true;
        this.setProfileMessage('Enter a name for the new profile.');
    }

    editProfileName(): void {
        this.isEditingProfileName = true;
    }

    cancelProfileNameEdit(): void {
        const activeProfile = this.profiles.find(profile => profile.profile_id === this.selectedProfileId);
        this.profileName = activeProfile?.profile_name ?? '';
        this.isEditingProfileName = false;
    }

    saveProfile(): void {
        if (!this.profileName.trim()) {
            this.isEditingProfileName = true;
            this.setProfileMessage('Enter a profile name before saving.');
            return;
        }

        if (!this.isFormValid()) {
            this.setProfileMessage('Fix the form before saving this profile.');
            return;
        }

        const payload = this.buildProfilePayload();
        const existingProfileId = this.selectedProfileId?.trim();
        this.isProfileSaving = true;

        const request = existingProfileId
            ? this.userProfileService.updateProfile(existingProfileId, payload)
            : this.userProfileService.createProfile(payload);

        request.subscribe({
            next: (savedProfile: UserProfile) => {
                this.isProfileSaving = false;
                this.loadProfiles(
                    savedProfile.profile_id,
                    existingProfileId ? 'Profile updated.' : 'Profile created.'
                );
            },
            error: (err) => {
                console.error('Profile save error:', err);
                this.setProfileMessage(err.error?.detail || 'Failed to save profile.');
                this.isProfileSaving = false;
            }
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
        this.syncSearchTerms();
    }

    toggleSearchTerm(term: string): void {
        if (this.selectedSearchTerms.has(term)) {
            this.selectedSearchTerms.delete(term);
        } else {
            this.selectedSearchTerms.add(term);
        }
        this.syncSearchTerms();
    }

    isSearchTermSelected(term: string): boolean {
        return this.selectedSearchTerms.has(term);
    }

    selectAllSearchTerms(): void {
        this.selectedSearchTerms = new Set(this.searchTerms);
        this.syncSearchTerms();
    }

    deselectAllSearchTerms(): void {
        this.selectedSearchTerms.clear();
        this.syncSearchTerms();
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
        this.syncJobLevels();
    }

    isJobLevelSelected(level: string): boolean {
        return this.selectedJobLevels.has(level);
    }

    selectAllJobLevels(): void {
        this.selectedJobLevels = new Set(this.ALLOWED_JOB_LEVELS);
        this.syncJobLevels();
    }

    deselectAllJobLevels(): void {
        this.selectedJobLevels.clear();
        this.syncJobLevels();
    }

    // ─── Exclusion Terms (Positions and Companies) ──────────────────────────────

    toggleCompanyExclusion(term: string): void {
        if (this.selectedCompanyExclusions.has(term)) {
            this.selectedCompanyExclusions.delete(term);
        } else {
            this.selectedCompanyExclusions.add(term);
        }
        this.syncCompanyExclusions();
    }

    isCompanyExclusionSelected(term: string): boolean {
        return this.selectedCompanyExclusions.has(term);
    }

    selectAllCompanyExclusions(): void {
        this.selectedCompanyExclusions = new Set(this.companyExclusionTerms);
        this.syncCompanyExclusions();
    }

    deselectAllCompanyExclusions(): void {
        this.selectedCompanyExclusions.clear();
        this.syncCompanyExclusions();
    }

    toggleCompanyExclusionsVisibility(): void {
        this.showCompanyExclusions = !this.showCompanyExclusions;
    }

    togglePositionExclusion(term: string): void {
        if (this.selectedPositionExclusions.has(term)) {
            this.selectedPositionExclusions.delete(term);
        } else {
            this.selectedPositionExclusions.add(term);
        }
        this.syncPositionExclusions();
    }

    isPositionExclusionSelected(term: string): boolean {
        return this.selectedPositionExclusions.has(term);
    }

    selectAllPositionExclusions(): void {
        this.selectedPositionExclusions = new Set(this.positionExclusionTerms);
        this.syncPositionExclusions();
    }

    deselectAllPositionExclusions(): void {
        this.selectedPositionExclusions.clear();
        this.syncPositionExclusions();
    }

    togglePositionExclusionsVisibility(): void {
        this.showPositionExclusions = !this.showPositionExclusions;
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
        this.syncCompanyExclusions();
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
        this.syncPositionExclusions();
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

    // ─── Location Autocomplete ────────────────────────────────────────────────

    // ─── ALLOW_DEUTSCH Toggle ──────────────────────────────────────────────────

    toggleAllowDeutsch(): void {
        const currentValue = this.form.get('allow_deutsch')?.value || false;
        this.form.patchValue({ allow_deutsch: !currentValue });
    }

    isAllowDeutschEnabled(): boolean {
        return this.form.get('allow_deutsch')?.value || false;
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
            this.scrape.emit(this.buildActiveProfile());
        }
    }

    exportCSV(): void {
        if (!this.jobs || this.jobs.length === 0) {
            this.setProfileMessage('No stored jobs are available yet. Run a sync first.');
            return;
        }

        const headers = ['Board', 'Title', 'Company', 'Location', 'Job Level', 'Industry', 'Date Posted', 'Job URL'];
        const rows = this.jobs.map(job => [
            job.job_board || 'N/A',
            job.title || '',
            job.company || '',
            job.location || '',
            job.job_level || 'N/A',
            job.company_industry || 'N/A',
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
        link.setAttribute('download', `jobs-${new Date().toISOString().slice(0, 10)}.csv`);
        link.click();
        URL.revokeObjectURL(url);
    }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Job } from '../models/job.model';
import { UserProfile } from '../models/user-profile.model';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ScraperService {
    private readonly API_BASE_URL = environment.apiBaseUrl;
    private readonly SCRAPE_ENDPOINT = '/api/scrape/all';

    private jobsSubject = new BehaviorSubject<Job[]>([]);
    private isLoadingSubject = new BehaviorSubject<boolean>(false);
    private errorSubject = new BehaviorSubject<string | null>(null);

    public jobs$ = this.jobsSubject.asObservable();
    public isLoading$ = this.isLoadingSubject.asObservable();
    public error$ = this.errorSubject.asObservable();

    constructor(private http: HttpClient) { }

    public scrape(profile: UserProfile): void {
        this.isLoadingSubject.next(true);
        this.errorSubject.next(null);

        this.http
            .post<Job[]>(`${this.API_BASE_URL}${this.SCRAPE_ENDPOINT}`, profile)
            .subscribe({
                next: (jobs: Job[]) => {
                    this.jobsSubject.next(jobs);
                    this.isLoadingSubject.next(false);
                },
                error: (err) => {
                    console.error('Scrape error:', err);
                    this.errorSubject.next(err.error?.detail || 'Failed to scrape jobs. Please check the backend.');
                    this.isLoadingSubject.next(false);
                    this.jobsSubject.next([]);
                }
            });
    }

    public getJobs(): Job[] {
        return this.jobsSubject.value;
    }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { FiltersBarComponent } from './components/filters-bar/filters-bar.component';
import { JobsTableComponent } from './components/jobs-table/jobs-table.component';
import { ScraperService } from './services/scraper.service';
import { Job } from './models/job.model';
import { UserProfile } from './models/user-profile.model';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [CommonModule, HeaderComponent, FiltersBarComponent, JobsTableComponent],
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    jobs: Job[] = [];
    isLoading = false;
    error: string | null = null;
    hasSearched = false;

    constructor(private scraperService: ScraperService) { }

    ngOnInit(): void {
        this.scraperService.jobs$.subscribe(jobs => {
            this.jobs = jobs;
        });

        this.scraperService.isLoading$.subscribe(isLoading => {
            this.isLoading = isLoading;
        });

        this.scraperService.error$.subscribe(error => {
            this.error = error;
        });
    }

    onScrape(profile: UserProfile): void {
        this.error = null;
        this.hasSearched = true;
        this.scraperService.scrape(profile);
    }
}

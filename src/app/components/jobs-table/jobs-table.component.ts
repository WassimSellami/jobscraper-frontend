import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Job } from '../../models/job.model';

@Component({
    selector: 'app-jobs-table',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './jobs-table.component.html',
    styleUrls: ['./jobs-table.component.scss']
})
export class JobsTableComponent implements OnInit {
    @Input() jobs: Job[] = [];
    @Input() isLoading = false;
    @Input() hasSearched = false;

    ngOnInit(): void {
        console.log('JobsTableComponent initialized, initial jobs:', this.jobs?.length);
    }

    formatDatePosted(value: unknown): string {
        const rawValue = String(value ?? '').trim();

        if (!rawValue) {
            return 'Last 24h';
        }

        const parsedDate = Date.parse(rawValue);
        if (Number.isNaN(parsedDate)) {
            return rawValue;
        }

        const jobDate = new Date(parsedDate);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - jobDate.getTime());
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return 'Last 24h';
        } else if (diffDays === 1) {
            return '1 day ago';
        } else if (diffDays < 30) {
            return `${diffDays} days ago`;
        } else {
            return jobDate.toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric'
            });
        }
    }
}

export interface Job {
    title: string;
    company: string;
    company_industry?: string;
    location?: string;
    job_level: string;
    date_posted: string | null;
    job_url: string;
    [key: string]: any; // Allow any additional fields from backend
}

export interface ScraperRequest {
    SEARCH_TERMS: string[];
    LINKEDIN_JOB_LEVEL_ALLOWED_VALUES: string[];
    LOCATION: string;
    DISTANCE_MILES: number;
    HOURS_OLD: number;
    RESULTS_WANTED: number;
}

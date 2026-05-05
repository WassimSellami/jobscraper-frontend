export interface Job {
    title: string;
    company: string;
    company_industry?: string;
    location?: string;
    job_level?: string | null;
    date_posted: string | null;
    job_url: string;
    job_board?: string | null;
    [key: string]: any; // Allow any additional fields from backend
}

export interface ScraperRequest {
    SEARCH_TERMS: string[];
    sites: string[];
    LINKEDIN_JOB_LEVEL_ALLOWED_VALUES: string[];
    LOCATION: string;
    DISTANCE_MILES: number;
    HOURS_OLD: number;
    RESULTS_WANTED: number;
    ALLOW_DEUTSCH: boolean;
    POSITION_EXCLUSION_TERMS?: string[];
    COMPANY_EXCLUSION_TERMS?: string[];
}

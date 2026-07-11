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

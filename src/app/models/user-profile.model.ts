export interface UserProfile {
    profile_id?: string;
    search_terms: string[];
    job_levels: string[];
    excluded_companies: string[];
    sites: string[];
    excluded_positions: string[];
    location: string;
    distance_miles: number;
    hours_old: number;
    allow_deutsch: boolean;
}

export type UserProfilePayload = Omit<UserProfile, 'profile_id'>;

export const DEFAULT_USER_PROFILE: UserProfilePayload = {
    search_terms: [],
    job_levels: [],
    excluded_companies: [],
    sites: ['linkedin', 'indeed'],
    excluded_positions: [],
    location: 'Munich, Germany',
    distance_miles: 31,
    hours_old: 24,
    allow_deutsch: false
};

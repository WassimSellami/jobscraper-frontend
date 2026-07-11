export interface UserProfile {
    profile_id?: string;
    search_terms: string[];
    job_levels: string[];
    excluded_companies: string[];
    excluded_positions: string[];
    allow_deutsch: boolean;
}

export type StoredUserProfile = UserProfile;
export type UserProfilePayload = Omit<UserProfile, 'profile_id'>;


export const DEFAULT_USER_PROFILE: UserProfilePayload = {
    search_terms: [],
    job_levels: [],
    excluded_companies: [],
    excluded_positions: [],
    allow_deutsch: false
};

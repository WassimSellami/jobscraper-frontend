import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { StoredUserProfile, UserProfilePayload } from '../models/user-profile.model';

@Injectable({
    providedIn: 'root'
})
export class UserProfileService {
    private readonly API_BASE_URL = environment.apiBaseUrl;
    private readonly USER_PROFILES_ENDPOINT = '/api/user-profiles';

    constructor(private http: HttpClient) { }

    public getProfiles(): Observable<StoredUserProfile[]> {
        return this.http.get<StoredUserProfile[]>(`${this.API_BASE_URL}${this.USER_PROFILES_ENDPOINT}`);
    }

    public getProfile(profileId: string): Observable<StoredUserProfile> {
        return this.http.get<StoredUserProfile>(`${this.API_BASE_URL}${this.USER_PROFILES_ENDPOINT}/${profileId}`);
    }

    public createProfile(profile: UserProfilePayload): Observable<StoredUserProfile> {
        return this.http.post<StoredUserProfile>(`${this.API_BASE_URL}${this.USER_PROFILES_ENDPOINT}`, profile);
    }

    public updateProfile(profileId: string, profile: UserProfilePayload): Observable<StoredUserProfile> {
        return this.http.put<StoredUserProfile>(`${this.API_BASE_URL}${this.USER_PROFILES_ENDPOINT}/${profileId}`, profile);
    }

    public deleteProfile(profileId: string): Observable<{ detail?: string; message?: string }> {
        return this.http.delete<{ detail?: string; message?: string }>(`${this.API_BASE_URL}${this.USER_PROFILES_ENDPOINT}/${profileId}`);
    }
}

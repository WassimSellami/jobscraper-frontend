import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { UserProfile, UserProfilePayload } from '../models/user-profile.model';

@Injectable({
    providedIn: 'root'
})
export class UserProfileService {
    private readonly API_BASE_URL = environment.apiBaseUrl;
    private readonly USER_PROFILES_ENDPOINT = '/api/user-profiles';

    constructor(private http: HttpClient) { }

    public getProfiles(): Observable<UserProfile[]> {
        return this.http.get<UserProfile[]>(`${this.API_BASE_URL}${this.USER_PROFILES_ENDPOINT}`);
    }

    public createProfile(profile: UserProfilePayload): Observable<UserProfile> {
        return this.http.post<UserProfile>(`${this.API_BASE_URL}${this.USER_PROFILES_ENDPOINT}`, profile);
    }

    public updateProfile(profileId: string, profile: UserProfilePayload): Observable<UserProfile> {
        return this.http.put<UserProfile>(`${this.API_BASE_URL}${this.USER_PROFILES_ENDPOINT}/${profileId}`, profile);
    }

    public deleteProfile(profileId: string): Observable<{ detail?: string; message?: string }> {
        return this.http.delete<{ detail?: string; message?: string }>(`${this.API_BASE_URL}${this.USER_PROFILES_ENDPOINT}/${profileId}`);
    }
}

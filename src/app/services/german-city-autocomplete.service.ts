import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface GermanCitySuggestion {
    city: string;
    label: string;
}

interface GermanCityAutocompleteResponseItem {
    city?: string;
    label?: string;
}

@Injectable({
    providedIn: 'root'
})
export class GermanCityAutocompleteService {
    private readonly AUTOCOMPLETE_URL = `${environment.apiBaseUrl}/api/autocomplete/cities`;

    constructor(private http: HttpClient) { }

    search(query: string): Observable<GermanCitySuggestion[]> {
        const trimmedQuery = query.trim();

        if (trimmedQuery.length < 3) {
            return of([]);
        }
        const params = new HttpParams()
            .set('q', trimmedQuery)
            .set('limit', '5');

        return this.http.get<GermanCityAutocompleteResponseItem[]>(this.AUTOCOMPLETE_URL, { params }).pipe(
            map((results) => (results || []).slice(0, 5).map((item) => {
                const city = String(item.city ?? '').trim();
                const label = String(item.label ?? (city ? `${city}, Germany` : '')).trim();

                return {
                    city,
                    label
                };
            }).filter((item) => item.city.length > 0 && item.label.length > 0)),
            catchError((error) => {
                console.error('German city autocomplete failed:', error);
                return of([]);
            })
        );
    }

}
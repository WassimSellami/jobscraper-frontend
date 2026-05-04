import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

export interface GermanCitySuggestion {
    city: string;
    label: string;
}

@Injectable({
    providedIn: 'root'
})
export class GermanCityAutocompleteService {
    private readonly LOCAL_CITIES_URL = 'assets/german-cities.json';
    private cities: Array<{ name: string; alts?: string[] }> = [];
    private citiesLoaded = false;

    constructor(private http: HttpClient) { }

    search(query: string): Observable<GermanCitySuggestion[]> {
        const trimmedQuery = query.trim();

        if (trimmedQuery.length < 3) {
            return of([]);
        }
        // Prefer offline local search first (fuzzy + diacritics handling)
        if (this.citiesLoaded) {
            return of(this.localSearch(trimmedQuery));
        }

        // Load local dataset once and then search
        return this.http.get<Array<{ name: string; alts?: string[] }>>(this.LOCAL_CITIES_URL).pipe(
            map((data) => {
                this.cities = data || [];
                this.citiesLoaded = true;
                return this.localSearch(trimmedQuery);
            })
        );
    }

    private fold(input: string): string {
        if (!input) return '';
        const s = input.toLowerCase();
        return s
            .replace(/ä/g, 'a')
            .replace(/ö/g, 'o')
            .replace(/ü/g, 'u')
            .replace(/ß/g, 'ss')
            .replace(/[^a-z0-9]/g, '');
    }

    private localSearch(query: string): GermanCitySuggestion[] {
        const q = this.fold(query);
        if (!q) return [];

        const scored = this.cities.map((c) => {
            const names = [c.name].concat(c.alts || []);
            let bestScore = 9999;
            let bestMatch = '';
            for (const n of names) {
                const fn = this.fold(n);
                if (fn.startsWith(q)) {
                    bestScore = Math.min(bestScore, 0);
                    bestMatch = n;
                } else if (fn.includes(q)) {
                    bestScore = Math.min(bestScore, 1);
                    bestMatch = n;
                } else {
                    // allow a small prefix fuzzy: check first min(len, q.length+1) chars
                    const prefix = fn.substring(0, Math.min(fn.length, q.length + 1));
                    if (this.levenshtein(prefix, q) <= 1) {
                        bestScore = Math.min(bestScore, 2);
                        bestMatch = n;
                    }
                }
            }
            return { city: c.name, display: bestMatch || c.name, score: bestScore };
        }).filter(r => r.score < 9999)
            .sort((a, b) => a.score - b.score)
            .slice(0, 5)
            .map(r => ({ city: r.city, label: `${r.display}, Germany` }));

        return scored;
    }

    private levenshtein(a: string, b: string): number {
        const al = a.length, bl = b.length;
        if (al === 0) return bl;
        if (bl === 0) return al;
        const dp: number[] = Array(bl + 1).fill(0).map((_, i) => i);
        for (let i = 1; i <= al; i++) {
            let prev = dp[0];
            dp[0] = i;
            for (let j = 1; j <= bl; j++) {
                const temp = dp[j];
                let cost = a.charAt(i - 1) === b.charAt(j - 1) ? 0 : 1;
                dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + cost);
                prev = temp;
            }
        }
        return dp[bl];
    }

}
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
    isDarkMode = false;

    ngOnInit(): void {
        // Check for saved theme preference
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            this.isDarkMode = true;
            this.applyTheme('dark');
        } else {
            this.isDarkMode = false;
            this.applyTheme('light');
        }
    }

    toggleDarkMode(): void {
        this.isDarkMode = !this.isDarkMode;
        const theme = this.isDarkMode ? 'dark' : 'light';
        this.applyTheme(theme);
        localStorage.setItem('theme', theme);
    }

    private applyTheme(theme: string): void {
        document.documentElement.setAttribute('data-theme', theme);
    }
}

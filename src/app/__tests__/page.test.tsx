
import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import Page from '../page';
import { useLanguage } from '@/context/LanguageContext';

// Mock the useLanguage hook
jest.mock('@/context/LanguageContext', () => ({
    useLanguage: jest.fn(),
}));

// Mock Lucide icons to avoid rendering complexities
jest.mock('lucide-react', () => ({
    ArrowRight: () => <span data-testid="arrow-right-icon" />,
    BookOpen: () => <span data-testid="book-open-icon" />,
    Package: () => <span data-testid="package-icon" />,
    Users: () => <span data-testid="users-icon" />,
    Globe: () => <span data-testid="globe-icon" />,
    Lock: () => <span data-testid="lock-icon" />,
    ShieldCheck: () => <span data-testid="shield-check-icon" />,
    CheckCircle2: () => <span data-testid="check-circle-icon" />,
    BarChart3: () => <span data-testid="bar-chart-icon" />,
    Smartphone: () => <span data-testid="smartphone-icon" />,
    Database: () => <span data-testid="database-icon" />,
    Server: () => <span data-testid="server-icon" />,
    Zap: () => <span data-testid="zap-icon" />,
    Layers: () => <span data-testid="layers-icon" />,
    Download: () => <span data-testid="download-icon" />,
}));

// Mock Link component
jest.mock('next/link', () => ({
    __esModule: true,
    default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

describe('Landing Page - Urdu Support', () => {
    const mockT = jest.fn((key) => key);

    beforeEach(() => {
        (useLanguage as jest.Mock).mockReturnValue({
            language: 'en',
            t: mockT,
            setLanguage: jest.fn(),
        });
    });

    it('renders correctly in English (LTR)', () => {
        render(<Page />);

        // Check for main container direction
        const container = screen.getByRole('banner').parentElement; // Header is inside the main div
        expect(container).toHaveAttribute('dir', 'ltr');
    });

    it('renders correctly in Urdu (RTL)', () => {
        (useLanguage as jest.Mock).mockReturnValue({
            language: 'ur',
            t: mockT,
            setLanguage: jest.fn(),
        });

        render(<Page />);

        // Check for main container direction
        // Since we don't have a direct test id on the root, we can check the root element's dir attribute
        // In this specific component, the root div has the dir attribute
        // We can find an element inside and traverse up or trust the structure.
        // The component structure is <div className="..." dir={...}>...</div>

        // Let's use getByText to find a known element and look at its container, 
        // or better, assuming the first div rendered is the container.
        // Actually, screen.getByText('landing.heroTitle') should be inside main content.

        // However, the cleanest way is often to query by something unique.
        // Let's rely on text content that we mocked.

        const heroTitle = screen.getByText('landing.heroTitle');
        // Traverse up to find the element with dir="rtl". 
        // The root div on this page handles the dir attribute.
        const rootDiv = heroTitle.closest('div[dir="rtl"]');
        expect(rootDiv).toBeInTheDocument();
    });
});

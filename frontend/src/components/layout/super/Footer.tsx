import React from 'react';
import { Link } from 'react-router-dom';

export interface FooterLinkItem {
  label: string;
  href: string;
}

export interface FooterProps {
  companyName?: string;
  links?: FooterLinkItem[];
}

const defaultLinks: FooterLinkItem[] = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
  { label: 'Contact Support', href: '/support' },
];

export const Footer: React.FC<FooterProps> = ({
  companyName = 'RoadAssist Enterprise',
  links = defaultLinks,
}) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card text-muted-foreground">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-4 text-xs sm:flex-row sm:px-6 lg:px-8">
        {/* Left Side: Brand & Copyright */}
        <div className="flex flex-col items-center gap-1 sm:items-start">
          <p className="font-semibold text-foreground">{companyName}</p>
          <p>© {currentYear} {companyName}. All rights reserved.</p>
        </div>

        {/* Right Side: Navigation Links */}
        <nav aria-label="Footer Navigation">
          <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  to={link.href}
                  className="transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
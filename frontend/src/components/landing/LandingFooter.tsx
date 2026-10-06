import React from "react";
import { Link } from "react-router-dom";
import { Wrench } from "lucide-react";
import type { LandingPageData } from "@/types/landing";

interface LandingFooterProps {
  data: LandingPageData["footer"];
}

export const LandingFooter: React.FC<LandingFooterProps> = ({ data }) => {
  return (
    <footer className="bg-card border-t border-border pt-16 pb-12 text-muted-foreground text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-border/60">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-md bg-primary text-primary-foreground flex items-center justify-center shadow-sm">
                <Wrench className="h-4 w-4" />
              </div>
              <span className="text-base font-bold text-foreground tracking-tight font-heading">
                RoadAssist
              </span>
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
              {data.brandDescription}
            </p>
          </div>

          {/* Dynamic Link Groups */}
          {data.linkGroups.map((group, idx) => (
            <div key={idx} className="space-y-3">
              <h4 className="text-xs font-semibold text-foreground tracking-wider uppercase">
                {group.title}
              </h4>
              <ul className="space-y-2">
                {group.links.map((link, lIdx) => (
                  <li key={lIdx}>
                    <a
                      href={link.href}
                      className="hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Legal Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <div>{data.legalText}</div>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-foreground transition-colors">
              Terms
            </a>
            <span>•</span>
            <a href="#" className="hover:text-foreground transition-colors">
              Privacy
            </a>
            <span>•</span>
            <a href="#" className="hover:text-foreground transition-colors">
              Security
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
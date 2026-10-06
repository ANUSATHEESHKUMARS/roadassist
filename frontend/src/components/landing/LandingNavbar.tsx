import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Wrench, Menu, X, ArrowRight } from "lucide-react";
import type{ LandingPageData } from "@/types/landing";

interface LandingNavbarProps {
  data: LandingPageData["nav"];
}

export const LandingNavbar: React.FC<LandingNavbarProps> = ({ data }) => {
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/85 backdrop-blur-md border-b border-border/80 shadow-2xl py-3.5"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-200">
            <Wrench className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-foreground font-heading">
              {data.brandName}
            </span>
            <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-mono -mt-1">
              Enterprise
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          {data.links.map((link, idx) => (
            <a
              key={idx}
              href={link.href}
              className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors tracking-wide"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right CTA / Auth Action */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            to={data.loginButton.href}
            className="text-xs font-semibold text-muted-foreground hover:text-foreground px-3.5 py-2 transition-colors"
          >
            {data.loginButton.label}
          </Link>
          <Link
            to={data.ctaButton.href}
            className="h-9 px-4 rounded-xl bg-primary hover:opacity-90 text-primary-foreground text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md hover:shadow-primary/20"
          >
            <span>{data.ctaButton.label}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg bg-card border border-border text-foreground hover:bg-muted focus:outline-hidden"
          aria-label="Toggle mobile menu"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-card/95 backdrop-blur-xl border-b border-border px-6 py-6 animate-in slide-in-from-top-4 duration-200">
          <nav className="flex flex-col space-y-4">
            {data.links.map((link, idx) => (
              <a
                key={idx}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-muted-foreground hover:text-foreground py-1"
              >
                {link.label}
              </a>
            ))}
            <div className="pt-4 border-t border-border flex flex-col gap-3">
              <Link
                to={data.loginButton.href}
                onClick={() => setMobileMenuOpen(false)}
                className="h-10 rounded-xl border border-border bg-input text-foreground text-xs font-semibold flex items-center justify-center"
              >
                {data.loginButton.label}
              </Link>
              <Link
                to={data.ctaButton.href}
                onClick={() => setMobileMenuOpen(false)}
                className="h-10 rounded-xl bg-primary text-primary-foreground text-xs font-semibold flex items-center justify-center gap-2"
              >
                <span>{data.ctaButton.label}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
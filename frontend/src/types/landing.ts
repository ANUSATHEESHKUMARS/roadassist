export type MediaType = "video" | "image";

export interface MediaAsset {
  mediaType: MediaType;
  mediaUrl: string;
  posterUrl?: string;
  altText?: string;
}

export interface ButtonAction {
  label: string;
  href: string;
  isPrimary?: boolean;
}

export interface NavItem {
  label: string;
  href: string;
}

export interface HeroData extends MediaAsset {
  headlineBadge?: string;
  title: string;
  titleAccent?: string;
  description: string;
  primaryButton: ButtonAction;
  secondaryButton: ButtonAction;
}

export interface TrustHighlightItem {
  id: string;
  title: string;
  subtitle: string;
  iconName: "ShieldAlert" | "MapPin" | "Clock" | "CreditCard" | "Wrench";
}

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  iconName: string;
  link: string;
  isFeatured?: boolean;
}

export interface HowItWorksStep {
  step: string;
  title: string;
  description: string;
  imageUrl: string;
  iconName: string;
}

export interface VehicleCategoryItem {
  id: string;
  name: string;
  tagline: string;
  description: string;
  imageUrl: string;
  specs: string[];
}

export interface EmergencySectionData extends MediaAsset {
  badge: string;
  heading: string;
  description: string;
  bullets: string[];
  button: ButtonAction;
}

export interface FeatureStat {
  metric: string;
  label: string;
}

export interface FeatureItem {
  id: string;
  title: string;
  description: string;
  iconName: string;
}

export interface WhyRoadAssistData {
  badge: string;
  heading: string;
  description: string;
  stats: FeatureStat[];
  features: FeatureItem[];
}

export interface PremiumTierData {
  badge: string;
  heading: string;
  tagline: string;
  priceDescriptor: string;
  benefits: string[];
  ctaButton: ButtonAction;
  imageUrl: string;
}

export interface FinalCTAData extends MediaAsset {
  heading: string;
  description: string;
  primaryButton: ButtonAction;
  secondaryButton?: ButtonAction;
}

export interface FooterLinkGroup {
  title: string;
  links: { label: string; href: string }[];
}

export interface LandingPageData {
  nav: {
    brandName: string;
    links: NavItem[];
    loginButton: ButtonAction;
    ctaButton: ButtonAction;
  };
  hero: HeroData;
  trustHighlights: TrustHighlightItem[];
  services: {
    heading: string;
    subheading: string;
    items: ServiceItem[];
  };
  howItWorks: {
    heading: string;
    subheading: string;
    steps: HowItWorksStep[];
  };
  vehicles: {
    heading: string;
    subheading: string;
    categories: VehicleCategoryItem[];
  };
  emergency: EmergencySectionData;
  whyRoadAssist: WhyRoadAssistData;
  premium: PremiumTierData;
  finalCta: FinalCTAData;
  footer: {
    brandDescription: string;
    linkGroups: FooterLinkGroup[];
    legalText: string;
  };
}
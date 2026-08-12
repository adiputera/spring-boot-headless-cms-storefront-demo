export type ComponentType = 'BANNER' | 'PARAGRAPH' | 'PRODUCT_CAROUSEL' | 'NAVIGATION' | 'QUICK_MENU' | 'PRODUCT_DETAIL' | 'LATEST_ARTICLE' | 'TRENDING_ARTICLE' | 'LATEST_EVENT' | 'TOP_EVENT' | 'QUOTE_OF_THE_DAY';

// Base Component Interface
export interface BaseComponent {
  type: ComponentType;
  id: number;
  uid: string;
  name: string;
  sortOrder: number;
}

// Banner Component
export interface BannerComponent extends BaseComponent {
  type: 'BANNER';
  imageUrl: string;
  altText: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaUrl: string;
}

// Paragraph Component
export interface ParagraphComponent extends BaseComponent {
  type: 'PARAGRAPH';
  title: string;
  content: string;
}

// Product Carousel Component
export interface ProductCarouselComponent extends BaseComponent {
  type: 'PRODUCT_CAROUSEL';
  title: string;
  subtitle?: string;
  productCodes?: string[] | string;
}

// Navigation Component
export interface NavigationComponent extends BaseComponent {
  type: 'NAVIGATION';
  displayText: string;
  url: string;
  icon?: string;
}

// Quick Menu Component
export interface QuickMenuComponent extends BaseComponent {
  type: 'QUICK_MENU';
  title: string;
  imageUrl: string;
  url: string;
}

// Product Detail Component
export interface ProductDetailComponent extends BaseComponent {
  type: 'PRODUCT_DETAIL';
  title?: string;
  showPrice?: boolean;
  showDescription?: boolean;
}

// Latest Article Component
export interface LatestArticleComponent extends BaseComponent {
  type: 'LATEST_ARTICLE';
  title: string;
  articleCount: number;
}

// Trending Article Component
export interface TrendingArticleComponent extends BaseComponent {
  type: 'TRENDING_ARTICLE';
  title: string;
  articleSlugs: string[];
}

// Latest Event Component
export interface LatestEventComponent extends BaseComponent {
  type: 'LATEST_EVENT';
  title: string;
  eventSlugs: string[];
}

// Top Event Component
export interface TopEventComponent extends BaseComponent {
  type: 'TOP_EVENT';
  title: string;
  eventSlug: string;
}

// Quote of the Day Component
export interface QuoteOfTheDayComponent extends BaseComponent {
  type: 'QUOTE_OF_THE_DAY';
  title: string;
  quote: string;
}

// Article Interface
export interface Article {
  id: number;
  title: string;
  slug: string;
  body: string;
}

// Event Interface
export interface Event {
  id: number;
  title: string;
  slug: string;
  description: string;
  location: string;
  eventDate: string;
}

// Discriminated Union for all component types
export type Component =
  | BannerComponent
  | ParagraphComponent
  | ProductCarouselComponent
  | NavigationComponent
  | QuickMenuComponent
  | ProductDetailComponent
  | LatestArticleComponent
  | TrendingArticleComponent
  | LatestEventComponent
  | TopEventComponent
  | QuoteOfTheDayComponent;

// Product Interface
export interface Product {
  id: number;
  code: string;
  name: string;
  imageUrl: string;
  price: number;
  description: string;
}

// Breadcrumb Interface
export interface Breadcrumb {
  slug: string;
  breadcrumbTitle: string;
}

// Slot Interface
export interface Slot {
  id: number;
  code: string;
  name: string;
  components: Component[];
}

// Page Interface
export interface Page {
  id: number;
  slug: string;
  title: string;
  breadcrumbTitle: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  canonicalUrl?: string;
  robotsIndex?: boolean;
  robotsFollow?: boolean;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  slots: Slot[];
  breadcrumbs: Breadcrumb[];
}

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp: string;
}

// Error Response
export interface ErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  validationErrors?: Record<string, string>;
}

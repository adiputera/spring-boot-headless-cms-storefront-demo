import type { Component, Product } from '@/types';
import BannerComponent from '@/components/cms/BannerComponent';
import ParagraphComponent from '@/components/cms/ParagraphComponent';
import ProductCarouselComponent from '@/components/cms/ProductCarouselComponent';
import NavigationComponent from '@/components/cms/NavigationComponent';
import QuickMenuComponent from '@/components/cms/QuickMenuComponent';
import ProductDetailComponent from '@/components/cms/ProductDetailComponent';
import LatestArticleComponent from '@/components/cms/LatestArticleComponent';
import TrendingArticleComponent from '@/components/cms/TrendingArticleComponent';
import LatestEventComponent from '@/components/cms/LatestEventComponent';
import TopEventComponent from '@/components/cms/TopEventComponent';
import QuoteOfTheDayComponent from '@/components/cms/QuoteOfTheDayComponent';

const componentRegistry = {
  BANNER: BannerComponent,
  PARAGRAPH: ParagraphComponent,
  PRODUCT_CAROUSEL: ProductCarouselComponent,
  NAVIGATION: NavigationComponent,
  QUICK_MENU: QuickMenuComponent,
  PRODUCT_DETAIL: ProductDetailComponent,
  LATEST_ARTICLE: LatestArticleComponent,
  TRENDING_ARTICLE: TrendingArticleComponent,
  LATEST_EVENT: LatestEventComponent,
  TOP_EVENT: TopEventComponent,
  QUOTE_OF_THE_DAY: QuoteOfTheDayComponent,
};

interface ComponentRendererProps {
  component: Component;
  product?: Product;
}

export default function ComponentRenderer({ component, product }: ComponentRendererProps) {
  const ComponentToRender = componentRegistry[component.type] as React.ComponentType<any>;

  if (!ComponentToRender) {
    console.error(`Unknown component type: ${component.type}`);
    return null;
  }

  return <ComponentToRender {...component} product={product} />;
}

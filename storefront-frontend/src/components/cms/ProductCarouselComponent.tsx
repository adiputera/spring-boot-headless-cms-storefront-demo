import type { ProductCarouselComponent as ProductCarouselComponentType, Product } from '@/types';
import { apiClient } from '@/lib/api-client';
import ProductCard from '@/components/ProductCard';

export default async function ProductCarouselComponent({
  title,
  subtitle,
  productCodes,
}: ProductCarouselComponentType) {
  const codes = Array.isArray(productCodes) 
    ? productCodes 
    : productCodes?.split(',').map(code => code.trim()).filter(Boolean) || [];
  
  // Fetch products
  let products: Product[] = [];
  try {
    if (codes.length > 0) {
      products = await apiClient.getProductsByCodes(codes);
    }
  } catch (error) {
    console.error('Error fetching products for carousel:', error);
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="my-12">
      <div className="mb-6">
        {title && <h2 className="text-3xl font-bold text-gray-900">{title}</h2>}
        {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

import type {
  Page,
  Product,
  Slot,
  ErrorResponse,
} from '@/types';

// Module-level variable set at runtime to avoid bundler optimization
let runtimeBaseUrl: string | null = null;

// Export function to set baseUrl from client components
export function setRuntimeBaseUrl(url: string) {
  runtimeBaseUrl = url;
}

class ApiClient {
  private get baseUrl(): string {
    // Priority 1: Runtime-set URL (from client component useEffect)
    if (runtimeBaseUrl !== null) {
      return runtimeBaseUrl;
    }
    
    // Priority 2: SSR uses internal Docker network
    if (typeof window === 'undefined') {
      return process.env.STOREFRONT_API_URL_INTERNAL || 'http://storefront-backend:8080/api';
    }
    
    // Priority 3: Client-side fallback (if setRuntimeBaseUrl not called yet)
    return (
      process.env.NEXT_PUBLIC_STOREFRONT_API_URL ??
      `${window.location.protocol}//${window.location.hostname}:8080/api`
    );
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData: ErrorResponse = await response.json();
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Fetch a page by slug
   */
  async getPageBySlug(slug: string, isEdit: boolean = false): Promise<Page> {
    const normalizedSlug = slug.startsWith('/') ? slug.substring(1) : slug;
    const baseUrlPath = normalizedSlug === '' ? `${this.baseUrl}/pages/index` : `${this.baseUrl}/pages/${normalizedSlug}`;
    const url = `${baseUrlPath}?edit=${isEdit}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // For dynamic content
    });
    
    return this.handleResponse<Page>(response);
  }

  /**
   * Fetch multiple slots with their components
   */
  async getSlotsByIds(ids: number[], isEdit: boolean = false): Promise<{ slots: Slot[] }> {
    const response = await fetch(`${this.baseUrl}/slots/details`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ slotIds: ids, edit: isEdit }),
      cache: 'no-store',
    });
    
    return this.handleResponse<{ slots: Slot[] }>(response);
  }

  /**
   * Fetch all products
   */
  async getAllProducts(): Promise<Product[]> {
    const response = await fetch(`${this.baseUrl}/products`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 300 }, // Cache for 5 minutes
    });
    
    return this.handleResponse<Product[]>(response);
  }

  /**
   * Fetch a single product by code
   */
  async getProductByCode(code: string): Promise<Product> {
    const response = await fetch(`${this.baseUrl}/products/${code}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 300 },
    });
    
    return this.handleResponse<Product>(response);
  }

  /**
   * Fetch multiple products by codes
   */
  async getProductsByCodes(codes: string[]): Promise<Product[]> {
    if (codes.length === 0) return [];
    const query = codes.join(',');
    const response = await fetch(`${this.baseUrl}/products/by-codes?codes=${query}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 300 },
    });
    return this.handleResponse<Product[]>(response);
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

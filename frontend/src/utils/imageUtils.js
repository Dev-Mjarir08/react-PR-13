/**
 * Robustly extracts and normalizes image URLs for customer-facing components & banners.
 * Handles product/banner objects, arrays, single objects, strings, relative paths, external HTTP URLs, and fallbacks.
 *
 * @param {Object|Array|string} imageSource - Image asset data from backend API or product/banner object
 * @param {string} fallback - Fallback placeholder URL
 * @returns {string} Fully resolved image URL
 */
export const getImageUrl = (
  imageSource,
  fallback = 'https://images.unsplash.com/photo-1498049860654-af1a5c566876?auto=format&fit=crop&q=80&w=600'
) => {
  if (!imageSource) return fallback;

  let urlString = null;

  // 1. If passed an entire product/banner object directly
  if (typeof imageSource === 'object' && imageSource !== null && !Array.isArray(imageSource)) {
    // Check images array first
    if (Array.isArray(imageSource.images) && imageSource.images.length > 0) {
      const first = imageSource.images[0];
      if (typeof first === 'string') {
        urlString = first;
      } else if (typeof first === 'object' && first !== null) {
        urlString = first.url || first.src || first.path || null;
      }
    }

    // Check direct image object ({ url, src }) or string properties
    if (!urlString) {
      if (typeof imageSource.image === 'object' && imageSource.image !== null) {
        urlString = imageSource.image.url || imageSource.image.src || imageSource.image.path || null;
      } else if (typeof imageSource.image === 'string') {
        urlString = imageSource.image;
      }
    }

    // Check fallback string keys
    if (!urlString) {
      const candidate =
        imageSource.imageUrl ||
        imageSource.thumbnail ||
        imageSource.thumb ||
        imageSource.src ||
        imageSource.photo ||
        imageSource.picture ||
        imageSource.logoUrl ||
        imageSource.logo ||
        null;

      if (typeof candidate === 'string') {
        urlString = candidate;
      } else if (typeof candidate === 'object' && candidate !== null) {
        urlString = candidate.url || candidate.src || candidate.path || null;
      }
    }
  }
  // 2. Handle array of image strings or objects
  else if (Array.isArray(imageSource)) {
    if (imageSource.length === 0) return fallback;
    const firstItem = imageSource[0];
    if (typeof firstItem === 'string') {
      urlString = firstItem;
    } else if (typeof firstItem === 'object' && firstItem !== null) {
      urlString = firstItem.url || firstItem.src || firstItem.path || firstItem.imageUrl || firstItem.image || null;
    }
  }
  // 3. Handle single object ({ url, src, etc })
  else if (typeof imageSource === 'object' && imageSource !== null) {
    urlString = imageSource.url || imageSource.src || imageSource.path || imageSource.imageUrl || imageSource.image || null;
  }
  // 4. Handle string
  else if (typeof imageSource === 'string') {
    urlString = imageSource;
  }

  if (!urlString || typeof urlString !== 'string') return fallback;

  // Clean whitespace and quotation marks
  urlString = urlString.trim().replace(/^"|"$/g, '');
  if (!urlString || urlString === '[object Object]') return fallback;

  // Relative upload path resolution (e.g. /uploads/banners/image.png)
  if (urlString.startsWith('/uploads/') || urlString.startsWith('uploads/')) {
    const cleanPath = urlString.startsWith('/') ? urlString : `/${urlString}`;
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api/v1';
    const serverHost = apiBase.replace(/\/api\/v1\/?$/, '');
    return `${serverHost}${cleanPath}`;
  }

  // Handle double slash URLs (e.g. //cdn.site.com/img.png)
  if (urlString.startsWith('//')) {
    return `https:${urlString}`;
  }

  return urlString || fallback;
};

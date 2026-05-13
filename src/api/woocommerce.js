
import axios from "axios";
// ===== Simple In-Memory Cache for Categories and Products =====
const _categoryCache = {};
const _productCache = {};

// Version identifier to track which code is running
const API_VERSION = 'v2.1-static-category-mapping';
console.log(`🔧 WooCommerce API ${API_VERSION} loaded`);

// ===== STATIC CATEGORY SLUG TO ID MAPPING =====
// This ensures the correct category is ALWAYS matched regardless of API issues
const CATEGORY_SLUG_MAP = {
  // Accessories
  'accessories': 6525,
  'bags': 6600,
  'belts': 6601,
  'body-jewelry': 6611,
  'bracelets-bangles': 6608,
  'earrings': 6607,
  'hats-headwear': 6604,
  'jewelry-watches': 6605,
  'mens-watches': 6609,
  'necklaces': 6606,
  'scarves-gloves': 6603,
  'sunglasses-eyewear': 6602,
  'womens-watches': 6610,
  
  // Automotive & Motorcycle
  'automotive-motorcycle': 6531,
  'atv-off-road-accessories': 6662,
  'car-electronics-lights': 6656,
  'car-exterior-accessories': 6658,
  'car-interior-accessories': 6657,
  'car-repair-tools': 6659,
  'car-wash-maintenance': 6655,
  'motorcycle-gear-helmets': 6660,
  'motorcycle-parts-accessories': 6661,
  
  // Baby, Kids & Maternity
  'baby-kids-maternity': 6528,
  'activity-gear-baby-carriers': 6635,
  'baby-care-hygiene': 6634,
  'baby-clothing': 6629,
  'baby-shoes-kids-shoes': 6632,
  'bed-linens': 6637,
  'feeding-nursing': 6631,
  'kids-accessories': 6636,
  'kids-clothing': 6630,
  'nursery-baby-furniture': 6633,
  
  // Beauty & Personal Care
  'beauty-personal-care': 6526,
  'dental-care-supplies': 6617,
  'foot-care': 41498,
  'grooming-devices': 41495,
  'hair-removal': 29743,
  'hair-removal-devices': 41494,
  'hair-styling-tools': 41493,
  'hair-extensions-wigs': 6614,
  'hair-tools-accessories': 6615,
  'makeup-cosmetics': 6612,
  'massage-relaxation': 6616,
  'skincare-devices': 41496,
  'skincare-haircare': 6613,
  'tattoo-body-art': 6618,
  
  // Electronics & Smart Devices
  'electronics-smart-devices': 498,
  'cameras-photography': 6541,
  'cameras-photography-electronics': 39534,
  'car-electronics': 36338,
  'camera-accessories': 41487,
  'audio-devices': 37163,
  'computer-accessories-electronics': 37164,
  'computer-components-desktops': 6543,
  'games-gaming-accessories': 6542,
  'home-audio-video': 6539,
  'laptops-tablets': 6544,
  'mobile-phones': 6535,
  'mobile-phones-electronics': 36339,
  'mobile-accessories-electronics': 41486,
  'networking-devices': 37176,
  'networking-communication': 6545,
  'phone-accessories': 6536,
  'phone-parts-repair': 6537,
  'portable-audio-video': 6540,
  'smart-home': 38201,
  'smart-electronics-smart-home': 6538,
  'tablets': 36340,
  'tablet-accessories': 36341,
  'tv-media-accessories': 36342,
  'tv-home-entertainment': 41492,
  'lighting-electronics': 41488,
  'drones-rc-devices': 41490,
  'projectors-presentation': 41491,
  'kids-electronics': 38200,
  'wearable-tech': 6546,
  'wearables': 36041,
  
  // Furniture & Home Living
  'furniture-home-living': 6521,
  'bedding-linens': 6570,
  'bedroom-furniture': 6565,
  'dining-room-furniture': 6567,
  'home-office-essentials': 6571,
  'kitchen-dining-furniture': 6572,
  'living-room-furniture': 6566,
  'office-furniture': 6568,
  'outdoor-furniture': 6569,
  'storage-organization': 6573,
  
  // Home Appliances
  'home-appliances': 6519,
  'air-quality-purifiers': 6551,
  'cleaning-appliances': 6548,
  'heating-cooling-appliances': 6550,
  'household-appliances': 6553,
  'kitchen-appliances': 6547,
  'laundry-appliances': 6549,
  'personal-care-appliances': 6552,
  
  // Home Improvement & Tools
  'home-improvement-tools': 6520,
  'bathroom-fixtures-accessories': 6558,
  'electrical-equipment-supplies': 6555,
  'gardening-tools-supplies': 6564,
  'hand-tools-power-tools': 6561,
  'hardware-tools-fasteners': 6556,
  'lighting-light-bulbs': 6559,
  'measurement-analysis-tools': 6562,
  'painting-supplies-wall-treatments': 6557,
  'plumbing-supplies': 6554,
  'smart-home-devices': 6560,
  'welding-industrial-equipment': 6563,
  
  // Lingerie & Loungewear
  'lingerie-loungewear': 6524,
  'bras-panties': 6594,
  'mens-underwear': 6598,
  'new-arrivals-lingerie-loungewear': 6599,
  'shapewear': 6595,
  'sleep-lounge': 6596,
  'socks-hosiery': 6597,
  
  // Men's Clothing
  'mens-clothing': 6522,
  'blazers-suits': 6578,
  'clothing-sets': 6581,
  'jackets-outerwear': 6576,
  'new-arrivals': 6582,
  'pants-jeans': 6575,
  'shorts': 6579,
  'sweaters-hoodies': 6577,
  't-shirts-shirts': 6574,
  'winter-wear-down-jackets': 6580,
  
  // Pet Supplies
  'pet-supplies': 6533,
  'birds': 6673,
  'cats': 6671,
  'dogs': 6670,
  'farm-animals': 6676,
  'fish-aquatic-pets': 6672,
  'reptiles-amphibians': 6675,
  'small-animals': 6674,
  
  // Security & Safety
  'security-safety': 6532,
  'access-control-systems': 6664,
  'alarm-sensors': 6668,
  'emergency-kits-self-defense': 6667,
  'home-safes-security-accessories': 6666,
  'intercom-systems': 6669,
  'video-surveillance-systems': 6663,
  'workplace-safety-supplies': 6665,
  
  // Shoes & Footwear
  'shoes-footwear': 6527,
  'business-shoes': 6627,
  'mens-boots': 6626,
  'mens-casual-shoes': 6624,
  'mens-sandals-slippers': 6625,
  'pumps-heels': 6621,
  'shoe-accessories': 6628,
  'womens-boots': 6619,
  'womens-casual-shoes': 6623,
  'womens-sandals-slippers': 6620,
  'womens-sandals-slippers-shoes-footwear': 6622,
  
  // Special Occasion & Costumes
  'special-occasion-costumes': 6534,
  'cosplay-costumes': 6677,
  'cultural-traditional-clothing': 6679,
  'dancewear-stage-outfits': 6678,
  'workwear-uniforms': 6680,
  
  // Sports, Outdoors & Hobbies
  'sports-outdoors-hobbies': 6530,
  'cardio-training-equipment': 6652,
  'cycling-biking': 6649,
  'fishing-kayaking': 6648,
  'hiking-camping': 6647,
  'hobby-collectibles': 6654,
  'musical-instruments': 6653,
  'racquet-sports': 6650,
  'strength-training-gym-equipment': 6651,
  
  // Toys, Games & Entertainment
  'toys-games-entertainment': 6529,
  'action-figures-collectibles': 6642,
  'building-construction-sets': 6641,
  'dolls-accessories': 6639,
  'electronic-toys': 6645,
  'kids-gifts': 6646,
  'learning-educational-toys': 6638,
  'pools-water-activities': 6644,
  'remote-control-toys': 6640,
  'sports-outdoor-toys': 6643,
  
  // Women's Clothing
  'womens-clothing': 6523,
  'bottoms-skirts-pants': 6586,
  'curve-plus-size-clothing': 6588,
  'dresses-gowns': 6584,
  'matching-sets': 6592,
  'new-arrivals-womens-clothing': 6593,
  'outerwear-jackets': 6587,
  'special-occasion-dresses': 6591,
  'swimwear': 6589,
  'tops-blouses': 6585,
  'wedding-dresses': 6590,
  
  // Other Categories
  'new': 29687,
  'rating': 29685,
  'recommended': 29688,
  'season-sale': 29654,
  'topseliing': 29686,

  // ===== NEW MEGA MENU CATEGORIES =====

// Home & Kitchen
'kitchen-dining': 29747,
'kitchen-tools': 29754,
'kitchen-accessories': 29760,
'food-storage': 29757,
// 'drinkware': 0,
// 'disposable-tableware': 0,

// Home & Living
'lighting': 29709,
'storage-organization': 6573, // already exists maybe
'gift-packaging': 29761,

// Home & Garden
'power-tools': 29742,


// Beauty & Personal Care (NEW SLUGS)
'hair-care-appliances': 29753,
'hair-care-tools': 29759,
'makeup-accessories': 29755,
// 'bath-accessories': 0,

// Baby & Kids
'baby-travel-gear': 29745,
'baby-care': 6634, // already exists maybe
// 'feeding-accessories': 0,

// Automotive
'car-care-tools': 29748,

// Electronics
'computer-accessories': 29756,
'mobile-accessories': 29728,

// Pet Supplies
'cat-accessories': 29758,
// 'dog-care': 0,

// Travel & Luggage
'travel-accessories': 29752,

// Fashion
'womens-bags': 29763,
// 'bags-backpacks': 0,

// Fashion Accessories
// 'watch-accessories': 0,
// 'rain-accessories': 0,

// Sports & Fitness
// 'fitness-accessories': 0,

// Health & Personal Care
// 'sleep-aids': 0,

// Home & Bathroom
'bathroom-accessories': 29750,

// Tools & Hardware
'hand-tools': 6561,

// ===== ERD PRODUCTS CATEGORY MAP =====
'charger': 29730,
'cables': 29718,
'earphone': 29734,
'earbuds': 29726,
'power-bank': 29732,

'car-accessories': 29714,
'car-charger': 29731,
// ===== MAIN + SUB CATEGORY SLUG MAP =====

// Mobile Accessories






// Smart Gadgets & Electronics
'smart-gadgets-electronics': 29705,
'wireless-earbuds': 29726,
'headphones': 29768,
'smart-watches': 29725,

// Computer & Office Accessories
'computer-office-accessories': 29703,
'keyboards': 29727,
'mouse': 29737,

// Gaming Accessories
'gaming-accessories': 29699,
'ps5-accessories': 29700,
'speakers': 29735,

// Cables & Connectivity
'cables-connectivity': 29717,

// Power & Energy
'power-energy': 29710,
'power-banks': 29711,
'chargers': 29712,

// Audio & Sound
'audio-sound': 29721,

// Verified live subcategory slugs
'educational-toys': 37162,

// Home & Living Electronics
'home-living-electronics': 29708,

// Shared (used across but single slug)
'lighting': 29709,
};

// Clear cache function (useful for debugging)
export const clearCategoryCache = () => {
  Object.keys(_categoryCache).forEach(key => delete _categoryCache[key]);
  Object.keys(_productCache).forEach(key => delete _productCache[key]);
  console.log('✅ Cache cleared');
};

export const API_BASE = "https://db.store1920.com/wp-json/wc/v3";
export const CONSUMER_KEY = "ck_8dfeb134379e51fa95e3a22769f67bd6b4f0e507";
export const CONSUMER_SECRET = "cs_2e5da71434cc874771a8ab0ef2dae2ffef3591c0";
const SHORT_DESC_API_BASE = "https://db.store1920.com/wp-json/store1920/v1/product";
const STORE1920_API_BASE = "https://db.store1920.com/wp-json/store1920/v1";
const WP_MEDIA_API_BASE = "https://db.store1920.com/wp-json/wp/v2/media";
const WP_PRODUCTS_API_BASE = "https://db.store1920.com/wp-json/wp/v2/product";

const authParams = `consumer_key=${CONSUMER_KEY}&consumer_secret=${CONSUMER_SECRET}`;

const hasMeaningfulHtml = (html) => {
  if (!html) return false;
  const text = String(html)
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;|\s+/g, '')
    .trim();
  return text.length > 0;
};

const enrichWithShortDescription = async (product) => {
  if (!product?.id) return product;
  if (hasMeaningfulHtml(product.short_description)) return product;

  try {
    const response = await axios.get(`${SHORT_DESC_API_BASE}/${product.id}`);
    const data = response?.data;
    if (data?.short_description) {
      return { ...product, short_description: data.short_description };
    }
  } catch (error) {
    console.warn('⚠️ Short description fetch failed:', error?.message || error);
  }

  return product;
};

// ===================== Generic Fetch =====================
export async function fetchAPI(endpoint) {
  try {
    const separator = endpoint.includes("?") ? "&" : "?";
    const url = `${API_BASE}${endpoint}${separator}${authParams}`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("fetchAPI error:", error);
    return null;
  }
}

export async function getMediaByIds(ids = []) {
  const uniqueIds = Array.from(
    new Set(
      (Array.isArray(ids) ? ids : [])
        .map((id) => Number.parseInt(id, 10))
        .filter((id) => Number.isFinite(id) && id > 0)
    )
  );

  if (!uniqueIds.length) return [];

  try {
    const response = await axios.get(
      `${WP_MEDIA_API_BASE}?include=${uniqueIds.join(",")}&per_page=${Math.min(uniqueIds.length, 100)}&_fields=id,source_url,alt_text,title`
    );

    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("getMediaByIds error:", error);
    return [];
  }
}

export async function getVariationGalleries(productId) {
  if (!productId) return [];

  try {
    const response = await axios.get(`${STORE1920_API_BASE}/products/${productId}/variation-galleries`);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.warn("getVariationGalleries error:", error?.message || error);
    return [];
  }
}

export async function getAllBrands() {
  try {
    const response = await axios.get(
      `https://db.store1920.com/wp-json/store1920/v1/brands`,
      {
        withCredentials: true,
      }
    );
    console.log("getAllBrands response:", response.data);
    return response?.data || [];
  } catch (error) {
    console.error("getAllBrands error:", error);
    return [];
  }
}

export async function getBrandBySlug(slug) {
  if (!slug) return null;

  try {
    const response = await axios.get(
      `https://db.store1920.com/wp-json/custom/v1/brand/${encodeURIComponent(slug)}`,
       {
    withCredentials: true, // ✅ VERY IMPORTANT
  }
    );
     console.log("API RESPONSE:", response.data); // 👈 ADD THIS
    return response?.data || null;
  } catch (error) {
    console.error("getBrandBySlug error:", error);
    return null;
  }
}

export async function getCourierBanner() {
  try {
    const response = await axios.get("https://db.store1920.com/wp-json/store1920/v1/banner");
    return response?.data?.banner_url || "";
  } catch (error) {
    console.error("getCourierBanner error:", error);
    return "";
  }
}

// ===================== Categories =====================
export const getCategoryById = (id) => fetchAPI(`/products/categories/${id}`);
export const getCategoryBySlug = async (slug) => {
  console.log('🔍 getCategoryBySlug called with slug:', slug);
  const normalizedSlug = String(slug || "").toLowerCase().trim();
  if (!normalizedSlug) return [];

  const allCategories = await getCategories();
  const matches = (Array.isArray(allCategories) ? allCategories : []).filter(
    (category) => String(category?.slug || "").toLowerCase().trim() === normalizedSlug
  );

  console.log('📦 getCategoryBySlug filtered matches:', matches);
  console.log('📦 Result is array?:', Array.isArray(matches), 'Length:', matches?.length);
  if (matches.length > 0) {
    console.log('✅ Found category:', matches[0].name, 'ID:', matches[0].id, 'Slug:', matches[0].slug);
  }
  return matches;
};
export const getChildCategories = (parentId) => fetchAPI(`/products/categories?parent=${parentId}`);
export const getCategories = async () => {
  console.log('🔍 Fetching all categories...');
  const allCategories = [];
  let page = 1;

  while (true) {
    const result = await fetchAPI(`/products/categories?per_page=100&page=${page}&hide_empty=false`);
    const categories = Array.isArray(result) ? result : [];

    allCategories.push(...categories);

    if (categories.length < 100) {
      break;
    }

    page += 1;
  }

  console.log('📦 All categories count:', allCategories.length);
  if (allCategories.length > 0) {
    console.log('📋 First 10 category slugs:', allCategories.slice(0, 10).map(c => `"${c.slug}" (${c.name})`).join(', '));
  }

  return allCategories;
};


// ===================== Enhanced Category Fetching by Slug =====================
export const getCategoryBySlugAdvanced = async (slug) => {
  try {
    console.log('=== Starting category fetch for slug:', slug, '===');
    
    // PRIORITY 1: Check static mapping FIRST (100% reliable)
    if (CATEGORY_SLUG_MAP[slug]) {
      const categoryId = CATEGORY_SLUG_MAP[slug];
      console.log('✅ STATIC MAPPING FOUND! Slug:', slug, '-> ID:', categoryId);
      
      // Fetch the full category object by ID
      try {
        const category = await getCategoryById(categoryId);
        if (category) {
          console.log('✅ Category loaded:', category.name, 'ID:', category.id);
          return category;
        }
      } catch (error) {
        console.error('Error fetching category by ID:', categoryId, error.message);
      }
    } else {
      console.log('⚠️ No static mapping for slug:', slug);
    }

    // PRIORITY 2: Direct exact slug lookup via WooCommerce API
    console.log('Step 2: Trying exact slug lookup...');
    try {
      const directMatches = await getCategoryBySlug(slug);
      if (Array.isArray(directMatches) && directMatches.length > 0) {
        const exactMatch = directMatches.find((category) => category?.slug === slug);
        if (exactMatch) {
          console.log('✅ Direct slug lookup found category:', exactMatch.name, 'ID:', exactMatch.id);
          return exactMatch;
        }
      }
    } catch (directLookupError) {
      console.error('Error in direct slug lookup:', directLookupError.message);
    }
    
    console.log('ERROR: No exact category found for slug:', slug);
    
    console.log('=== No category found ===');
    return null;
    
  } catch (error) {
    console.error('FATAL ERROR in getCategoryBySlugAdvanced:', error);
    return null;
  }
};

// ===================== Products =====================
export const getProductsByCategory = (categoryId, page = 1, perPage = 42) =>
  // Remove _fields to allow custom fields like enable_saving_badge
  fetchAPI(`/products?category=${categoryId}&per_page=${perPage}&page=${page}&orderby=date&order=desc&status=publish&catalog_visibility=visible`);

// ===================== Enhanced Products by Category Slug =====================
export const getProductsByCategorySlugAdvanced = async (slug, page = 1, perPage = 8) => {
  try {
    console.log('🎯 getProductsByCategorySlugAdvanced called - slug:', slug, 'page:', page);
    
    // Check cache for category (only use cache after initial fetch)
    let category = null;
    
    // Always fetch fresh on page 1 to ensure we have the right category
    if (page === 1) {
      console.log('🔄 Page 1 - fetching fresh category data');
      category = await getCategoryBySlugAdvanced(slug);
      if (category && category.id) {
        _categoryCache[slug] = category;
        console.log('✅ Cached category:', category.name, 'ID:', category.id);
      }
    } else {
      // Use cache for subsequent pages
      category = _categoryCache[slug];
      if (!category) {
        console.log('⚠️ No cached category, fetching fresh');
        category = await getCategoryBySlugAdvanced(slug);
        if (category && category.id) _categoryCache[slug] = category;
      }
    }
    
    if (!category || !category.id) {
      console.log('❌ No category found for slug:', slug);
      return { products: [], category: null, hasMore: false };
    }

    console.log('✅ Using category:', category.name, 'ID:', category.id);

    // Cache key for products
    const cacheKey = `${category.id}_${page}_${perPage}`;
    if (_productCache[cacheKey]) {
      console.log('📦 Using cached products for key:', cacheKey);
      return { products: _productCache[cacheKey], category, hasMore: _productCache[cacheKey].length >= perPage };
    }

    // Fetch products for this category
    console.log('🔍 Fetching products for category ID:', category.id);
    const products = await getProductsByCategory(category.id, page, perPage);
    console.log('📦 Fetched products count:', products?.length);
    
    if (products) _productCache[cacheKey] = products;
    const hasMore = products && products.length >= perPage;
    return {
      products: products || [],
      category: category,
      hasMore: hasMore
    }; 
  } catch (error) {
    console.error('❌ Error in getProductsByCategorySlugAdvanced:', error);
    return { products: [], category: null, hasMore: false };
  }
};

export const getProductsByCategories = async (categoryIds = [], page = 1, perPage = 12, order = "desc") => {
  if (!Array.isArray(categoryIds) || !categoryIds.length) return [];
  try {
    const products = await fetchAPI(`/products?category=${categoryIds.join(",")}&per_page=${perPage}&page=${page}&orderby=date&order=${order}&status=publish&catalog_visibility=visible`);
    return Array.isArray(products) ? products : [];
  } catch (error) {
    console.error('❌ Error fetching products by categories:', error);
    return [];
  }
};

export const getProductBySlug = async (slug) => {
  const data = await fetchAPI(`/products?slug=${slug}&_fields=id,name,slug,images,price,regular_price,sale_price,stock_status,stock_quantity,manage_stock,is_in_stock,average_rating,review_count,short_description,description,attributes,upsell_ids,cross_sell_ids,variations,sku,total_sales,subtitle,cod_available`);
  const product = Array.isArray(data) && data.length > 0 ? data[0] : null;
  return enrichWithShortDescription(product);
};

export const getShortDescriptionBySlug = async (slug) => {
  if (!slug) return '';
  const data = await fetchAPI(`/products?slug=${slug}&_fields=short_description`);
  if (Array.isArray(data) && data.length > 0 && data[0]?.short_description) {
    return data[0].short_description || '';
  }

  try {
    const wpV2 = await axios.get(
      `https://db.store1920.com/wp-json/wp/v2/product?slug=${encodeURIComponent(slug)}&_fields=excerpt`
    );
    const wpData = wpV2?.data;
    if (Array.isArray(wpData) && wpData.length > 0) {
      return wpData[0]?.excerpt?.rendered || '';
    }
  } catch (error) {
    console.warn('⚠️ WP v2 excerpt fetch failed:', error?.message || error);
  }

  return '';
};

export const getProductById = async (id) => {
  const product = await fetchAPI(`/products/${id}?_fields=id,name,slug,images,price,regular_price,sale_price,stock_status,stock_quantity,manage_stock,is_in_stock,average_rating,review_count,short_description,description,attributes,upsell_ids,cross_sell_ids,variations,sku,total_sales,subtitle,cod_available`);
  return enrichWithShortDescription(product);
};
export const searchProducts = async (term, limit = 50) => {
  const rawTerm = String(term || '').trim();
  if (!rawTerm) return [];

  const normalize = (value) =>
    String(value || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();

  const wanted = normalize(rawTerm);
  const perPage = Math.max(10, Math.min(Number(limit) || 50, 100));
  const fields = '_fields=id,name,slug,sku,images,price,regular_price,sale_price,status,catalog_visibility';

  const [bySearch, bySlugExact, bySkuExact] = await Promise.all([
    fetchAPI(`/products?search=${encodeURIComponent(rawTerm)}&status=publish&catalog_visibility=visible&per_page=${perPage}&${fields}`),
    fetchAPI(`/products?slug=${encodeURIComponent(rawTerm)}&status=publish&catalog_visibility=visible&per_page=10&${fields}`),
    fetchAPI(`/products?sku=${encodeURIComponent(rawTerm)}&status=publish&catalog_visibility=visible&per_page=10&${fields}`),
  ]);

  const merged = [];
  const seen = new Set();
  const pushUnique = (items) => {
    (Array.isArray(items) ? items : []).forEach((item) => {
      const id = Number(item?.id);
      if (!id || seen.has(id)) return;
      seen.add(id);
      merged.push(item);
    });
  };

  pushUnique(bySearch);
  pushUnique(bySlugExact);
  pushUnique(bySkuExact);

  // Fallback: broad fetch + local match for products Woo search can miss.
  if (merged.length < Math.min(12, perPage)) {
    const [page1, page2] = await Promise.all([
      fetchAPI(`/products?status=publish&catalog_visibility=visible&orderby=date&order=desc&per_page=100&page=1&${fields}`),
      fetchAPI(`/products?status=publish&catalog_visibility=visible&orderby=date&order=desc&per_page=100&page=2&${fields}`),
    ]);

    const fallbackPool = [...(Array.isArray(page1) ? page1 : []), ...(Array.isArray(page2) ? page2 : [])];
    const localMatches = fallbackPool.filter((p) => {
      const hay = `${normalize(p?.name)} ${normalize(p?.slug)} ${normalize(p?.sku)}`;
      return wanted && hay.includes(wanted);
    });
    pushUnique(localMatches);
  }

  return merged.slice(0, perPage);
};
export const getProductsByIds = (ids = []) => {
  if (!Array.isArray(ids) || !ids.length) return [];
  return fetchAPI(`/products?include=${ids.join(",")}`);
};

// ===================== Tags =====================
export const getTagIdsBySlugs = async (slugs = []) => {
  if (!slugs.length) return [];
  const allTags = await fetchAPI("/products/tags?per_page=100");
  if (!allTags || !Array.isArray(allTags)) return [];
  return slugs
    .map((slug) => allTags.find((t) => t.slug.toLowerCase() === slug.toLowerCase())?.id)
    .filter(Boolean);
};

export const getProductsByTagSlugs = async (slugs = [], page = 1, perPage = 42, orderBy = "date", order = "desc") => {
  const tagIds = await getTagIdsBySlugs(slugs);
  if (!tagIds.length) return [];
  const url = `/products?tag=${tagIds.join(",")}&per_page=${perPage}&page=${page}&orderby=${orderBy}&order=${order}&status=publish&catalog_visibility=visible&_fields=id,name,slug,images,price,total_sales,enable_saving_badge
`;
  return fetchAPI(url);
};

// ===================== Specific Tag-based Products =====================
export const getNewArrivalsProducts = (page = 1, perPage = 24) => getProductsByTagSlugs(["new-arrivals"], page, perPage);
export const getRatedProducts = (page = 1, perPage = 24) => getProductsByTagSlugs(["rated"], page, perPage, "rating");
export const getFestSaleProducts = (page = 1, perPage = 24) => getProductsByTagSlugs(["fest-sale"], page, perPage);
export const getLatestPublishedProducts = async (page = 1, perPage = 24) => {
  try {
    const publishedResponse = await axios.get(
      `${WP_PRODUCTS_API_BASE}?per_page=${perPage}&page=${page}&orderby=date&order=desc&status=publish&_fields=id,date,date_gmt`
    );

    const publishedProducts = Array.isArray(publishedResponse?.data) ? publishedResponse.data : [];
    const publishedIds = publishedProducts
      .map((product) => Number(product?.id))
      .filter((id) => Number.isFinite(id) && id > 0);

    if (!publishedIds.length) {
      return [];
    }

    const wooProducts = await fetchAPI(
      `/products?include=${publishedIds.join(",")}&orderby=include&status=publish&catalog_visibility=visible&per_page=${publishedIds.length}&_fields=id,name,slug,type,images,price,regular_price,sale_price,stock_status,stock_quantity,variations,enable_offer,date_created,date_created_gmt`
    );

    const wooProductMap = new Map(
      (Array.isArray(wooProducts) ? wooProducts : [])
        .filter(Boolean)
        .map((product) => [Number(product.id), product])
    );

    return publishedProducts
      .map((publishedProduct) => {
        const product = wooProductMap.get(Number(publishedProduct.id));
        if (!product) return null;

        return {
          ...product,
          date_created: product.date_created || publishedProduct.date,
          date_created_gmt: product.date_created_gmt || publishedProduct.date_gmt,
        };
      })
      .filter(Boolean);
  } catch (error) {
    console.error("getLatestPublishedProducts error:", error);
    return [];
  }
};
// Use Woo's supported alias 'popularity' (maps to total_sales)
export const getTopSellingItemsProducts = (page = 1, perPage = 24) =>
  getProductsByTagSlugs(["top-selling"], page, perPage, "popularity");

// Fallback: get popular products irrespective of tag
export const getPopularProducts = (page = 1, perPage = 24) =>
  fetchAPI(`/products?per_page=${perPage}&page=${page}&orderby=popularity&order=desc&status=publish&catalog_visibility=visible&_fields=id,name,slug,images,price,total_sales,enable_saving_badge`);

// ===================== Variations =====================
export const getFirstVariation = async (productId) => {
  try {
    const data = await fetchAPI(`/products/${productId}/variations?per_page=1`);
    return data?.[0] || null;
  } catch (err) {
    console.error("getFirstVariation error:", err);
    return null;
  }
};

// ===================== Currency =====================
export const getCurrencySymbol = async () => {
  try {
    const res = await fetch(`${API_BASE}/settings?${authParams}`);
    const data = await res.json();
    return data?.currency_symbol || "AED";
  } catch {
    return "AED";
  }
};

// ===================== Reviews =====================
// export const getProductReviews = (productId, perPage = 20) =>
//   fetchAPI(`/products/${productId}/reviews?per_page=${perPage}`);

// export const addProductReview = async (productId, { review, reviewer, reviewer_email, rating = 5 }) => {
//   try {
//     const res = await fetch(`${API_BASE}/products/${productId}/reviews?${authParams}`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ review, reviewer, reviewer_email, rating }),
//     });
//     if (!res.ok) throw new Error(`Failed to submit review: ${res.status}`);
//     return await res.json();
//   } catch {
//     return null;
//   }
// };

// ===================== Other APIs =====================
export const getFastProducts = async (limit = 4) => {
  try {
    const res = await fetch(`https://db.store1920.com/wp-json/custom/v1/fast-products`);
    if (!res.ok) throw new Error("Fast products API error");
    const data = await res.json();
    return Array.isArray(data) ? data.slice(0, limit) : [];
  } catch (err) {
    console.error("getFastProducts error:", err);
    return [];
  }
};

export const getPromo = async () => {
  try {
    const res = await fetch(`${API_BASE}/custom/v1/promo`);
    if (!res.ok) throw new Error("Promo API error");
    return await res.json();
  } catch {
    return null;
  }
};

// ===================== Orders =====================
export const getOrderById = async (orderId) => {
  if (!orderId) return null;
  
  try {
    // Fetch the order data
    const order = await fetchAPI(`/orders/${orderId}`);
    if (!order) return null;

    // Enhance line items with product images
    const enhancedLineItems = await Promise.all(
      order.line_items.map(async (item) => {
        try {
          // Fetch product details to get images
          const product = await fetchAPI(`/products/${item.product_id}`);
          return {
            ...item,
            image: product?.images?.[0] || null
          };
        } catch (error) {
          console.error(`Error fetching product ${item.product_id}:`, error);
          return item;
        }
      })
    );

    return {
      ...order,
      line_items: enhancedLineItems
    };
  } catch (error) {
    console.error("getOrderById error:", error);
    return null;
  }
};

export const getOrdersByEmail = (email, perPage = 20) =>
  email ? fetchAPI(`/orders?customer=${email}&per_page=${perPage}&orderby=date&order=desc`) : [];

// ===================== Top Sold Products =====================
export const getTopSoldProducts = async (hours = 24, limit = 5) => {
  // Some WooCommerce installs do not support orderby=total_sales or date_modified_min.
  // We try a compatibility chain: popularity -> rating -> recent.
  const attempts = [
    `${API_BASE}/products?per_page=${limit}&orderby=popularity&order=desc&status=publish&${authParams}`,
    `${API_BASE}/products?per_page=${limit}&orderby=rating&order=desc&status=publish&${authParams}`,
    `${API_BASE}/products?per_page=${limit}&orderby=date&order=desc&status=publish&${authParams}`,
  ];

  for (const url of attempts) {
    try {
      const res = await fetch(url);
      if (!res.ok) {
        // Read response text to aid debugging, but keep going to next attempt
        const txt = await res.text().catch(() => '');
        console.warn(`getTopSoldProducts attempt failed: ${url} -> ${res.status} ${txt}`);
        continue;
      }
      const data = await res.json();
      if (Array.isArray(data) && data.length) return data;
    } catch (err) {
      console.warn(`getTopSoldProducts network error for ${url}:`, err?.message || err);
      continue;
    }
  }

  // Final fallback: return empty list
  return [];
};
// ===================== New: Products by Category Slug =====================
export const getProductsByCategorySlug = async (slug, page = 1, perPage = 42, order = "desc") => {
  try {
    // 1️⃣ Get category by slug
    const categories = await getCategoryBySlug(slug);
    if (!categories?.length) return [];

    const parentCategory = categories[0];

    // 2️⃣ Get child categories
    const children = await getChildCategories(parentCategory.id);
    const categoryIds = [parentCategory.id, ...(children?.map(c => c.id) || [])];

    if (!categoryIds.length) return [];

    // 3️⃣ Get products for all category IDs
    const products = await getProductsByCategories(categoryIds, page, perPage, order);
    return products || [];
  } catch (err) {
    console.error("getProductsByCategorySlug error:", err);
    return [];
  }
};

export const getProductsByExactWooCategorySlug = async (slug, page = 1, perPage = 42, order = "desc") => {
  try {
    const normalizedSlug = String(slug || "").toLowerCase().trim();
    if (!normalizedSlug) return [];

    const staticCategoryId = CATEGORY_SLUG_MAP[normalizedSlug];
    let categoryId = staticCategoryId || null;

    if (!categoryId) {
      const categories = await getCategoryBySlug(normalizedSlug);
      categoryId = categories?.[0]?.id || null;
    }

    if (!categoryId) return [];

    const products = await fetchAPI(
      `/products?category=${categoryId}&per_page=${perPage}&page=${page}&orderby=date&order=${order}&status=publish&catalog_visibility=visible&_fields=id,name,slug,images,price,regular_price,sale_price,stock_status,stock_quantity,manage_stock,is_in_stock,average_rating,review_count,short_description,description,attributes,upsell_ids,cross_sell_ids,variations,sku,total_sales,subtitle,cod_available,categories,type`
    );

    const validProducts = Array.isArray(products) ? products : [];

    return validProducts.filter((product) =>
      Array.isArray(product?.categories) &&
      product.categories.some((category) => {
        const categorySlug = String(category?.slug || "").toLowerCase().trim();
        const categoryName = String(category?.name || "").toLowerCase().trim();
        return categorySlug === normalizedSlug || categoryName === normalizedSlug;
      })
    );
  } catch (err) {
    console.error("getProductsByExactWooCategorySlug error:", err);
    return [];
  }
};

export const getLightProductsByCategories = (categoryIds = [], page = 1, perPage = 42, order = "desc") => {
  if (!Array.isArray(categoryIds) || !categoryIds.length) return [];
  return fetchAPI(
    `/products?category=${categoryIds.join(",")}&per_page=${perPage}&page=${page}&orderby=date&order=${order}&status=publish&catalog_visibility=visible&_fields=id,name,slug,price,images`
  );
};
export const getLightProductsByCategorySlug = async (slug, page = 1, perPage = 42, order = "desc") => {
  try {
    // 1️⃣ Get category by slug
    const categories = await getCategoryBySlug(slug);
    if (!categories?.length) return [];

    const parentCategory = categories[0];

    // 2️⃣ Get child categories
    const children = await getChildCategories(parentCategory.id);
    const categoryIds = [parentCategory.id, ...(children?.map(c => c.id) || [])];

    if (!categoryIds.length) return [];

    // 3️⃣ Fetch only lightweight product data
    const products = await getLightProductsByCategories(categoryIds, page, perPage, order);

    // 4️⃣ Limit images to first 2
    return (products || []).map((p) => ({
      ...p,
      images: p.images ? p.images.slice(0, 2) : [],
    }));
  } catch (err) {
    console.error("getLightProductsByCategorySlug error:", err);
    return [];
  }
};

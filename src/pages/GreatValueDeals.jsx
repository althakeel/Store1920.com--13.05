import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { getProductsByExactWooCategorySlug } from '../api/woocommerce';
import ComboBanner from '../assets/images/combobanner/Great Value Deals.webp';

const bannerWrapperStyle = {
  position: 'relative',
  width: '100%',
  maxWidth: '1400px',
  margin: '0 auto',
  padding: '0 16px',
  boxSizing: 'border-box',
};

const sectionStyle = {
  backgroundImage: `url('${ComboBanner}')`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  padding: '0',
  marginTop: '12px',
  minHeight: '270px',
  width: '100%',
  boxSizing: 'border-box',
  borderRadius: '25px',
  overflow: 'hidden',
};

const filterSortContainerStyle = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '30px 20px',
  background: 'linear-gradient(135deg, #f8f7ff 0%, #faf9ff 100%)',
  borderRadius: '12px',
  marginBottom: '20px',
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: '24px',
  alignItems: 'end',
};

const filterGroupStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
};

const filterGroupTitleStyle = {
  fontSize: '13px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  color: '#2f005f',
};

const selectStyle = {
  padding: '10px 14px',
  border: '2px solid #e0d5ff',
  borderRadius: '8px',
  fontSize: '14px',
  cursor: 'pointer',
  background: '#fff',
  fontWeight: '500',
};

const checkboxGroupStyle = {
  display: 'flex',
  gap: '16px',
  flexWrap: 'wrap',
};

const gridStyle = {
  display: 'grid',
  gap: '20px',
  padding: '24px 16px 40px',
  maxWidth: '1400px',
  margin: '0 auto',
  justifyContent: 'center',
};

const GreatValueDeals = () => {
  const navigate = useNavigate();
  const { addToCart, cartItems, updateQuantity } = useCart();

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [sortBy, setSortBy] = useState('newest');
  const [maxPrice, setMaxPrice] = useState(10000);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedDealTypes, setSelectedDealTypes] = useState([]);
  const [availableBrands, setAvailableBrands] = useState([]);

  const [promoTicker, setPromoTicker] = useState(0);

  const dealTypes = [
    { id: 'buy1get1', label: 'Buy 1 Get 1 Free' },
    { id: 'buy2get1', label: 'Buy 2 Get 1 Free' },
    { id: 'buy2get2', label: 'Buy 2 Get 2 Free' },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setPromoTicker((v) => (v + 1) % 3);
    }, 2600);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchComboProducts = async () => {
      setLoading(true);
      try {
        const data = await getProductsByExactWooCategorySlug('combo', 1, 50);
        setProducts(data || []);

        const brands = new Set();
        (data || []).forEach((product) => {
          if (!product.brands) return;
          if (Array.isArray(product.brands)) {
            product.brands.forEach((b) => brands.add(b));
          } else {
            brands.add(product.brands);
          }
        });
        setAvailableBrands(Array.from(brands).filter(Boolean));
      } catch (err) {
        console.error('Error fetching combo products:', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchComboProducts();
  }, []);

  useEffect(() => {
    let filtered = [...products];

    if (inStockOnly) {
      filtered = filtered.filter((p) => p.stock_status === 'instock' || p.is_in_stock);
    }

    filtered = filtered.filter((p) => {
      const price = parseFloat(p.price || p.regular_price || 0);
      return price <= maxPrice;
    });

    if (selectedBrands.length > 0) {
      filtered = filtered.filter((p) => {
        const productBrands = Array.isArray(p.brands) ? p.brands : [p.brands];
        return selectedBrands.some((brand) => productBrands.includes(brand));
      });
    }

    if (selectedDealTypes.length > 0) {
      filtered = filtered.filter((p) => {
        const text = `${p.description || ''} ${p.short_description || ''} ${p.name || ''}`.toLowerCase();
        return selectedDealTypes.some((dealType) => {
          if (dealType === 'buy1get1') return text.includes('buy 1 get 1');
          if (dealType === 'buy2get1') return text.includes('buy 2 get 1');
          if (dealType === 'buy2get2') return text.includes('buy 2 get 2');
          return false;
        });
      });
    }

    if (sortBy === 'price_low') {
      filtered.sort((a, b) => parseFloat(a.price || a.regular_price || 0) - parseFloat(b.price || b.regular_price || 0));
    } else if (sortBy === 'price_high') {
      filtered.sort((a, b) => parseFloat(b.price || b.regular_price || 0) - parseFloat(a.price || a.regular_price || 0));
    } else if (sortBy === 'rating') {
      filtered.sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0));
    }

    setFilteredProducts(filtered);
  }, [products, sortBy, maxPrice, inStockOnly, selectedBrands, selectedDealTypes]);

  const rotatingStatusMessages = [
    { icon: '🔥', text: 'Selling out fast' },
    { icon: '🚚', text: 'Free Shipping' },
    { icon: '⚡', text: 'Delivery in 2-5 days' },
  ];

  return (
    <div style={{ minHeight: '50dvh' }}>
      <style>{`
        .great-value-banner {
          border-radius: 25px;
          overflow: hidden;
        }
        .great-value-grid {
          grid-template-columns: repeat(5, minmax(0, 1fr));
        }
        @media (max-width: 1200px) {
          .great-value-grid {
            grid-template-columns: repeat(4, minmax(0, 1fr));
          }
        }
        @media (max-width: 1024px) {
          .great-value-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }
        @media (max-width: 900px) {
          .great-value-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
        .gv-card {
          background: #fff;
          border-radius: 20px;
          border: 1px solid #ececf1;
          box-shadow: 0 6px 18px rgba(24, 24, 39, 0.07);
          padding: 14px;
          position: relative;
          display: flex;
          flex-direction: column;
          animation: fadeInUp .45s ease both;
        }
        .gv-name {
          font-weight: 700;
          font-size: 17px;
          color: #1f2430;
          line-height: 1.2;
          min-height: 40px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          margin: 8px 0 6px;
        }
        .gv-promo {
          background: linear-gradient(90deg, #26107a 0%, #3c17b3 100%);
          color: #fff;
          border-radius: 22px;
          min-height: 38px;
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 0 10px;
          font-weight: 700;
          font-size: 12px;
          line-height: 1;
          flex: 1;
          white-space: nowrap;
        }
        .gv-promo-yellow { color: #ffe14a; }
        .gv-fade {
          animation: fadeSwap .35s ease;
          white-space: nowrap;
        }
        .gv-status-row {
          min-height: 22px;
        }
        .gv-status-swap {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          animation: smoothStatusSwap .45s cubic-bezier(0.22, 1, 0.36, 1);
          white-space: nowrap;
        }
        @keyframes fadeSwap {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes smoothStatusSwap {
          from { opacity: 0; transform: translateY(7px) scale(0.99); filter: blur(1px); }
          to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes gvCheckoutPop {
          from { opacity: 0; transform: scale(0.88); }
          to { opacity: 1; transform: scale(1); }
        }

        /* ---- Mobile responsive ---- */
        @media (max-width: 600px) {
          .great-value-banner-wrap {
            padding: 0 8px !important;
          }
          .great-value-banner {
            border-radius: 14px !important;
            min-height: 140px !important;
          }
          .great-value-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 10px !important;
            padding: 12px 8px 28px !important;
          }
          .gv-card {
            border-radius: 14px !important;
            padding: 8px !important;
          }
          .gv-card-img {
            min-height: 130px !important;
          }
          .gv-name {
            font-size: 13px !important;
            min-height: 32px !important;
            margin: 5px 0 4px !important;
          }
          .gv-promo {
            font-size: 10px !important;
            min-height: 32px !important;
            padding: 0 7px !important;
            gap: 3px !important;
          }
          .gv-status-row {
            font-size: 11px !important;
            margin-bottom: 6px !important;
          }
          .gv-plus-btn {
            display: none !important;
          }
          .gv-mobile-atc {
            display: flex !important;
          }
          .gv-mobile-stepper {
            display: flex !important;
          }
          .gv-checkout-row {
            display: none !important;
          }
          .great-value-grid .gv-card:nth-child(n+5) {
            display: none !important;
          }
        }
        .gv-plus-btn {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .gv-mobile-atc--in-cart {
          background: linear-gradient(90deg, #16a34a 0%, #15803d 100%) !important;
        }
        .gv-mobile-atc {
          display: none !important;
          width: 100%;
          margin-top: 8px;
          height: 38px;
          border-radius: 22px;
          border: none;
          background: linear-gradient(90deg, #26107a 0%, #3c17b3 100%);
          color: #fff;
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
          align-items: center;
          justify-content: center;
          gap: 6px;
          letter-spacing: 0.3px;
        }
        .gv-mobile-stepper {
          display: none;
          width: 100%;
          margin-top: 8px;
          height: 40px;
          border-radius: 22px;
          border: 1px solid #d9cdf7;
          background: #f5f0ff;
          color: #2f005f;
          align-items: center;
          justify-content: space-between;
          padding: 0 6px;
          box-shadow: 0 3px 10px rgba(47,0,95,0.16);
        }
        .gv-mobile-stepper-btn {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: 1px solid #ccb6f3;
          background: #fff;
          color: #2f005f;
          font-size: 18px;
          font-weight: 800;
          line-height: 1;
          cursor: pointer;
        }
        .gv-mobile-stepper-count {
          text-align: center;
          flex: 1;
          font-size: 14px;
          font-weight: 800;
          letter-spacing: 0.2px;
        }
      `}</style>

      <div className="great-value-banner-wrap" style={bannerWrapperStyle}>
        <section className="great-value-banner" style={sectionStyle} />
      </div>

      <div className="great-value-grid" style={gridStyle}>
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="gv-card" style={{ height: 340, background: '#f5f5f9' }} />
          ))
        ) : filteredProducts.length > 0 ? (
          filteredProducts.map((product, idx) => {
            const brand = Array.isArray(product.brands) ? product.brands[0] : product.brands;
            const rating = parseFloat(product.average_rating || 0);
            const reviewCount = Number(product.rating_count || 0);
            const regularPrice = parseFloat(product.regular_price || product.price || 0);
            const salePrice = parseFloat(product.sale_price || product.price || 0);
            const onSale = salePrice < regularPrice && salePrice > 0;
            const discount = onSale ? Math.round(((regularPrice - salePrice) / regularPrice) * 100) : 0;
            const rotatingStatus = rotatingStatusMessages[(promoTicker + idx) % rotatingStatusMessages.length];
            const inCartQty = cartItems
              .filter((item) => item.id === product.id)
              .reduce((sum, item) => sum + (item.quantity || 1), 0);

            return (
              <div key={product.id} className="gv-card">
                {onSale && (
                  <span style={{ position: 'absolute', top: 10, left: 10, border: '1px solid #ffd3d3', color: '#ef4444', borderRadius: 16, fontWeight: 700, fontSize: 13, background: '#fff', padding: '4px 10px' }}>
                    On Sale
                  </span>
                )}
                {onSale && (
                  <span style={{ position: 'absolute', top: 10, right: 10, background: '#ef4444', color: '#fff', borderRadius: 12, fontWeight: 800, fontSize: 12, padding: '4px 9px', boxShadow: '0 2px 6px rgba(239,68,68,0.25)' }}>
                    -{discount}%
                  </span>
                )}

                <div className="gv-card-img" style={{ background: '#f8f8fb', borderRadius: 14, minHeight: 250, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  <img
                    src={product.images?.[0]?.src || ''}
                    alt={product.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }}
                    onClick={() => navigate(`/product/${product.slug}`)}
                  />
                </div>

                <div className="gv-name" title={product.name} onClick={() => navigate(`/product/${product.slug}`)}>
                  {product.name}
                </div>

                {brand && <div style={{ fontSize: 12, color: '#7a7f8d', marginBottom: 4 }}>{brand}</div>}

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ background: '#e8f7ec', color: '#16a34a', borderRadius: 8, padding: '2px 8px', fontSize: 14, fontWeight: 700 }}>
                    ★ {rating > 0 ? rating.toFixed(1) : '0.0'}
                  </span>
                  <span style={{ color: '#7a7f8d', fontSize: 14 }}>({reviewCount})</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'nowrap', gap: 4, marginBottom: 6, minWidth: 0 }}>
                  <span style={{ fontSize: 'clamp(14px, 2.5vw, 22px)', fontWeight: 800, color: '#1f2430', lineHeight: 1, whiteSpace: 'nowrap' }}>
                    AED {onSale ? salePrice.toLocaleString() : regularPrice.toLocaleString()}
                  </span>
                  {onSale && (
                    <>
                      <span style={{ textDecoration: 'line-through', color: '#9ca3af', fontSize: 'clamp(11px, 1.8vw, 14px)', whiteSpace: 'nowrap' }}>
                        AED {regularPrice.toLocaleString()}
                      </span>
                    </>
                  )}
                </div>

                <div className="gv-status-row" style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#f59e0b', fontWeight: 600, marginBottom: 10 }}>
                  <span key={`${product.id}-status-${promoTicker}`} className="gv-status-swap">
                    <span>{rotatingStatus.icon}</span>
                    <span style={{ color: '#6b7280' }}>{rotatingStatus.text}</span>
                  </span>
                </div>

                <div className="gv-checkout-row" style={{ display: 'flex', alignItems: 'center', gap: 6, overflow: 'hidden', width: '100%' }}>
                  {inCartQty > 0 ? (
                    <div
                      style={{
                        flex: 1,
                        height: 42,
                        borderRadius: 22,
                        border: '1px solid #d9cdf7',
                        background: '#f5f0ff',
                        color: '#2f005f',
                        fontSize: 13,
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0 6px',
                        boxShadow: '0 3px 10px rgba(47,0,95,0.16)',
                        letterSpacing: '0.2px',
                        animation: 'gvCheckoutPop .3s cubic-bezier(.23,1.02,.67,1)',
                      }}
                    >
                      <button
                        aria-label="decrease quantity"
                        onClick={() => updateQuantity(product.id, inCartQty - 1)}
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: '50%',
                          border: '1px solid #ccb6f3',
                          background: '#fff',
                          color: '#2f005f',
                          fontSize: 18,
                          fontWeight: 800,
                          lineHeight: 1,
                          cursor: 'pointer',
                        }}
                      >
                        -
                      </button>
                      <span style={{ textAlign: 'center', flex: 1 }}>
                        {inCartQty} in cart
                      </span>
                      <button
                        aria-label="increase quantity"
                        onClick={() => addToCart(product, false)}
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: '50%',
                          border: '1px solid #ccb6f3',
                          background: '#fff',
                          color: '#2f005f',
                          fontSize: 18,
                          fontWeight: 800,
                          lineHeight: 1,
                          cursor: 'pointer',
                        }}
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <div className="gv-promo">
                      <span>⚡</span>
                      <span>Delivery in <span className="gv-promo-yellow">2-5 days</span></span>
                      <span>›</span>
                    </div>
                  )}

                  {inCartQty === 0 && (
                    <button
                      aria-label="add to cart"
                      onClick={() => addToCart(product)}
                      className="gv-plus-btn"
                      style={{ width: 38, height: 38, borderRadius: 10, border: '1px solid #e8e8ed', background: '#fff', color: '#1f2430', fontSize: 22, fontWeight: 700, lineHeight: 1, cursor: 'pointer', flexShrink: 0 }}
                    >
                      +
                    </button>
                  )}
                </div>

                {inCartQty === 0 && (
                  <button
                    aria-label="add to cart mobile"
                    onClick={() => addToCart(product)}
                    className="gv-mobile-atc"
                  >
                    🛒 Add to Cart
                  </button>
                )}

                {inCartQty > 0 && (
                  <div className="gv-mobile-stepper">
                    <button
                      aria-label="decrease quantity mobile"
                      className="gv-mobile-stepper-btn"
                      onClick={() => updateQuantity(product.id, inCartQty - 1)}
                    >
                      -
                    </button>
                    <span className="gv-mobile-stepper-count">{inCartQty} in cart</span>
                    <button
                      aria-label="increase quantity mobile"
                      className="gv-mobile-stepper-btn"
                      onClick={() => addToCart(product, false)}
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#666' }}>
            No products found with the selected filters.
          </div>
        )}
      </div>
    </div>
  );
};

export default GreatValueDeals;

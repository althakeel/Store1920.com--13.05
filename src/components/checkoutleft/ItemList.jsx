import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';

// Safely import staticProducts with fallback
let staticProducts = [];
try {
  const staticProductsModule = require('../../data/staticProducts');
  staticProducts = staticProductsModule.default || staticProductsModule || [];
} catch (error) {
  console.warn('Could not load static products data:', error);
  staticProducts = [];
}

// Utility: convert product name to slug
const slugify = (text) =>
  text
    ?.toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-') || '';

const isCodEnabledValue = (value) => {
  if (value === true || value === 1) return true;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    return ['1', 'true', 'yes', 'on'].includes(normalized);
  }
  return false;
};

const ItemList = ({ items = [], onRemove, onUpdateQuantity }) => {
  const navigate = useNavigate();
  const { removeFromCart, updateQuantity } = useCart();
  const totalItemCount = items.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);

  if (!items.length) return <p style={{ textAlign: 'center', marginTop: 20 }}>Your cart is empty.</p>;

  // Get all static product IDs for COD checking
  let staticProductIds = [];
  try {
    staticProductIds = staticProducts.flatMap(product => {
      const ids = [];
      if (product.id) {
        ids.push(product.id);
      }
      if (product.bundles && Array.isArray(product.bundles)) {
        product.bundles.forEach(bundle => {
          if (bundle.id) {
            ids.push(bundle.id);
          }
        });
      }
      return ids;
    });
  } catch (error) {
    console.warn('Error loading static products for COD checking:', error);
    staticProductIds = [];
  }

  const handleItemClick = (item) => {
    if (!item || !item.name) return;
    navigate(`/product/${slugify(item.name)}`);
  };

  const handleRemove = (id) => {
    if (onRemove) onRemove(id);
    else removeFromCart?.(id);
  };

  const handleUpdateQuantity = (item, newQuantity) => {
    const id = item.id ?? item.product_id ?? item.sku;
    if (newQuantity <= 0) return handleRemove(id);

    if (onUpdateQuantity) onUpdateQuantity(id, newQuantity);
    else if (updateQuantity) updateQuantity(id, newQuantity);
  };

  const quantityStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  };

  const qtyButtonStyle = {
    width: 28,
    height: 28,
    border: '1px solid #ccc',
    borderRadius: 4,
    background: '#fff',
    cursor: 'pointer',
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  };

  const qtyNumberStyle = {
    minWidth: 52,
    textAlign: 'center',
    fontWeight: 'bold',
  };

  const qtyInputStyle = {
    width: 52,
    minWidth: 52,
    height: 28,
    border: '1px solid #ccc',
    borderRadius: 4,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#dd5405ff',
    outline: 'none',
    padding: '0 6px',
  };

  return (
    <div style={{ padding:"16px 5px" }}>
      <h3 style={{ marginBottom: 16 }}>Items in Cart ({totalItemCount})</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
        {items.map((item, index) => {
          const key = `${item.id ?? item.product_id ?? 'item'}-${index}`;
          const imageUrl = item.images?.[0]?.src || item.images?.[0]?.url || item.image || '';
          const rawPrice = item.prices?.price ?? item.price ?? 0;
          const price = parseFloat(rawPrice).toFixed(2);

          const hasStockInfo = ['stock_quantity', 'in_stock', 'is_in_stock', 'stock_status'].some(
            (key) => Object.prototype.hasOwnProperty.call(item, key)
          );

          const stockOutByQuantity =
            typeof item.stock_quantity === 'number' && item.stock_quantity <= 0;
          const stockOutByFlag =
            (typeof item.in_stock === 'boolean' && !item.in_stock) ||
            (typeof item.is_in_stock === 'boolean' && !item.is_in_stock) ||
            (typeof item.stock_status === 'string' &&
              item.stock_status.toLowerCase() !== 'instock');

          const isOutOfStock =
            (!price || parseFloat(price) <= 0) &&
            (hasStockInfo && (stockOutByQuantity || stockOutByFlag));

          // Business rule override: enable COD for all products.
          const isCodAvailable = true;
          const currentQuantity = Number(item.quantity) > 0 ? Number(item.quantity) : 1;
          const maxItemQuantity =
            Number.isInteger(item.stock_quantity) && item.stock_quantity > 0
              ? Math.min(item.stock_quantity, 99)
              : 99;

          return (
            <div
              key={key}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: 12,
                border: '1px solid #eee',
                borderRadius: 8,
                position: 'relative',
                opacity: isOutOfStock ? 0.6 : 1,
              }}
            >
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={item.name || 'Product image'}
                  style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 6 }}
                  loading="lazy"
                  draggable={false}
                />
              ) : (
                <div
                  style={{
                    width: 80,
                    height: 80,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    background: '#f0f0f0',
                    borderRadius: 6,
                    color: '#888',
                  }}
                >
                  No image
                </div>
              )}

              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontWeight: 600 }}>{item.name}</p>
                {item.isGift ? (
                  <p style={{ margin: '4px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ textDecoration: 'line-through', color: '#999', fontSize: '13px' }}>
                      AED {parseFloat(item.regular_price || item.originalPrice || price).toFixed(2)}
                    </span>
                    <span style={{ fontWeight: 700, color: '#0f6b3a', fontSize: '14px' }}>AED 0.00</span>
                  </p>
                ) : (
                  <p style={{ margin: '4px 0' }}>AED {price} × <span style={{fontWeight:"bold"}}>{item.quantity ?? 1}</span></p>
                )}
                
                {/* Free Gift Badge or COD Availability Badge */}
                <div style={{ marginTop: 6, display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {item.isGift && (
                    <span style={{
                      display: 'inline-block',
                      padding: '3px 8px',
                      background: 'linear-gradient(90deg, #0f6b3a, #1a9e56)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: '700',
                      letterSpacing: '0.3px',
                    }}>
                      🎁 Free Gift
                    </span>
                  )}
                  {!item.isGift && (isCodAvailable ? (
                    <span style={{
                      display: 'inline-block',
                      padding: '3px 8px',
                      backgroundColor: '#d4edda',
                      color: '#155724',
                      border: '1px solid #c3e6cb',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: '600',
                    }}>
                      ✓ COD Available
                    </span>
                  ) : (
                    <span style={{
                      display: 'inline-block',
                      padding: '3px 8px',
                      backgroundColor: '#f8d7da',
                      color: '#721c24',
                      border: '1px solid #f5c6cb',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: '600',
                    }}>
                      ✗ COD Not Available
                    </span>
                  ))}
                </div>

                <div style={item.isGift ? { display: 'none' } : quantityStyle}>
                  <button
                    style={qtyButtonStyle}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUpdateQuantity(item, currentQuantity - 1);
                    }}
                  >
                    −
                  </button>

                  <span style={qtyNumberStyle}>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={currentQuantity}
                      aria-label={`Enter quantity for ${item.name}`}
                      style={qtyInputStyle}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        const digitsOnly = e.target.value.replace(/[^\d]/g, '');
                        if (!digitsOnly) return;
                        const parsedValue = Number.parseInt(digitsOnly, 10);
                        if (!Number.isFinite(parsedValue)) return;

                        const nextQuantity = Math.min(Math.max(parsedValue, 1), maxItemQuantity);
                        if (nextQuantity !== currentQuantity) {
                          handleUpdateQuantity(item, nextQuantity);
                        }
                      }}
                      onBlur={(e) => {
                        const parsedValue = Number.parseInt(e.target.value, 10);
                        const nextQuantity = Number.isFinite(parsedValue)
                          ? Math.min(Math.max(parsedValue, 1), maxItemQuantity)
                          : currentQuantity;
                        if (nextQuantity !== currentQuantity) {
                          handleUpdateQuantity(item, nextQuantity);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.currentTarget.blur();
                        }
                      }}
                    />
                  </span>

                  <button
                    style={qtyButtonStyle}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUpdateQuantity(item, Math.min(currentQuantity + 1, maxItemQuantity));
                    }}
                    disabled={currentQuantity >= maxItemQuantity}
                  >
                    +
                  </button>
                </div>
                
              </div>
                

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(item.id ?? item.product_id ?? item.sku ?? index);
                }}
                style={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  border: 'none',
                  background: 'transparent',
                  fontSize: 35,
                  cursor: 'pointer',
                  color: '#888',
                }}
              >
                ×
              </button>

              {isOutOfStock && (
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    background: 'rgba(255,0,0,0.8)',
                    color: '#fff',
                    padding: '4px 8px',
                    borderRadius: 4,
                    fontWeight: 'bold',
                  }}
                >
                  Out of Stock
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ItemList;

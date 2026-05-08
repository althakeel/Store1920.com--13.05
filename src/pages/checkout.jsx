// src/pages/CheckoutPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import CheckoutLeft from '../components/CheckoutLeft';
import CheckoutRight from '../components/CheckoutRight';
import AutoFetchLocation from '../components/AutoFetchLocation';
// import SignInModal from '../components/sub/SignInModal';
import '../assets/styles/checkout.css';
import {
  CHECKOUT_FORM_STORAGE_KEY,
  createEmptyCheckoutFormData,
  getPreferredAddress,
  getUserScopedAddressKey,
  mapAccountAddressToCheckoutForm,
  readAddressBook,
} from '../utils/checkoutAddress';
import {
  cartHasDynamicProducts,
  getCartItemDisplayName,
  isStaticCartItem,
} from '../utils/staticProductCart';

const API_BASE = 'https://db.store1920.com/wp-json/wc/v3';
const CK = 'ck_e09e8cedfae42e5d0a37728ad6c3a6ce636695dd';
const CS = 'cs_2d41bc796c7d410174729ffbc2c230f27d6a1eda';

const fetchWithAuth = async (endpoint, options = {}) => {
  const url = `${API_BASE}/${endpoint}`;
  const authHeader = 'Basic ' + btoa(`${CK}:${CS}`);
  const fetchOptions = {
    ...options,
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  };

  try {
    const res = await fetch(url, fetchOptions);
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      console.warn(`API Error [${endpoint}]:`, errData.message || `Status ${res.status}`);
      throw new Error(errData.message || `Request failed with status ${res.status}`);
    }
    return res.json();
  } catch (error) {
    // Log network errors but don't show them to users
    if (error.message.includes('fetch')) {
      console.warn(`Network error for ${endpoint}:`, error.message);
      throw new Error('Network connection issue. Please check your internet connection.');
    }
    throw error;
  }
};

const sanitizeField = (value) => (value && value.trim() ? value : 'NA');
const DELIVERY_FEE = 13;
const FREE_SHIPPING_THRESHOLD = 100;
const FREE_GIFT_THRESHOLD = 150;
const FREE_GIFT_SLUGS = ['nexso-curly-hair-brush', 'nexso-black-mouth-tape-30pcs-hypoallergenic-snore-strips'];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cartItems: contextCartItems, clearCart } = useCart();
  const { user } = useAuth(); 


  const [cartItems, setCartItems] = useState([]);
  const [showForm, setShowForm] = useState(false); 
  const [countries, setCountries] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [coinDiscount, setCoinDiscount] = useState(0);
  const [formData, setFormData] = useState(createEmptyCheckoutFormData);

  const [orderId, setOrderId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [giftProducts, setGiftProducts] = useState([]);
  const [selectedGiftSlug, setSelectedGiftSlug] = useState(FREE_GIFT_SLUGS[0]);
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [showGiftGuide, setShowGiftGuide] = useState(false);
  // const [showSignInModal, setShowSignInModal] = useState(false);
  const [alert, setAlert] = useState({ message: '', type: 'info' });
  const [error, setError] = useState('');

  const subtotal = cartItems.reduce(
    (sum, item) => sum + (parseFloat(item.price) || 0) * item.quantity,
    0
  );
  const discountedSubtotal = Math.max(0, subtotal - discount - coinDiscount);
  const hasDynamicProducts = cartHasDynamicProducts(cartItems);
  // Free shipping and gift thresholds only count non-static, non-gift cart items
  const dynamicSubtotal = cartItems
    .filter(item => !isStaticCartItem(item) && !item.isGift)
    .reduce((sum, item) => sum + (parseFloat(item.price) || 0) * item.quantity, 0);
  const discountedDynamicSubtotal = Math.max(0, dynamicSubtotal - discount - coinDiscount);
  const deliveryFee =
    discountedDynamicSubtotal > 0 && discountedDynamicSubtotal < FREE_SHIPPING_THRESHOLD && hasDynamicProducts ? DELIVERY_FEE : 0;
  const freeShippingUnlocked = discountedDynamicSubtotal >= FREE_SHIPPING_THRESHOLD;
  const amountRemainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - discountedDynamicSubtotal);
  const freeGiftProgress = Math.min(
    100,
    Math.max(0, (discountedDynamicSubtotal / FREE_GIFT_THRESHOLD) * 100)
  );
  const giftUnlocked = discountedDynamicSubtotal >= FREE_GIFT_THRESHOLD;
  const amountRemainingForGift = Math.max(0, FREE_GIFT_THRESHOLD - discountedDynamicSubtotal);

  // Animate progress bar value for smoother visual feedback
  useEffect(() => {
    const startValue = animatedProgress;
    const endValue = freeGiftProgress;
    const durationMs = 900;
    let frameId;
    const startTime = performance.now();

    const animate = (now) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / durationMs, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setAnimatedProgress(startValue + (endValue - startValue) * eased);
      if (t < 1) frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [freeGiftProgress]);

  useEffect(() => {
    setShowGiftGuide(giftUnlocked);
  }, [giftUnlocked]);

  // Auto-hide gift guide after 5 seconds
  useEffect(() => {
    if (!showGiftGuide) return undefined;
    const timer = setTimeout(() => setShowGiftGuide(false), 5000);
    return () => clearTimeout(timer);
  }, [showGiftGuide]);

  // Fetch free-gift options when threshold is crossed
  useEffect(() => {
    if (!giftUnlocked) {
      setCartItems(prev => {
        const withoutGifts = prev.filter(i => !i.isGift);
        return withoutGifts.length !== prev.length ? withoutGifts : prev;
      });
      setGiftProducts([]);
      setSelectedGiftSlug(FREE_GIFT_SLUGS[0]);
      return;
    }

    Promise.all(
      FREE_GIFT_SLUGS.map(slug =>
        fetchWithAuth(`products?slug=${slug}`).then(data => (Array.isArray(data) ? data[0] : data))
      )
    )
      .then(products => {
        const validProducts = products.filter(Boolean);
        setGiftProducts(validProducts);
        if (!validProducts.some(p => p.slug === selectedGiftSlug) && validProducts[0]?.slug) {
          setSelectedGiftSlug(validProducts[0].slug);
        }
      })
      .catch(err => console.warn('Free gift fetch failed:', err));
  }, [giftUnlocked]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep only one selected free gift in cart
  useEffect(() => {
    if (!giftUnlocked || giftProducts.length === 0) return;

    const selectedGift =
      giftProducts.find(p => p.slug === selectedGiftSlug) ||
      giftProducts[0];

    if (!selectedGift) return;

    const giftItem = {
      id: `gift-${selectedGift.id}`,
      productId: selectedGift.id,
      wooId: selectedGift.id,
      name: selectedGift.name,
      price: 0,
      quantity: 1,
      images: selectedGift.images || [],
      isGift: true,
      giftSlug: selectedGift.slug,
      inStock: true,
    };

    setCartItems(prev => {
      const withoutGifts = prev.filter(i => !i.isGift);
      return [...withoutGifts, giftItem];
    });
  }, [giftUnlocked, giftProducts, selectedGiftSlug]);

  useEffect(() => {
    const savedData = localStorage.getItem(CHECKOUT_FORM_STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        // Force COD as default payment method
        parsed.paymentMethod = 'cod';
        parsed.paymentMethodTitle = 'Cash On Delivery';
        parsed.paymentMethodLogo = null;
        setFormData(parsed);
        return;
      } catch {}
    }

    const addressBook = readAddressBook(
      getUserScopedAddressKey(user?.id || localStorage.getItem('userId'))
    );
    const savedAddress = getPreferredAddress(addressBook);

    if (savedAddress) {
      setFormData((prev) => ({
        ...prev,
        ...mapAccountAddressToCheckoutForm(savedAddress, user?.email || ''),
        paymentMethod: 'cod',
        paymentMethodTitle: 'Cash On Delivery',
        paymentMethodLogo: null,
      }));
    }
  }, [user?.email, user?.id]);


  const showAlert = (message, type = 'info') => {
    setAlert({ message, type });
    setTimeout(() => setAlert({ message: '', type: 'info' }), 4000);
  };

  // Auto-fill formData email when user logs in
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        shipping: { ...prev.shipping, email: user.email || prev.shipping.email },
        billing: { ...prev.billing, email: user.email || prev.billing.email },
      }));
    }
  }, [user]);

  // Auto-fetch saved addresses if user is logged in
useEffect(() => {
  if (!user?.id) return;

  const loadAddresses = async () => {
    // 1. Try to load from localStorage first
    const savedData = localStorage.getItem(CHECKOUT_FORM_STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        // Force COD as default payment method
        parsed.paymentMethod = 'cod';
        parsed.paymentMethodTitle = 'Cash On Delivery';
        parsed.paymentMethodLogo = null;
        setFormData(parsed);
        return; // Stop here, don't fetch from WooCommerce
      } catch (err) {
        console.warn('Failed to parse saved checkout data:', err);
      }
    }

    const addressBook = readAddressBook(getUserScopedAddressKey(user.id));
    const savedAddress = getPreferredAddress(addressBook);

    if (savedAddress) {
      const mappedData = mapAccountAddressToCheckoutForm(savedAddress, user.email || '');
      // Force COD as default payment method
      mappedData.paymentMethod = 'cod';
      mappedData.paymentMethodTitle = 'Cash On Delivery';
      mappedData.paymentMethodLogo = null;
      setFormData(mappedData);
      localStorage.setItem(CHECKOUT_FORM_STORAGE_KEY, JSON.stringify(mappedData));
      return;
    }

    // 2. Fetch from WooCommerce if no localStorage data
    try {
      const customer = await fetchWithAuth(`customers/${user.id}`);
      if (customer) {
        // Parse phone number from WooCommerce format (+971501234567)
        const parsePhone = (phoneStr) => {
          if (!phoneStr) return { prefix: '50', number: '' };
          // Remove + and country code (971)
          const cleaned = phoneStr.replace(/^\+?971/, '');
          // First 2 digits are prefix, rest is number
          const prefix = cleaned.slice(0, 2) || '50';
          const number = cleaned.slice(2, 9) || ''; // Max 7 digits
          return { prefix, number };
        };

        const billingPhone = parsePhone(customer.billing.phone);
        const shippingPhone = customer.shipping.phone ? parsePhone(customer.shipping.phone) : billingPhone;

        const fetchedData = {
          billing: {
            first_name: customer.billing.first_name || '',
            last_name: customer.billing.last_name || '',
            email: customer.billing.email || '',
            street: customer.billing.address_1 || '',
            apartment: customer.billing.address_2 || '',
            floor: '',
            city: customer.billing.city || '',
            state: customer.billing.state || '',
            postal_code: customer.billing.postcode || '',
            country: customer.billing.country || 'AE',
            phone_prefix: billingPhone.prefix,
            phone_number: billingPhone.number,
          },
          shipping: {
            first_name: customer.shipping.first_name || '',
            last_name: customer.shipping.last_name || '',
            email: customer.email || '',
            street: customer.shipping.address_1 || '',
            apartment: customer.shipping.address_2 || '',
            floor: '',
            city: customer.shipping.city || '',
            state: customer.shipping.state || '',
            postal_code: customer.shipping.postcode || '',
            country: customer.shipping.country || 'AE',
            phone_prefix: shippingPhone.prefix,
            phone_number: shippingPhone.number,
          },
          billingSameAsShipping: true,
          paymentMethod: 'cod',
          paymentMethodTitle: 'Cash On Delivery',
          paymentMethodLogo: null,
          shippingMethodId: null,
        };

        setFormData(fetchedData);
        localStorage.setItem(CHECKOUT_FORM_STORAGE_KEY, JSON.stringify(fetchedData));
      }
    } catch (err) {
      console.warn('Could not load saved addresses:', err.message);
      // Silently fail - use default form data
    }
  };

  loadAddresses();
}, [user]);


  // Fetch cart product details
  useEffect(() => {
    if (!contextCartItems.length) return setCartItems([]);
    const fetchProducts = async () => {
      try {
       const details = await Promise.all(
  contextCartItems.map(async (item) => {
    const productLookupId = item.wooId || item.productId || item.id;
    const prod = await fetchWithAuth(`products/${productLookupId}`);
    console.log('🛒 Product fetched for cart:', prod.id, 'COD Available:', prod.cod_available);
    // Use the cart item's price if available (from bundle selection), otherwise use WooCommerce price
    const finalPrice = item.price ? parseFloat(item.price) : parseFloat(prod.price) || 0;
    return {
      ...item,
      id: item.id || item.productId || item.wooId || prod.id,
      productId: item.productId || item.wooId || item.id || prod.id,
      wooId: item.wooId || null,
      price: finalPrice,
      inStock: prod.stock_quantity > 0,
      name: prod.name,
      cod_available: prod.cod_available, // Include COD availability from fresh product data
    };
  })
);
        console.log('🛒 Cart items with COD status:', details.map(d => ({ id: d.id, name: d.name, cod_available: d.cod_available })));
        setCartItems(details);
      } catch {
        setCartItems(contextCartItems.map(i => ({ ...i, price: i.price || 0, inStock: true })));
      }
    };
    fetchProducts();
  }, [contextCartItems]);

  // Fetch countries and payment methods
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [countriesData, paymentsData] = await Promise.all([
          fetchWithAuth('data/countries'),
          fetchWithAuth('payment_gateways'),
        ]);
        setCountries(countriesData);
        setPaymentMethods(paymentsData);
      } catch (err) {
        console.warn('Failed to load checkout data:', err.message);
        // Set default values instead of showing error to user
        setCountries([]);
        setPaymentMethods([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Handle payment redirects
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const success = params.get('payment_success');
    const failed = params.get('payment_failed');
    const orderIdFromUrl = params.get('order_id');

    if (success && orderIdFromUrl) {
      fetchWithAuth(`orders/${orderIdFromUrl}`, { method: 'PUT', body: JSON.stringify({ set_paid: true }) })
        .then(() => {
          clearCart();
          navigate(`/order-success?order_id=${orderIdFromUrl}`);
        });
    }

    if (failed && orderIdFromUrl) {
      fetchWithAuth(`orders/${orderIdFromUrl}`, { method: 'PUT', body: JSON.stringify({ status: 'cancelled' }) })
        .then(() => showAlert('Payment failed. Order was cancelled.', 'error'));
    }
  }, []);

  const handlePaymentSelect = (id, title, logo) => {
    setFormData(prev => ({ 
      ...prev, 
      paymentMethod: id, 
      paymentMethodTitle: title,
      paymentMethodLogo: logo 
    }));
  };

  const createOrder = async () => {
    const shipping = formData.shipping;
    const billing = formData.billingSameAsShipping ? shipping : formData.billing;

    // Compose full phone number for backend
    const getFullPhone = (data) => {
      // Always use +971 as country code, then prefix, then number

      const number = data.phone_number || '';
      return `+971${number}`;
    };
    const line_items = cartItems
      .map((item) => {
        const quantity = Number.parseInt(item.quantity, 10) || 1;
        const productId =
          Number.parseInt(item.wooId || item.productId || item.id, 10) || 0;

        if (!productId) return null;

        if (item.isGift) {
          return {
            product_id: productId,
            quantity: 1,
            subtotal: '0.00',
            total: '0.00',
            meta_data: [{ key: '_store1920_free_gift', value: 'true' }],
          };
        }

        if (isStaticCartItem(item)) {
          const unitPrice = Number.parseFloat(item.price) || 0;
          const lineTotal = (unitPrice * quantity).toFixed(2);
          const displayName = getCartItemDisplayName(item);
          const bundleType = String(item.bundleType || '').trim();

          return {
            product_id: productId,
            quantity,
            subtotal: lineTotal,
            total: lineTotal,
            meta_data: [
              displayName
                ? { key: '_store1920_display_name', value: displayName }
                : null,
              bundleType
                ? { key: '_store1920_bundle_type', value: bundleType }
                : null,
            ].filter(Boolean),
          };
        }

        return { product_id: productId, quantity };
      })
      .filter(Boolean);
    const userId = user?.id;

    // City code mapping
    const cityCodeMap = {
      abudhabi: 'auh',
      dubai: 'dxb',
      sharjah: 'shj',
      ajman: 'ajm',
      fujairah: 'fjr',
      ummalquwain: 'uaq',
      rasalkhaimah: 'rak',
      // add more as needed
    };

    const getCityCode = (cityName) => {
      if (!cityName) return '';
      const key = cityName.replace(/\s+/g, '').toLowerCase();
      return cityCodeMap[key] || cityName;
    };


    // Add discount and coinDiscount as negative fee lines if present
    const fee_lines = [];
    if (discount > 0) {
      fee_lines.push({
        name: 'Coupon Discount',
        total: (-discount).toFixed(2),
      });
    }
    if (coinDiscount > 0) {
      fee_lines.push({
        name: 'Coin Discount',
        total: (-coinDiscount).toFixed(2),
      });
    }
    if (deliveryFee > 0) {
      fee_lines.push({
        name: 'Delivery Charge',
        total: deliveryFee.toFixed(2),
      });
    }

    const payload = {
      payment_method: formData.paymentMethod,
      payment_method_title: formData.paymentMethodTitle,
      set_paid: false,
      billing: {
        first_name: billing.first_name,
        last_name: billing.last_name,
        address_1: billing.street,
        address_2: sanitizeField(billing.apartment),
        city: getCityCode(billing.city),
        state: billing.state,
        postcode: billing.postal_code,
        country: billing.country,
        phone: getFullPhone(billing),
        email: billing.email,
        floor: sanitizeField(billing.floor),
      },
      shipping: {
        first_name: shipping.first_name,
        last_name: shipping.last_name,
        address_1: shipping.street,
        address_2: sanitizeField(shipping.apartment),
        city: getCityCode(shipping.city),
        state: shipping.state,
        postcode: shipping.postal_code,
        country: shipping.country,
        phone: getFullPhone(shipping),
        email: shipping.email,
        floor: sanitizeField(shipping.floor),
      },
      line_items,
      shipping_lines: formData.shippingMethodId ? [{ method_id: formData.shippingMethodId }] : [],
      fee_lines,
      meta_data: [
        { key: '_from_react_checkout', value: true },
        { 
          key: '_react_order_products', 
          value: JSON.stringify(cartItems.map(i => ({
            name: getCartItemDisplayName(i),
            price: i.price,
            quantity: i.quantity,
            bundleType: i.bundleType || '',
          })))
        },
        {
          key: '_react_customer_name',
          value: `${billing.first_name} ${billing.last_name}`
        },
        // Delivery type and time
        shipping.delivery_type ? {
          key: '_delivery_type',
          value: shipping.delivery_type
        } : null,
        shipping.delivery_type ? {
          key: '_delivery_time',
          value: (() => {
            switch (shipping.delivery_type) {
              case 'Office': return '9am-5pm';
              case 'Home': return '5pm-9pm';
              case 'Apartment': return '12pm-8pm';
              default: return '';
            }
          })()
        } : null,
      ].filter(Boolean),
      ...(userId ? { customer_id: parseInt(userId, 10) } : { create_account: true }),
    };

      console.log('💡 WooCommerce Order Payload:', payload);


    const order = await fetchWithAuth('orders', { method: 'POST', body: JSON.stringify(payload) });
    if (!userId && order.customer_id) localStorage.setItem('userId', order.customer_id);
    setOrderId(order.id);
    return order;
  };

  const handlePlaceOrder = async () => {
    setError('');
    try {
      const order = orderId ? await fetchWithAuth(`orders/${orderId}`) : await createOrder();
      setOrderId(order.id);

      if (formData.paymentMethod === 'cod') {
        clearCart();
        navigate(`/order-success?order_id=${order.id}`);
      } else if (formData.paymentMethod === 'paymob_accept') {
        if (order.payment_url) window.location.href = order.payment_url;
        else throw new Error('Paymob payment URL not found. Check plugin setup.');
      } else {
        throw new Error('Unsupported payment method selected.');
      }
    } catch (err) {
      setError(err.message || 'Failed to place order.');
    }
  };

<div className="checkoutPageWrapper" style={{ minHeight: '40vh' }}>
  {loading && (
    <div className="checkoutLoader">
      <div className="loaderSpinner"></div>
      <div>Loading Checkout...</div>
    </div>
  )}

  <div className="checkoutGrid" style={{ minHeight: '100vh', overflowY: 'auto', opacity: loading ? 0.3 : 1 }}>
    <CheckoutLeft
      countries={countries}
      cartItems={cartItems}
      subtotal={subtotal}
      deliveryFee={deliveryFee}
      orderId={orderId}
      formData={formData}
      setFormData={setFormData}
      createOrder={createOrder}
      showForm={showForm}
      setShowForm={setShowForm}
    />
    <CheckoutRight
      cartItems={cartItems}
      formData={formData}
      orderId={orderId}
      createOrder={createOrder}
      clearCart={() => setCartItems([])}
      handlePlaceOrder={handlePlaceOrder}
      subtotal={subtotal}
      showForm={showForm}
    />
  </div>
</div>

  // return (
  //   <>
  //     <div className="checkoutGrid" style={{ minHeight: '100vh', overflowY: 'auto' }}>
  //       <CheckoutLeft
  //         countries={countries}
  //         cartItems={cartItems}
  //         subtotal={subtotal}
  //         orderId={orderId}
  //         formData={formData}
  //         setFormData={setFormData}
  //         handlePlaceOrder={handlePlaceOrder}
  //         createOrder={createOrder}
  //       />
  //       <CheckoutRight
  //         cartItems={cartItems}
  //         formData={formData}
  //         orderId={orderId}
  //         createOrder={createOrder}
  //         clearCart={() => setCartItems([])}
  //         handlePlaceOrder={handlePlaceOrder}
  //         subtotal={subtotal}
  //       />
  //     </div>

  //     {alert.message && <div className={`checkout-alert ${alert.type}`}>{alert.message}</div>}

  //     {showSignInModal && (
  //       <SignInModal
  //         onClose={() => setShowSignInModal(false)}
  //         onLoginSuccess={() => setShowSignInModal(false)}
  //       />
  //     )}

  //     {error && <div className="error-message">{error}</div>}
  //   </>
  // );

return (
  <>
    {/* Auto-fetch customer location on checkout page load */}
    <AutoFetchLocation />

    {hasDynamicProducts && <div className="checkoutShippingProgressWrap">
      <div className="checkoutShippingProgressHead">
        <div className="checkoutShippingProgressTitleGroup">
          <span className="checkoutShippingProgressTitle">Free Gift Progress</span>
          <span className={`checkoutShippingProgressBadge ${giftUnlocked ? 'unlocked' : ''}`}>
            {giftUnlocked ? 'Unlocked' : 'In Progress'}
          </span>
        </div>
        <span className="checkoutShippingProgressValue">AED {Math.min(discountedDynamicSubtotal, FREE_GIFT_THRESHOLD).toFixed(2)} / AED {FREE_GIFT_THRESHOLD.toFixed(2)}</span>
      </div>
      <div className="checkoutShippingTrack" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(animatedProgress)}>
        <div className={`checkoutShippingFill ${giftUnlocked ? 'unlocked' : ''}`} style={{ width: `${animatedProgress}%` }} />
      </div>
      <div className="checkoutShippingMilestones">
        <span>AED 0</span>
        <span>AED {FREE_GIFT_THRESHOLD.toFixed(0)}</span>
      </div>
      <p className="checkoutShippingGiftHint">
        {giftUnlocked
          ? '🎁 Free gift unlocked! Pick 1 free gift below.'
          : `🎁 Spend AED ${amountRemainingForGift.toFixed(2)} more (on regular products) to unlock 1 free gift!`}
      </p>
      {giftUnlocked && showGiftGuide && (
        <div className="checkoutGiftGuidePopup" role="status" aria-live="polite">
          <span>Choose 1 free gift below</span>
          <button
            type="button"
            className="checkoutGiftGuideClose"
            aria-label="Dismiss gift guide"
            onClick={() => setShowGiftGuide(false)}
          >
            ×
          </button>
        </div>
      )}
      {giftUnlocked && giftProducts.length > 0 && (
        <div className="checkoutGiftPreviewRow">
          {giftProducts.map(p => (
            <button
              key={p.id}
              type="button"
              className={`checkoutGiftPreviewCard ${selectedGiftSlug === p.slug ? 'selected' : ''}`}
              onClick={() => {
                setSelectedGiftSlug(p.slug);
                setShowGiftGuide(false);
              }}
            >
              {p.images?.[0]?.src && (
                <img src={p.images[0].src} alt={p.name} className="checkoutGiftPreviewImg" />
              )}
              <div className="checkoutGiftPreviewInfo">
                <span className="checkoutGiftPreviewName">{p.name}</span>
                <span className="checkoutGiftPreviewPrice">
                  {selectedGiftSlug === p.slug ? 'Selected' : 'FREE'}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>}

    <div className="checkoutGrid" style={{ minHeight: '100vh', overflowY: 'auto' }}>
      <CheckoutLeft
        countries={countries}
        cartItems={cartItems}
        subtotal={subtotal}
        deliveryFee={deliveryFee}
        orderId={orderId}
        formData={formData}
        setFormData={setFormData}
        handlePlaceOrder={handlePlaceOrder}
        createOrder={createOrder}
      />
      <CheckoutRight
        cartItems={cartItems}
        formData={formData}
        orderId={orderId}
        createOrder={createOrder}
        clearCart={() => setCartItems([])}
        handlePlaceOrder={handlePlaceOrder}
        subtotal={subtotal}
        discount={discount}
        setDiscount={setDiscount}
        coinDiscount={coinDiscount}
        setCoinDiscount={setCoinDiscount}
      />
    </div>

    {alert.message && <div className={`checkout-alert ${alert.type}`}>{alert.message}</div>}

    {error && <div className="error-message">{error}</div>}
  </>
);




}

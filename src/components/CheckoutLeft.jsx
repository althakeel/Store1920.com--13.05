// src/components/checkout/CheckoutLeft.jsx
import React, { useState, useEffect } from 'react';
import '../assets/styles/checkoutleft.css';
import SignInModal from './sub/SignInModal';
import HelpText from './HelpText';
import PaymentMethods from '../components/checkoutleft/PaymentMethods';
import AddressForm from '../components/checkoutleft/AddressForm';
import ItemList from './checkoutleft/ItemList';
import ShippingMethods from '../components/checkout/ShippingMethods';
import emptyAddressImg from '../assets/images/adress-not-found.png';
import ProductsUnder20AED from './ProductsUnder20AED';
import { useCart } from '../contexts/CartContext';
import CouponDiscount from '../components/sub/account/CouponDiscount';
import {
  CHECKOUT_FORM_STORAGE_KEY,
  getUserScopedAddressKey,
  mapAccountAddressToCheckoutForm,
  mapCheckoutFormToAccountAddress,
  readAddressBook,
  writeAddressBook,
} from '../utils/checkoutAddress';


const API_BASE = 'https://db.store1920.com/wp-json/custom/v1';

export default function CheckoutLeft({
  countries,
  cartItems,
  subtotal,
  deliveryFee = 0,
  orderId,
  formData,
  setFormData,
  createOrder,
  showForm: showFormProp,
  setShowForm: setShowFormProp,
  discount = 0,
  setDiscount = null,
}) {
  const [showFormState, setShowFormState] = useState(false);
  const isControlled = typeof showFormProp === 'boolean';
  const showForm = isControlled ? showFormProp : showFormState;
  const setShowForm = isControlled && typeof setShowFormProp === 'function' ? setShowFormProp : setShowFormState;
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [shippingStates, setShippingStates] = useState([]);
  const [billingStates, setBillingStates] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [selectedShippingMethodId, setSelectedShippingMethodId] = useState(null);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [preferredAddressId, setPreferredAddressId] = useState(null);

  const { removeFromCart } = useCart();

  // -------------------------------
  // Handle field changes
  // -------------------------------
  const handleFieldChange = (e, section) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => {
      if (section === 'shipping' || section === 'billing') {
        return { ...prev, [section]: { ...prev[section], [name]: value } };
      } else if (type === 'checkbox') {
        return { ...prev, [name]: checked };
      }
      return { ...prev, [name]: value };
    });
  };

  // -------------------------------
  // Remove cart item
  // -------------------------------
  const handleRemoveItem = (itemId) => {
    removeFromCart(itemId);
  };

  // -------------------------------
  // Delete address
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  // -------------------------------
  const handleDeleteAddress = () => {
    const emptyAddress = {
      first_name: '', last_name: '', email: '', street: '', apartment: '',
      city: '', state: '', postal_code: '', country: '', phone_number: ''
    };
    setSelectedShippingMethodId(null);
    setFormData(prev => ({
      ...prev,
      shipping: emptyAddress,
      billing: prev.billingSameAsShipping ? emptyAddress : prev.billing
    }));
  };

  // -------------------------------
  // Auto-open form if no shipping address
  // -------------------------------
  useEffect(() => {
    const hasAddress = formData?.shipping?.street?.trim() &&
                       formData?.shipping?.first_name?.trim() &&
                       formData?.shipping?.last_name?.trim();
    if (!hasAddress) setShowForm(true);
  }, []);

  // Keep a flag on formData so CheckoutRight can hide sticky bar when address modal is open
  useEffect(() => {
    setFormData(prev => ({ ...prev, addressModalOpen: !!showForm }));
  }, [showForm, setFormData]);

  // -------------------------------
  // Shipping method handling
  // -------------------------------
  useEffect(() => {
    setSelectedShippingMethodId(formData.shippingMethodId || null);
  }, [formData.shippingMethodId]);

  useEffect(() => {
    const storageKey = getUserScopedAddressKey(localStorage.getItem('userId'));
    const addressBook = readAddressBook(storageKey);
    setSavedAddresses(addressBook.addresses);
    setPreferredAddressId(addressBook.preferredAddressId);
  }, [formData.shipping?.street, formData.shipping?.first_name, formData.shipping?.last_name]);

  const handleShippingMethodChange = (id) => {
    setFormData(prev => ({ ...prev, shippingMethodId: id }));
  };

  const applySavedAddressToCheckout = (address) => {
    if (!address) return;

    const mappedAddress = mapAccountAddressToCheckoutForm(
      address,
      formData.shipping?.email || formData.billing?.email || ''
    );

    const nextFormData = {
      ...formData,
      ...mappedAddress,
      shippingMethodId: formData.shippingMethodId,
      paymentMethod: formData.paymentMethod,
      paymentMethodTitle: formData.paymentMethodTitle,
      paymentMethodLogo: formData.paymentMethodLogo,
      addressModalOpen: formData.addressModalOpen,
    };

    setFormData(nextFormData);
    localStorage.setItem(CHECKOUT_FORM_STORAGE_KEY, JSON.stringify(nextFormData));
  };

  // -------------------------------
  // Toggle address form
  // -------------------------------
  const handleAddAddressClick = () => {
    setShowForm(prev => !prev);
    setSaveSuccess(false);
    setError(null);
  };

  // -------------------------------
  // Select payment
  // -------------------------------
  const handlePaymentSelect = (id, title, logo = null, extra = {}) => {
    setFormData(prev => ({
      ...prev,
      paymentMethod: id,
      paymentMethodTitle: title,
      paymentMethodLogo: logo || null,
      selectedSavedCardId:
        extra.selectedSavedCardId !== undefined
          ? extra.selectedSavedCardId
          : prev.selectedSavedCardId || null,
      selectedSavedCardHint:
        extra.selectedSavedCardHint !== undefined
          ? extra.selectedSavedCardHint
          : prev.selectedSavedCardHint || null,
    }));
  };

  // -------------------------------
  // Submit address to backend
  // -------------------------------
  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setSaving(true);
    setError(null);
    setSaveSuccess(false);

    const formatAddress = (addr) => ({
      first_name: addr.first_name || '',
      last_name: addr.last_name || '',
      email: addr.email || '',
      address_1: addr.street || '',
      address_2: addr.apartment || '',
      city: addr.city || '',
      state: addr.state || '',
      postcode: addr.postal_code || '',
      country: addr.country || '',
      phone: addr.phone_number || ''
    });

    const payload = {
      shipping: formatAddress(formData.shipping),
      billing: formData.billingSameAsShipping ? formatAddress(formData.shipping) : formatAddress(formData.billing),
      billingSameAsShipping: formData.billingSameAsShipping,
      shippingMethodId: formData.shippingMethodId || null,
      save_as_default: formData.saveAsDefault || false,
    };

    try {
      const res = await fetch(`${API_BASE}/save-address`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Failed to save address');
      await res.json();
      localStorage.setItem(CHECKOUT_FORM_STORAGE_KEY, JSON.stringify(formData));
      const storageKey = getUserScopedAddressKey(localStorage.getItem('userId'));
      const currentAddress = mapCheckoutFormToAccountAddress(formData);
      const currentBook = readAddressBook(storageKey);
      const nextAddressId = currentAddress.id || currentBook.preferredAddressId;
      const savedAddress = {
        ...currentAddress,
        id: nextAddressId,
      };
      const nextAddresses = nextAddressId
        ? currentBook.addresses.map((address) => (address.id === nextAddressId ? savedAddress : address))
        : [...currentBook.addresses, savedAddress];
      const resolvedAddresses =
        nextAddressId && currentBook.addresses.some((address) => address.id === nextAddressId)
          ? nextAddresses
          : [...currentBook.addresses, savedAddress];
      const nextPreferredId = formData.saveAsDefault ? savedAddress.id : currentBook.preferredAddressId || savedAddress.id;
      const nextBook = writeAddressBook(
        storageKey,
        resolvedAddresses,
        nextPreferredId
      );
      setSavedAddresses(nextBook.addresses);
      setPreferredAddressId(nextBook.preferredAddressId);
      setSaveSuccess(true);
      setShowForm(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      setError('Failed to save address. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="checkout-left">
      {/* Show Order Summary above address only on mobile */}
      {isMobile && !showForm && !formData?.showOrderConfirmed && (
        <div className="orderSummaryResponsive">
          <h2>Order Summary</h2>
          <CouponDiscount onApplyCoupon={() => {}} />
        </div>
      )}
      {/* Shipping Address Section */}
      <div className="shipping-container">
        <div className="section-block">
          <div className="section-header">
            <h2 className="shippingadress" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Shipping Address</span>
              <button onClick={handleAddAddressClick} className={`btn-add-address1 ${showForm ? 'cancel-btn1' : ''}`}>
                {showForm ? 'Cancel' : formData?.shipping?.street ? 'Change Address' : 'Add New Address'}
              </button>
            </h2>

            {formData?.shipping?.street ? (
              <div className="saved-address-box" style={{
                background: '#fff',
                borderRadius: '16px',
                boxShadow: '0 2px 12px #0001',
                padding: '14px 20px',
                marginTop: '10px',
                minWidth: '220px',
                maxWidth: '440px',
                display: 'flex',
                alignItems: 'center',
                border: '2.5px dashed #ff9800',
              }}>
                <div className="saved-address-grid" style={{ display: 'grid', gridTemplateColumns: '90px 10px 1fr', rowGap: '8px', columnGap: '0px', width: '100%' }}>
                  <div className="saved-address-label" style={{ fontWeight: 600, color: '#444' }}>Name</div>
                  <div className="saved-address-colon">:</div>
                  <div className="saved-address-value" style={{ color: '#222' }}>{formData.shipping.first_name} {formData.shipping.last_name}</div>

                  <div className="saved-address-label" style={{ fontWeight: 600, color: '#444' }}>Address</div>
                  <div className="saved-address-colon">:</div>
                  <div className="saved-address-value" style={{ color: '#222' }}>
                    {formData.shipping.street}{formData.shipping.apartment ? `, ${formData.shipping.apartment}` : ''}
                  </div>

                  <div className="saved-address-label" style={{ fontWeight: 600, color: '#444' }}>City</div>
                  <div className="saved-address-colon">:</div>
                  <div className="saved-address-value" style={{ color: '#222' }}>{formData.shipping.city}</div>

                  <div className="saved-address-label" style={{ fontWeight: 600, color: '#444' }}>Phone</div>
                  <div className="saved-address-colon">:</div>
                  <div className="saved-address-value" style={{ color: '#222' }}>+971{formData.shipping.phone_number}</div>

                  <div className="saved-address-label" style={{ fontWeight: 600, color: '#444' }}>State</div>
                  <div className="saved-address-colon">:</div>
                  <div className="saved-address-value" style={{ color: '#222' }}>{formData.shipping.state}</div>

                  <div className="saved-address-label" style={{ fontWeight: 600, color: '#444' }}>Country</div>
                  <div className="saved-address-colon">:</div>
                  <div className="saved-address-value" style={{ color: '#222' }}>United Arab Emirates</div>
                </div>
              </div>
            ) : !showForm && (
              <div style={{ textAlign: 'center', padding: '10px' }}>
                <img src={emptyAddressImg} alt="No address found" style={{ maxWidth: '50px', opacity: 0.6 }} />
                <p style={{ color: '#777', marginTop: '10px' }}>No address added yet.</p>
              </div>
            )}
          </div>

          {!!savedAddresses.length && !showForm && (
            <div style={{ marginTop: '16px', display: 'grid', gap: '12px' }}>
              {savedAddresses.map((address) => {
                const isActive = address.id === formData.selectedAddressId;
                const isPreferred = address.id === preferredAddressId;

                return (
                  <div
                    key={address.id}
                    style={{
                      border: `1px solid ${isActive ? '#ff9800' : '#e5e7eb'}`,
                      borderRadius: '12px',
                      padding: '12px 14px',
                      background: isActive ? '#fffaf3' : '#fff',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontWeight: 700, color: '#222' }}>
                          {address.first_name} {address.last_name}
                        </div>
                        <div style={{ fontSize: '0.92rem', color: '#555', marginTop: '4px' }}>
                          {address.address_1}{address.address_2 ? `, ${address.address_2}` : ''}, {address.city}
                        </div>
                        <div style={{ fontSize: '0.92rem', color: '#555', marginTop: '4px' }}>
                          +971{String(address.phone || '').replace(/^\+?971/, '')}
                        </div>
                        {isPreferred && (
                          <div style={{ fontSize: '0.85rem', color: '#ff6f00', marginTop: '6px', fontWeight: 600 }}>
                            Preferred address
                          </div>
                        )}
                      </div>
                      {!isActive && (
                        <button
                          type="button"
                          onClick={() => applySavedAddressToCheckout(address)}
                          className="btn-add-address1"
                        >
                          Use This Address
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Shipping Methods */}
      <ShippingMethods
        selectedMethodId={selectedShippingMethodId}
        onSelect={(id) => { setSelectedShippingMethodId(id); handleShippingMethodChange(id); }}
        subtotal={subtotal}
        deliveryFee={deliveryFee}
      />

      {/* Cart Items */}
      <div className="section-block">
        <ItemList items={cartItems || []} onRemove={handleRemoveItem} />
      </div>

      {/* Payment Methods */}
      <PaymentMethods
        selectedMethod={formData.paymentMethod || 'cod'}
        selectedSavedCardId={formData.selectedSavedCardId || null}
        onMethodSelect={handlePaymentSelect}
        subtotal={subtotal}
        cartItems={cartItems || []}
        orderId={orderId}
        onDiscountChange={setDiscount}
      />

      {/* Sidebar Help */}
      <div className="desktop-only">
        <HelpText />
        <ProductsUnder20AED />
      </div>

      {/* Sign In Modal */}
      <SignInModal
        isOpen={showSignInModal}
        onClose={() => setShowSignInModal(false)}
        onLogin={() => { setShowSignInModal(false); setShowForm(true); setSaveSuccess(false); setError(null); }}
      />

      {/* Address Form */}
      {showForm && (
        <AddressForm
          formData={formData}
          shippingStates={shippingStates}
          billingStates={billingStates}
          countries={countries}
          onChange={handleFieldChange}
          onSubmit={handleSubmit}
          onClose={() => setShowForm(false)}
          saving={saving}
          error={error}
           cartItems={cartItems} 
        />
      )}
      {saveSuccess && <div className="addrf-toast">✅ Address saved successfully!</div>}
    </div>
  );
}

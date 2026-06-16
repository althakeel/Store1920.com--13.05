import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

const LOCAL_STORAGE_KEY = 'checkoutAddressData';

// const normalizePhone = (value) => {
//   if (!value) return "";

//   let digits = value.replace(/\D/g, "");

//   if (digits.startsWith("971")) digits = digits.slice(3);
//   if (digits.startsWith("0")) digits = digits.slice(1);

//   if (digits.length > 9) digits = digits.slice(0, 9);

//   return digits;
// };
// Keep digits only (DON'T cut to 9 here, warna 971 type karte hi truncate hoga)
const normalizePhone = (value) => {
  if (!value) return "";
  return value.replace(/\D/g, "");
};

// For saving: convert to local UAE format (9 digits) without 971 / 0
const normalizePhoneForSave = (value) => {
  let digits = (value || "").toString().replace(/\D/g, "");

  if (digits.startsWith("971")) digits = digits.slice(3);
  if (digits.startsWith("0")) digits = digits.slice(1);

  return digits.slice(0, 9);
};



const UAE_EMIRATES = [
  { code: 'AUH', name: 'Abu Dhabi' },
  { code: 'AAN', name: 'Al Ain' },
  { code: 'DXB', name: 'Dubai' },
  { code: 'SHJ', name: 'Sharjah' },
  { code: 'AJM', name: 'Ajman' },
  { code: 'UAQ', name: 'Umm Al Quwain' },
  { code: 'RAK', name: 'Ras Al Khaimah' },
  { code: 'FUJ', name: 'Fujairah' },
];

const UAE_CITIES = {
  ABU: ['Abu Dhabi', 'Al Ain', 'Madinat Zayed', 'Sweihan', 'Liwa Oasis', 'Ruways', 'Ghayathi', 'Jebel Dhanna', 'Al Yahar', 'Al Khazna', 'Al Mahdar', 'Al Falah', 'Al Shuwaib', 'Al Rafaah', 'Al Salamah', 'Al Hayer', 'Al Khari', 'Al Ghashban', 'Al Ghabah', 'Al Fara\'', 'Al Fulayyah', 'Al Awdah', 'Al Ghabam', 'Al Hamraniyah', 'Al Hamriyah', 'Al Haybah', 'Al Hayl', 'Al Hayr', 'Al Hayrah', 'Al Hulaylah', 'Al Jaddah', 'Al Khashfah', 'Al Mahamm', 'Al Masafirah', 'Al Mataf', 'Al Mu\'amurah', 'Al Naslah', 'Al Qir', 'Al Quwayz', 'Al Usayli', 'Khalifa City', 'Shakhbout City', 'Corniche', 'Mussafah', 'Reem Island', 'Yas Island', 'Saadiyat Island'],
  DXB: ['Dubai', 'Deira', 'Bur Dubai', 'Jebel Ali', 'Al Barsha', 'Al Quoz', 'Al Safa', 'Dubai Marina', 'Jumeirah', 'Satwa', 'Al Karama', 'Al Nahda', 'Al Qusais', 'Al Rashidiya', 'Al Jaddaf', 'Al Khawaneej', 'Al Warqa', 'Al Muhaisnah', 'Al Mizhar', 'Al Garhoud', 'Al Satwa', 'Business Bay', 'Mirdif', 'Jumeirah Beach Residences', 'International City', 'Discovery Gardens', 'Dubai Silicon Oasis', 'Dubai Investment Park', 'Dubai Festival City', 'Downtown Dubai', 'Palm Jumeirah', 'Jumeirah Lakes Towers (JLT)', 'DIFC', 'Emirates Towers', 'Trade Centre 2', 'Sheikh Zayed Road', 'Al Sufouh', 'Dubai Sports City', 'Dubai Hills Estate', 'Al Barsha South', 'Dubai Industrial City'],
  SHJ: ['Sharjah', 'Al Dhaid', 'Khor Fakkan', 'Kalba', 'Mleiha', 'Al Hamriyah', 'Al Madam', 'Al Bataeh', 'Al Khan', 'Al Layyah', 'Al Yarmook', 'Industrial Area', 'Sharjah City Center', 'University City', 'Al Nahda'],
  AJM: ['Ajman', 'Masfout', 'Manama', 'Al Jurf', 'Al Rashidiya', 'Al Nuaimia', 'Al Rawda', 'Al Rumailah', 'Al Mowaihat', 'Al Tallah', 'Al Sheikh Maktoum', 'Al Hamidiyah'],
  UAQ: ['Umm Al Quwain', 'Falaj Al Mualla', 'Al Sinniyah', 'Al Rumailah', 'Al Kharran', 'Al Jurf', 'Al Rahbah', 'Al Raas', 'Al Tallah', 'Al Bu Falah', 'Al Qawasim'],
  RAK: ['Ras Al Khaimah', 'Dibba Al-Hisn', 'Khatt', 'Al Jazirah Al Hamra', 'Al Rams', 'Dhayah', 'Ghalilah', 'Al Nakheel', 'Al Hamra Village', 'Al Nakheel Industrial', 'Al Qusaidat', 'Al Maarid', 'Al Hudaibah'],
  FSH: ['Fujairah', 'Dibba Al-Fujairah', 'Khor Fakkan', 'Masafi', 'Bidiyah', 'Dibba Al-Hisn', 'Al Aqah', 'Al Bithnah', 'Al Faseel', 'Al Hala', 'Al Madhah', 'Al Sharqiyah', 'Al Sakamkam', 'Al Twar', 'Al Jurf']
};



const AddressForm = ({ formData, onChange, onSubmit, onClose, saving, error, cartItems }) => {
  const [formErrors, setFormErrors] = useState({});
  const [markerPosition, setMarkerPosition] = useState(null);
  const [mapSelected, setMapSelected] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(() => (typeof window !== 'undefined' ? window.innerWidth : 1024));

  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isDesktop = viewportWidth >= 1000;


  // --- City/Area Google Places Autocomplete ---
  const [cityInput, setCityInput] = useState(formData.shipping.city || '');
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [cityLoading, setCityLoading] = useState(false);

  const syncCityValue = (value) => {
    setCityInput(value);
    onChange({ target: { name: 'city', value } }, 'shipping');
  };

  const allUaeCities = Array.from(
    new Set(
      Object.values(UAE_CITIES)
        .flat()
        .filter(Boolean)
    )
  );

  // Fetch local UAE city/area predictions
  const fetchCitySuggestions = (input) => {
    setCityLoading(true);
    const normalizedInput = input.trim().toLowerCase();
    const matches = allUaeCities
      .filter((city) => city.toLowerCase().includes(normalizedInput))
      .slice(0, 12);
    setCitySuggestions(matches);
    setCityLoading(false);
  };

  useEffect(() => {
    if (cityInput && cityInput.length > 1) {
      fetchCitySuggestions(cityInput);
    } else {
      setCitySuggestions([]);
    }
  }, [cityInput]);

  useEffect(() => {
    setCityInput(formData.shipping.city || '');
  }, [formData.shipping.city]);

  // --------------------------
  // Load saved address
  // --------------------------
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.shipping) {
        Object.keys(data.shipping).forEach((key) => {
        let val = data.shipping[key];

        // CLEAN PHONE ON LOAD
        if (key === "phone_number" || key === "phone") {
          val = normalizePhone(val);
        }

        onChange({ target: { name: key, value: val } }, 'shipping');
      });
        }
        if (data.saveAsDefault !== undefined) {
          onChange({ target: { name: 'saveAsDefault', value: data.saveAsDefault } });
        }
      } catch (err) {
        console.warn('Failed to parse saved checkout address:', err);
      }
    }
  }, []);

  useEffect(() => {
  if (!formData.shipping.delivery_type) {
    onChange({ target: { name: 'delivery_type', value: 'Home' } }, 'shipping');
  }
}, []);


  // --------------------------
  // Validation Logic
  // --------------------------
  const validateField = (name, value) => {
    switch (name) {
      case 'first_name':
      case 'street':
      case 'city':
      case 'state':
        if (!value || value.trim() === '') return 'This field is required';
        break;
     
      case 'phone_number': {
        const digits = (value || "").toString().replace(/\D/g, "");

        // if (!digits) return 'Phone number is required';

        // If user typed 971 or 0 - show clear error (don't auto-remove in input)
        if (digits.startsWith("971")) return 'Do not type 971. Start with 5 (e.g., 501234567)';
        if (digits.startsWith("0")) return 'Do not start with 0. Start with 5 (e.g., 501234567)';

        if (digits[0] !== "5") return 'Number must start with 5 (e.g., 501234567)';
        if (digits.length !== 9) return 'Must be exactly 9 digits (e.g., 501234567)';

        break;
      }
      
      case 'email':
        if (!value || !/\S+@\S+\.\S+/.test(value)) return 'Invalid email';
        break;

      default:
        return '';
    }
    return '';
  };

  const handleFieldChange = (e) => {
    onChange(e, 'shipping');
    const errorMsg = validateField(e.target.name, e.target.value);
    setFormErrors((prev) => ({ ...prev, [e.target.name]: errorMsg }));
  };

  // --------------------------
  // PHONE FIX: reliable update
  // --------------------------
  const handlePhoneChange = (phone) => {
    const normalizedPhone = phone.replace(/\D/g, '');
    onChange({ target: { name: 'phone_number', value: normalizedPhone } }, 'shipping');
    const errorMsg = validateField('phone_number', normalizedPhone);
    setFormErrors((prev) => ({ ...prev, phone_number: errorMsg }));
  };

  // --------------------------
  // Handle Map Selection
  // --------------------------
  const handlePlaceSelected = ({ street, city, state, lat, lng }) => {
    const stateObj = UAE_EMIRATES.find((s) => s.name.toLowerCase() === state?.toLowerCase());
    const stateCode = stateObj ? stateObj.code : '';
    onChange({ target: { name: 'street', value: street } }, 'shipping');
    onChange({ target: { name: 'city', value: city } }, 'shipping');
    onChange({ target: { name: 'state', value: stateCode } }, 'shipping');
    setMarkerPosition({ lat, lng });
    setMapSelected(true);
  };

  // --------------------------
  // --------------------------
  // SAVE ADDRESS (without OTP)
  // --------------------------

  const saveAddress = async (e) => {
    e.preventDefault();
    if (typeof document !== 'undefined' && document.body.dataset.signinModalOpen === 'true') {
      return;
    }
    if (isSubmitting) return; // Prevent double clicks
    setIsSubmitting(true);

    const raw = formData.shipping.phone_number || "";
    const phone = normalizePhoneForSave(raw);

    console.log('🔍 Address Save - Phone Validation:', { raw, phone, length: phone.length });

    if (!/^[5][0-9]{8}$/.test(phone)) {
      alert("Please enter a valid UAE mobile number starting with 5 (e.g., 501234567).");
      setFormErrors((prev) => ({ ...prev, phone_number: "Number must start with 5 and be 9 digits" }));
      setIsSubmitting(false);
      return;
    }

    const fullPhone = `+971${phone}`;

    // Validate required fields
    const errors = {};
    const requiredFields = ['first_name', 'last_name', 'email', 'phone_number', 'street', 'state', 'city'];
    requiredFields.forEach((field) => {
      const errorMsg = validateField(field, formData.shipping[field]);
      if (errorMsg) {
        errors[field] = errorMsg;
        console.log(`❌ Validation Error - ${field}:`, errorMsg);
      }
    });

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      alert('Please fill all required fields correctly.');
      setIsSubmitting(false);
      return;
    }

    try {
      console.log('💾 Saving address to localStorage...');
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(formData));

      // Submit checkout immediately so the modal closes without waiting on the
      // abandoned-cart endpoint, which is non-critical for the user flow.
      console.log('✅ Address validated, submitting checkout form...');
      await onSubmit(formData);

      // Save abandoned checkout in the background.
      fetch('https://db.store1920.com/wp-json/abandoned-checkouts/v1/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shipping: {
            ...formData.shipping,
            phone: fullPhone,
          },
          cart: cartItems.map((item) => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            subtotal: item.price * item.quantity,
          })),
        }),
      })
        .then(async (response) => {
          if (!response.ok) {
            const contentType = response.headers.get('content-type');
            const errorData =
              contentType && contentType.includes('application/json')
                ? await response.json()
                : await response.text();
            console.warn('Abandoned checkout save failed:', errorData);
            return;
          }

          const result = await response.json();
          console.log('✅ Abandoned checkout saved:', result);
        })
        .catch((backgroundError) => {
          console.warn('Abandoned checkout background save failed:', backgroundError);
        });
    } catch (err) {
      console.error('❌ Error saving address:', err);
      alert(`Error: ${err.message || 'Something went wrong while saving your address.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --------------------------
  // RENDER
  // --------------------------
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        padding: '16px',
      }}
    >
      <div
        style={{
          position: 'relative',
          background: '#fff',
          borderRadius: '16px',
          width: '94vw',
          maxWidth: isDesktop ? '960px' : '520px',
          maxHeight: isDesktop ? '88vh' : '92vh',
          overflow: 'hidden',
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 8px 40px #0003',
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '15px',
            right: '20px',
            background: 'none',
            border: 'none',
            fontSize: '22px',
            fontWeight: 600,
            cursor: 'pointer',
            color: '#555',
          }}
        >
          ✕
        </button>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            height: '100%',
            gap: 0,
          }}
        >
          <h2 style={{ margin: '12px 0 4px 0', fontSize: '1.25rem', fontWeight: 700, color: '#333', textAlign: 'center' }}>
            Edit Address
          </h2>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 0,
              width: '100%',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                gap: 0,
                width: '100%',
                minHeight: 0,
                padding: '10px 14px 0 14px',
                boxSizing: 'border-box',
              }}
            >
              {/* Map section (left) */}
              {/* Only show the map if the form is hidden (before address mode selection) */}
              {!mapSelected && (
                <div
                  style={{
                    flex: 1,
                    minWidth: 0,
                    width: '100%',
                    margin: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <div
                    style={{
                      width: '100%',
                      height: '320px',
                      minHeight: 220,
                      maxWidth: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                    }}
                  >
                    <style>{`
                      @media (min-width: 900px) {
                        .address-map-area {
                          height: 100% !important;
                          min-height: 400px !important;
                          max-height: none !important;
                        }
                        .address-modal-map-container {
                          height: 420px !important;
                        }
                      }
                    `}</style>
                    {/* Map is mounted but hidden – required for Google Places */}
             

                  </div>
                </div>
              )}
              {/* Form section (right) - only show if mapSelected */}
              <div
                style={{
                  flex: 1.2,
                  minWidth: 0,
                  background: '#fafbfc',
                  borderRadius: 14,
                  boxShadow: '0 2px 12px #0001',
                  padding: isDesktop ? '22px 20px' : '18px 16px',
                  display: mapSelected ? 'flex' : 'none',
                  flexDirection: 'column',
                  gap: 0,
                  maxHeight: isDesktop ? '78vh' : '72vh',
                  overflowY: 'auto',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 18 }}>
                  <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <div style={{
                      width: '7px',
                      height: '38px',
                      borderRadius: '12px 0 0 12px',
                      background: 'linear-gradient(180deg,#ff9800 60%,#ff5500 100%)',
                      marginRight: '12px',
                      boxShadow: '0 0 4px #ff980044',
                    }}></div>
                    <div style={{ fontWeight: 700, color: '#444', fontSize: '1.1rem', letterSpacing: 0.2, flex: 1 }}>SHIPPING ADDRESS</div>
                  </div>
                  {/* <button
                    type="button"
                    onClick={() => setMapSelected(false)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#1976d2',
                      fontWeight: 600,
                      fontSize: '1rem',
                      cursor: 'pointer',
                      padding: '4px 12px',
                      borderRadius: 6,
                      transition: 'background 0.2s',
                    }}
                    tabIndex={0}
                  >
                    ← Back to Map
                  </button> */}
                </div>
                {mapSelected && (
                    <form onSubmit={saveAddress} noValidate style={{ display: 'flex', flexDirection: 'column', gap: isDesktop ? '18px' : '16px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(${isDesktop ? 260 : 220}px, 1fr))`, gap: isDesktop ? '16px' : '14px' }}>
              {/* Delivery Type Selector at the top of the form */}
        

              <label>
                Full Name*
                <input placeholder='Full Name' type="text" name="first_name" value={formData.shipping.first_name} onChange={handleFieldChange} />
                {formErrors.first_name && <span style={{ color: 'red' }}>{formErrors.first_name}</span>}
              </label>

              {/* <label>
                Last Name*
                <input placeholder='Last Name' type="text" name="last_name" value={formData.shipping.last_name} onChange={handleFieldChange} />
                {formErrors.last_name && <span style={{ color: 'red' }}>{formErrors.last_name}</span>}
              </label> */}

                    <label>
                      Mobile Number*
              <div className="phone-wrapper" style={{ marginTop: 4 }}>

                {/* UAE Flag + Prefix inside input */}
                <span className="phone-prefix">
                  +971
                </span>

                <input
                  type="text"
                  name="phone_number"
                  className="phone-input"
                  value={formData.shipping.phone_number || ""}
                  onChange={(e) => {
                    const nextValue = normalizePhone(e.target.value).slice(0, 9);

                    onChange(
                      { target: { name: "phone_number", value: nextValue } },
                      "shipping"
                    );

                    const errorMsg = validateField("phone_number", nextValue);
                    setFormErrors((prev) => ({ ...prev, phone_number: errorMsg }));
                  }}
                  maxLength={9}

              
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="501234567"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    paddingLeft: "70px",
                    borderRadius: 6,
                    border: "1px solid #ccc",
                    fontSize: "1rem",
                  }}
                />
              </div>

              {formErrors.phone_number && (
                <span style={{ color: "red" }}>{formErrors.phone_number}</span>
              )}
            </label>




              <label style={{ display: 'flex', flexDirection: 'column', fontWeight: 500, color: '#444' }}> 
                Email*
                <input placeholder='Email' type="email" name="email" value={formData.shipping.email} onChange={handleFieldChange} 
                  style={{ marginTop: '6px', padding: '10px', fontSize: '1rem', borderRadius: '6px', border: '1px solid #ccc' }} />
                {formErrors.email && <span style={{ color: 'red', fontSize: '0.85rem' }}>{formErrors.email}</span>} 
              </label>
                <label>
                Apartment/House/Office No*
                <input placeholder='Apartment/House/Office No' type="text" name="apartment" value={formData.shipping.apartment} onChange={handleFieldChange} />
              </label>

              <label>
                Building Name / Street*
                <input placeholder=' Building Name / Street*' type="text" name="street" value={formData.shipping.street} onChange={handleFieldChange} />
                {formErrors.street && <span style={{ color: 'red' }}>{formErrors.street}</span>}
              </label>

            

              <label>
                Province / Emirates*
                <select name="state" value={formData.shipping.state} onChange={handleFieldChange}>
                  <option value="">Select state</option>
                  {UAE_EMIRATES.map((state) => (
                    <option key={state.code} value={state.code}>
                      {state.name}
                    </option>
                  ))}
                </select>
                {formErrors.state && <span style={{ color: 'red' }}>{formErrors.state}</span>}
              </label>

              <label style={{ position: 'relative' }}>
                City / Area*
                <input
                  type="text"
                  name="city"
                  autoComplete="off"
                  value={cityInput}
                  onChange={e => {
                    syncCityValue(e.target.value);
                  }}
                  placeholder="Search your city or area..."
                  style={{ padding: '10px', fontSize: '1rem', borderRadius: '6px', border: '1px solid #ccc', marginTop: 4 }}
                />
                {cityLoading && <div style={{ position: 'absolute', top: '100%', left: 0, color: '#888', fontSize: '0.95em' }}>Loading...</div>}
                {citySuggestions.length > 0 && (
                  <ul style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    background: '#fff',
                    border: '1px solid #ccc',
                    borderRadius: '0 0 6px 6px',
                    zIndex: 10,
                    maxHeight: 180,
                    overflowY: 'auto',
                    margin: 0,
                    padding: 0,
                    listStyle: 'none',
                  }}>
                    {citySuggestions.map((suggestion, idx) => (
                      <li
                        key={suggestion}
                        onClick={() => {
                          setCityInput(suggestion);
                          onChange({ target: { name: 'city', value: suggestion } }, 'shipping');
                          setCitySuggestions([]);
                        }}
                        style={{
                          padding: '8px 12px',
                          cursor: 'pointer',
                          background: suggestion === cityInput ? '#f0f0f0' : '#fff',
                          borderBottom: idx === citySuggestions.length - 1 ? 'none' : '1px solid #eee',
                        }}
                      >
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                )}
                {formErrors.city && <span style={{ color: 'red' }}>{formErrors.city}</span>}
              </label>




              <label>
                Country
                <input type="text" value="United Arab Emirates" readOnly />
              </label>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem' }}>
              <input
                type="checkbox"
                name="saveAsDefault"
                checked={formData.saveAsDefault || false}
                onChange={(e) => onChange({ target: { name: 'saveAsDefault', value: e.target.checked } })}
              />
              Save this address as default for future orders
            </label>

            {error && <div style={{ color: 'red', fontWeight: 600 }}>{error}</div>}

            <div style={{ display: 'flex', gap: isDesktop ? 16 : 12, marginTop: isDesktop ? 10 : 6, marginBottom: isDesktop ? 10 : 6 }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  backgroundColor: '#fff',
                  color: '#1976d2',
                  border: '2px solid #1976d2',
                  padding: isDesktop ? '12px 20px' : '10px 16px',
                  fontSize: isDesktop ? '1.05rem' : '0.98rem',
                  borderRadius: isDesktop ? '8px' : '6px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                  flex: 1,
                }}
              >
                GO BACK
              </button>
              <button
                type="submit"
                disabled={isSubmitting || saving}
                style={{
                  backgroundColor: '#1976d2',
                  color: '#fff',
                  padding: isDesktop ? '12px 20px' : '10px 16px',
                  fontSize: isDesktop ? '1.05rem' : '0.98rem',
                  border: 'none',
                  borderRadius: isDesktop ? '8px' : '6px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                  flex: 1,
                }}
              >
                {isSubmitting ? 'Saving...' : 'SAVE ADDRESS'}
              </button>
            </div>
          </form>
        )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddressForm;

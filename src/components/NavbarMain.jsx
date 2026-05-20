// NavbarWithMegaMenu.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import chroma from 'chroma-js';

import SearchBar from './sub/SearchBar';
import SignInModal from './sub/SignInModal';
import MobileMenu from './sub/MobileMenu';
import UserDropdownMenu from './UserDropdownMenu';
import CoinWidget from './CoinWidget';
import { useCart } from '../contexts/CartContext';
import { useTheme } from '../contexts/ThemeContext'; 
import { useAuth } from '../contexts/AuthContext';
import { resolveUserProfileImage } from '../utils/profileImage';
import LogoMain from '../assets/images/Logo/logo-17.png';

import Dirham from '../assets/images/language/aed (1).png';
import Dollor from '../assets/images/language/dollor.png';
import aeFlag from '../assets/images/language/aed (3).png';
import truck from '../assets/images/common/truck.png'

import '../assets/styles/Navbar.css';

// Icons
import Star from '../assets/images/webicons/Common/Asset 117@6x.png';
import CartIcon from '../assets/images/webicons/Header/White/Asset 30@6x.png';
import UserIcon from '../assets/images/webicons/Header/White/Asset 21@6x.png';
import TopSellicon from '../assets/images/webicons/Header/White/Asset 24@6x.png';

// MegaMenu Component
import MegaMenu from '../components/sub/megamenu';

const NavbarWithMegaMenu = ({ cartIconRef, openCart }) => {
  const { currentTheme } = useTheme(); 
  const { user, login, logout } = useAuth();
  const [categories, setCategories] = useState([]);
  const [hovering, setHovering] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [signInOpen, setSignInOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const [language, setLanguage] = useState('en');
  const [currency, setCurrency] = useState('AED');
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [languageNoticeOpen, setLanguageNoticeOpen] = useState(false);

  const { isCartOpen, cartItems } = useCart();
  const navigate = useNavigate();
  const [resolvedProfileImage, setResolvedProfileImage] = useState('');
const [currentMessage, setCurrentMessage] = useState('🚀 Fast Delivery');


  const timeoutRef = useRef(null);
  const userTimeoutRef = useRef(null);
  const langTimeoutRef = useRef(null);
  const navRef = useRef(null);

    const fastDeliveryRef = useRef(null);
  const buttonRef = useRef(null);


  const totalQuantity = cartItems?.reduce((acc, item) => acc + (Number(item.quantity) || 0), 0) || 0;

  const truncateName = (name, maxLength = 10) => {
    if (!name) return '';
    return name.length > maxLength ? name.slice(0, maxLength) + '...' : name;
  };

  // Generate a consistent color based on the first letter
  const getAvatarColor = (name) => {
    if (!name) return '#667eea';
    const colors = [
      '#FF6B6B', // Red
      '#4ECDC4', // Teal
      '#45B7D1', // Blue
      '#FFA07A', // Light Salmon
      '#98D8C8', // Mint
      '#F7DC6F', // Yellow
      '#BB8FCE', // Purple
      '#85C1E2', // Sky Blue
      '#F8B739', // Orange
      '#52C41A', // Green
      '#EB5757', // Dark Red
      '#F2994A', // Amber
      '#9B59B6', // Violet
      '#3498DB', // Ocean Blue
      '#E74C3C', // Crimson
      '#1ABC9C', // Turquoise
      '#E67E22', // Pumpkin
      '#2ECC71', // Emerald
      '#F39C12', // Sun Yellow
      '#D35400', // Burnt Orange
      '#C0392B', // Dark Crimson
      '#16A085', // Dark Turquoise
      '#27AE60', // Forest Green
      '#2980B9', // Belize Blue
      '#8E44AD', // Wisteria
      '#FF1493', // Deep Pink
    ];
    const charCode = name.charAt(0).toUpperCase().charCodeAt(0);
    const index = charCode % colors.length;
    return colors[index];
  };

  const getInitials = (user) => {
    if (user?.name) {
      return user.name.charAt(0).toUpperCase();
    } else if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };
const messages = [
  '🚀 Fast Delivery',
  '📦 Within 2 days',

];

  const capitalizeFirst = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };



  
  useEffect(() => {
    const showFastDelivery = () => {
      if (fastDeliveryRef.current) {
        fastDeliveryRef.current.style.opacity = '1';
        fastDeliveryRef.current.style.transform = 'rotate(0deg) scale(1.05)';
        setTimeout(() => {
          if (fastDeliveryRef.current) {
            fastDeliveryRef.current.style.opacity = '0';
            fastDeliveryRef.current.style.transform = 'rotate(-2deg) scale(1)';
          }
        }, 1500);
      }
    };

    const interval = setInterval(showFastDelivery, 6000);
    return () => clearInterval(interval);
  }, []);



    useEffect(() => {
    if (buttonRef.current && !buttonRef.current.dataset.gradientCycle) {
      buttonRef.current.dataset.gradientCycle = 'true';
      const gradients = [
        'linear-gradient(90deg, #ff7a00, #ff4800)',
        'linear-gradient(90deg, #ff5e00, #ff0080)',
        'linear-gradient(90deg, #ff0080, #8000ff)',
        'linear-gradient(90deg, #00c6ff, #0072ff)',
        'linear-gradient(90deg, #00b09b, #96c93d)',
      ];
      let i = 0;
      setInterval(() => {
        i = (i + 1) % gradients.length;
        buttonRef.current.style.background = gradients[i];
      }, 5000);
    }
  }, []);

   useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessage(prev => {
        const currentIndex = messages.indexOf(prev);
        return messages[(currentIndex + 1) % messages.length];
      });
    }, 3000); // change text every 3 seconds

    return () => clearInterval(interval);
  }, []);



  // Auto logout after 30 minutes
  useEffect(() => {
    const MS_PER_MINUTE = 60 * 1000;
    const handleBeforeUnload = () => {
      const now = new Date().getTime();
      localStorage.setItem('lastClosed', now);
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    const lastClosed = localStorage.getItem('lastClosed');
    if (lastClosed) {
      const now = new Date().getTime();
      if (now - Number(lastClosed) >= 30 * MS_PER_MINUTE) {
        localStorage.removeItem('userId');
        localStorage.removeItem('user');
        console.log('User auto-signed out after 30 minutes of inactivity.');
      }
    }
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Update mobile state on resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const syncProfileImage = () => {
      setResolvedProfileImage(resolveUserProfileImage(user));
    };

    syncProfileImage();

    const handleStorageChange = () => syncProfileImage();
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [user]);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setHovering(true);
  };
  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setHovering(false), 200);
  };
  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  // ===================== Updated handleLogin =====================
  const handleLogin = (userData) => {
    const mappedUser = {
      id: userData.id || userData.user?.id || userData.uid,
      name:
        userData.name ||
        userData.user?.name ||
        userData.displayName ||
        (userData.email ? userData.email.split('@')[0] : 'User'),
      email: userData.email || userData.user?.email || '',
      image: userData.image || userData.user?.photoURL || userData.photoURL || null,
      token: userData.token || null,
    };

    login(mappedUser);
    setSignInOpen(false);
  };

  const handleSignOut = () => {
    logout();
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate('/');
  };

  const handleArabicSelection = () => {
    setLangDropdownOpen(false);
    setLanguageNoticeOpen(true);
  };

  // const backgroundColor = currentTheme?.navbarBg || '#CCA000';
  const backgroundColor ='#7B5131';

  const colorToRgba = (color, alpha) => {
    if (!color) return `rgba(0, 46, 70, ${alpha})`;

    const trimmed = String(color).trim();

    if (trimmed.startsWith('#')) {
      const normalized = trimmed.replace('#', '');
      const full = normalized.length === 3
        ? normalized.split('').map(ch => ch + ch).join('')
        : normalized;
      const value = parseInt(full, 16);
      const red = (value >> 16) & 255;
      const green = (value >> 8) & 255;
      const blue = value & 255;
      return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
    }

    const rgbMatch = trimmed.match(/rgba?\(([^)]+)\)/i);
    if (rgbMatch) {
      const parts = rgbMatch[1].split(',').map(p => Number(p.trim()));
      if (parts.length >= 3 && parts.slice(0, 3).every(Number.isFinite)) {
        const [red, green, blue] = parts;
        return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
      }
    }

    return `rgba(0, 46, 70, ${alpha})`;
  };

  useEffect(() => {
    const syncBrandVarsFromNavbar = () => {
      const resolvedColor = navRef.current
        ? window.getComputedStyle(navRef.current).backgroundColor
        : backgroundColor;

      document.documentElement.style.setProperty('--brand-navbar-color', resolvedColor);
      document.documentElement.style.setProperty('--brand-navbar-soft', colorToRgba(resolvedColor, 0.12));
      document.documentElement.style.setProperty('--brand-navbar-soft-strong', colorToRgba(resolvedColor, 0.2));
    };

    syncBrandVarsFromNavbar();

    const observer = navRef.current
      ? new MutationObserver(() => syncBrandVarsFromNavbar())
      : null;

    if (observer && navRef.current) {
      observer.observe(navRef.current, { attributes: true, attributeFilter: ['style', 'class'] });
    }

    const intervalId = window.setInterval(syncBrandVarsFromNavbar, 1000);
    window.addEventListener('resize', syncBrandVarsFromNavbar);

    return () => {
      if (observer) observer.disconnect();
      window.clearInterval(intervalId);
      window.removeEventListener('resize', syncBrandVarsFromNavbar);
    };
  }, [backgroundColor, currentTheme, isMobile, isCartOpen]);

  const sitelogo = LogoMain;
  const isDark = chroma(backgroundColor).luminance() < 0.5;
  const textColor = isDark ? '#fff' : '#fff';
  const menuUser = user
    ? { ...user, image: resolvedProfileImage || user.image || user.photoURL || null }
    : null;

  return (
    <>
      <nav
        ref={navRef}
        className="navbar"
        style={{
          width: isMobile ? '100%' : isCartOpen ? 'calc(100% - 250px)' : '100%',
          transition: 'width 0.3s ease',
          backgroundColor,
          color: textColor,
        }}
      >
        <div className="navbar-inner">
          <div className="nav-left">
            <img
              src={sitelogo}
              alt="Store1920"
              className="logo"
              style={{ cursor: 'pointer' }}
              onClick={() => {
                closeMobileMenu();
                navigate('/');
              }}
            />
          </div>

          <div className="nav-center-mobile"><SearchBar /></div>

          <div
            className="mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </div>

          <div className={`navbar-menu ${mobileMenuOpen ? 'open' : ''}`}>
            <div className="nav-left-links">
              <div
                className="nav-icon-with-text gvd-nav-link"
                onClick={() => navigate('/combo-deals')}
                style={{ position: 'relative' }}
              >
                <span className="gvd-nav-text">Combo Deals</span>
                <style>{`
                  .gvd-nav-link {
                    position: relative;
                    overflow: visible !important;
                  }
                  .gvd-nav-text {
                    background: linear-gradient(90deg, #fff 0%, #ffd700 40%, #ff6b00 70%, #fff 100%);
                    background-size: 200% auto;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    animation: gvdShimmer 2.2s linear infinite;
                    font-weight: 700;
                  }
                  @keyframes gvdShimmer {
                    0% { background-position: 200% center; }
                    100% { background-position: -200% center; }
                  }
                `}</style>
              </div>
              <div className="nav-icon-with-text star-rating" onClick={() => navigate('/top-selling-item')}>
                <img src={TopSellicon} alt="Top Selling" className="icon-star" />
                <span>Top Selling Items</span>
              </div>
   
   
<div style={{ position: 'relative', display: 'inline-block', fontFamily: 'sans-serif' }}>
  {/* Animated Floating Badge */}
  <div
    style={{
      position: 'absolute',
      top: '-30px', // move up a bit for arrow
      left: '0px',
      background: '#ff9900e5',
      color: '#fff',
      padding: '10px 15px 15px',
      borderRadius: '5px',
      fontSize: '11px',
      fontWeight: '600',
      boxShadow: '0 2px 8px rgba(255,71,87,0.4)',
      zIndex: 2,
      overflow: 'visible', // allow arrow to show
      height: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <span key={currentMessage} className="animatedBadgeText">
      {currentMessage}
    </span>

    {/* Arrow pointing down */}
    <div
      style={{
        position: 'absolute',
        bottom: '-5px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '0',
        height: '0',
        borderLeft: '6px solid transparent',
        borderRight: '6px solid transparent',
        borderTop: '6px solid #ff4757',
      }}
    />

    <style>
      {`
        .animatedBadgeText {
          display: inline-block;
          animation: slideInTop 0.6s ease forwards;
        }

        @keyframes slideInTop {
          0% { transform: translateY(-100%); opacity: 0; }
          60% { transform: translateY(10%); opacity: 1; }
          80% { transform: translateY(-3%); }
          100% { transform: translateY(0); }
        }
      `}
    </style>
  </div>

  {/* Main Button */}
  <div
    onClick={() => navigate('/fast-delivery')}
    style={{
      background: 'transparent',
      color: '#ffffff',
      padding: '8px 10px',
      border: '1px solid #ffffff2c',
      borderRadius: '30px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      cursor: 'pointer',
      fontWeight: '700',
      fontSize: '14px',
      letterSpacing: '0.5px',
      overflow: 'hidden',
      position: 'relative',
      isolation: 'isolate',
      transition: 'all 0.3s ease',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'scale(1.05)';
      e.currentTarget.style.boxShadow = '0 0 12px rgba(255,255,255,0.5)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'scale(1)';
      e.currentTarget.style.boxShadow = 'none';
    }}
  >
    {/* Shine effect */}
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: '-80%',
        width: '50%',
        height: '100%',
        background: 'linear-gradient(120deg, rgba(255,255,255,0.5), rgba(255,255,255,0))',
        transform: 'skewX(-25deg)',
        animation: 'shine 2s infinite',
        zIndex: 0,
      }}
    />
    {/* Truck Image with jerk animation */}

    {/* Truck */}
<img
  src={truck}
  alt="ShipXpress"
  style={{
    width: "26px",
    height: "26px",
    zIndex: 2,
    position: "relative",
    animation: "truckOneSideSlow 10s linear infinite",
  }}
/>

<div
  style={{
    position: "absolute",
    left: "0px",
    width: "14px",
    height: "14px",
    background: "radial-gradient(circle, rgba(220,220,220,0.8) 0%, rgba(220,220,220,0) 70%)",
    borderRadius: "50%",
    opacity: 0,
    filter: "blur(3px)",
    animation: "fogPuff 10s ease-in-out infinite",
    zIndex: 0,
  }}
></div>


  <span
    style={{
      color: "#fff",
      fontWeight: "700",
      fontSize: "14px",
      zIndex: 1,
      position: "relative",
    }}
  >
    ShipXpress
  </span>

<style>
{`
  @keyframes truckOneSideSlow {
    0%   { transform: translateX(0); opacity:1; }          /* near text */
    20%  { transform: translateX(45px); opacity:1; }       /* drive right fast */
    30%  { transform: translateX(80px); opacity:0; }       /* fade out offscreen */
    60%  { transform: translateX(-80px); opacity:0; }      /* off left */
    70%  { transform: translateX(-20px); opacity:1; }      /* start slow left approach */
    80%  { transform: translateX(0); opacity:1; }          /* stop near text */
    100% { transform: translateX(0); opacity:1; }
  }

  @keyframes fogPuff {
    0%, 70% { opacity:0; transform: scale(0.8); }
    75%     { opacity:0.7; transform: scale(1.3); }  /* visible puff */
    85%     { opacity:0.3; transform: scale(1.8); }  /* fade out */
    100%    { opacity:0; transform: scale(0.8); }
  }
`}
</style>


  </div>
</div>




              <div className="nav-icon-with-text star-rating" onClick={() => navigate('/rated')}>
                <img src={Star} alt="5 Star rated" className="icon-star" />
                <span>5-Star Rated</span>
              </div>

              <div
                className="categories-dropdown"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <span>Categories&nbsp;▾</span>
              </div>
              {hovering && (
                <div
                  className="mega-dropdown-card"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <MegaMenu categories={categories} onClose={() => setHovering(false)} />
                </div>
              )}
            </div>

            <div className="nav-center"><SearchBar /></div>

            <div className="nav-right">
              {menuUser ? (
                <div
                  className="account logged-in"
                  title={`Hi, ${menuUser?.name || 'User'}`}
                  onMouseEnter={() => {
                    if (userTimeoutRef.current) clearTimeout(userTimeoutRef.current);
                    setUserDropdownOpen(true);
                    console.log('Current user data:', menuUser);
                    console.log('User image:', menuUser?.image);
                    console.log('User photoURL:', menuUser?.photoURL);
                  }}
                  onMouseLeave={() => {
                    userTimeoutRef.current = setTimeout(() => setUserDropdownOpen(false), 200);
                  }}
                  style={{ position: 'relative' }}
                >
                  <div 
                    className="avatar"
                    style={{ 
                      background: (menuUser?.image || menuUser?.photoURL) 
                        ? 'transparent' 
                        : getAvatarColor(menuUser?.name || menuUser?.email)
                    }}
                  >
                    {(menuUser?.image || menuUser?.photoURL) ? (
                      <>
                        <img 
                          src={menuUser.image || menuUser.photoURL} 
                          alt={menuUser.name || menuUser.email}
                          onError={(e) => {
                            console.error('Image failed to load:', e.target.src);
                            e.target.style.display = 'none';
                          }}
                        />
                        <div 
                          className="avatar-fallback"
                          style={{ display: 'none' }}
                        >
                          {getInitials(menuUser)}
                        </div>
                      </>
                    ) : (
                      <div className="avatar-fallback">
                        {getInitials(menuUser)}
                      </div>
                    )}
                  </div>
                  <div className="user-name">
                    Hi, {menuUser?.name ? capitalizeFirst(truncateName(menuUser.name)) : 
                         menuUser?.email ? truncateName(menuUser.email.split('@')[0]) : 'User'}{' '}
                    <CoinWidget userId={menuUser?.id ? Number(menuUser.id) : 0} />
                  </div>

                  <UserDropdownMenu
                    user={menuUser}
                    isOpen={userDropdownOpen}
                    onSignOut={handleSignOut}
                    onClose={() => setUserDropdownOpen(false)}
                    setUserDropdownOpen={setUserDropdownOpen}
                    setMobileMenuOpen={setMobileMenuOpen}
                  />
                </div>
              ) : (
                <div className="account guest-account" onClick={() => setSignInOpen(true)}>
                  <img src={UserIcon} alt="Profile Icon" className="icon-small" />
                  <div className="account-text" style={{ color: textColor }}>
                    <span className="account-title">Sign In / Register</span>
                    <span className="small-text">Orders & Account</span>
                  </div>
                </div>
              )}

              {/* Language & currency */}
              <div
                className="nav-icon-with-text language-dropdown"
                onMouseEnter={() => {
                  if (langTimeoutRef.current) clearTimeout(langTimeoutRef.current);
                  setLangDropdownOpen(true);
                }}
                onMouseLeave={() => {
                  langTimeoutRef.current = setTimeout(() => setLangDropdownOpen(false), 200);
                }}
                style={{ position: 'relative', cursor: 'pointer', marginRight: '20px', color: textColor }}
              >
                <span style={{ display: 'flex', alignItems: 'center' }}>
                  <img
                    src={aeFlag}
                    alt={language === 'en' ? 'English' : 'العربية'}
                    className="lang-icon"
                    style={{ marginRight: '5px', width: '20px', height: '20px' }}
                  />
                  {language === 'en' ? 'English' : 'العربية'} ▾
                </span>

                {langDropdownOpen && (
                  <div className="lang-dropdown-card">
                    <div className="dropdown-arrow-up" />
                    <div className="dropdown-section">
                      <div className="dropdown-title">Language</div>
                      <label className="radio-item">
                        <input type="radio" checked={language === 'ar'} onChange={handleArabicSelection} />
                        العربية
                      </label>
                      <label className="radio-item">
                        <input type="radio" checked={language === 'en'} onChange={() => setLanguage('en')} />
                        English
                      </label>
                    </div>

                    <hr />

                    <div className="dropdown-section">
                      <div className="currency-item" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span>Currency:</span>
                        <img src={currency === 'AED' ? Dirham : Dollor} alt={currency} style={{ width: '14px', height: '12px' }} />
                        <span>{currency}</span>
                      </div>
                    </div>

                    <hr />

                    <div className="dropdown-footer">
                      <img src={aeFlag} alt="UAE" className="footer-flag" />
                      <span style={{ maxWidth: "250px", display: "inline-block", whiteSpace: "normal", lineHeight: "1.4" }}>
                        You are shopping in United Arab Emirates.
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Cart icon */}
              <div
                className="nav-icon-only"
                title="Cart"
                onClick={() => navigate('/cart')}
                style={{ cursor: 'pointer', position: 'relative' }}
              >
                <img src={CartIcon} alt="Cart" className="icon-cart" />
                {totalQuantity > 0 && <div className="cart-badge">{totalQuantity}</div>}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <MobileMenu
        isOpen={mobileMenuOpen}
        closeMobileMenu={closeMobileMenu}
        categories={categories}
        user={menuUser}
        userDropdownOpen={userDropdownOpen}
        setUserDropdownOpen={setUserDropdownOpen}
        setSignInOpen={setSignInOpen}
        handleSignOut={handleSignOut}
        closeUserDropdown={() => setUserDropdownOpen(false)}
      />

      <SignInModal
        isOpen={signInOpen}
        onClose={() => setSignInOpen(false)}
        onLogin={handleLogin}
      />
      {languageNoticeOpen && (
        <div
          onClick={() => setLanguageNoticeOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            zIndex: 9999,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '420px',
              background: '#fff',
              borderRadius: '16px',
              padding: '24px',
              textAlign: 'center',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.18)',
            }}
          >
            <p style={{ margin: 0, color: '#222', fontSize: '18px', fontWeight: 600, lineHeight: 1.5 }}>
              We are working on enhancing your experience
            </p>
            <button
              type="button"
              onClick={() => setLanguageNoticeOpen(false)}
              style={{
                marginTop: '18px',
                border: 'none',
                borderRadius: '999px',
                background: '#8C3200',
                color: '#fff',
                padding: '10px 22px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default NavbarWithMegaMenu;

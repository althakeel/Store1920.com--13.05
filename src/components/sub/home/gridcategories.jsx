// src/components/home/GridCategories.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../../assets/styles/home/GridCategories.css";
import { useCart } from "../../../contexts/CartContext";

// Images
import PlaceHolderImage from "../../../assets/images/common/Placeholder.png";
import AutomotiveImage from "../../../assets/images/megamenu/Main catogory webp/Automotive.webp";
import ElectronicsImage from "../../../assets/images/megamenu/Main catogory webp/Electronics.webp";
import TravelImage from "../../../assets/images/megamenu/Main catogory webp/Travel & Luggage.webp";
import FashionImage from "../../../assets/images/megamenu/Main catogory webp/Fashion.webp";

import Static1 from '../../../assets/images/staticproducts/gamekit/1.webp'
import Static2 from '../../../assets/images/staticproducts/minproject/2.webp'
import Static3 from '../../../assets/images/staticproducts/airbed/6.webp'
import Static4 from '../../../assets/images/staticproducts/pruningmachine/1.webp'

// WooCommerce API credentials
const API_BASE = "https://db.store1920.com/wp-json/wc/v3";
const CK = "ck_408d890799d9dc59267dd9b1d12faf2b50f9ccc8";
const CS = "cs_c65538cff741bd9910071c7584b3dffb";

// Static left categories
const staticCategories = [
  { id: 3, name: "Travel & Luggage", image: TravelImage, link: "/category/travel-luggage" },
  { id: 1, name: "Automotive", image: AutomotiveImage, link: "/category/automotive" },
  { id: 4, name: "Fashion", image: FashionImage, link: "/category/fashion" },
  { id: 2, name: "Electronics", image: ElectronicsImage, link: "/category/electronics" },
];

// Initial placeholder products (shown instantly)
const initialProductPlaceholders = [
  { 
    id: 128574, 
    slug: "/gamebox-64-retro-console-20000-preloaded-games-4k-hdmi-wireless-controllers", 
    name: "GameBox 64 Retro Console – 20,000+ Preloaded Games with 4K HDMI & Wireless Controllers", 
    price: "79.90",  
    images: [{ src: Static1 }]  
  },
  { 
    id: 126009, 
    slug: "mini-portable-smart-projector", 
    name: "Mini Portable Smart Projector", 
    price: "149.90", 
    images: [{ src: Static2 }] 
  },
  { 
    id: 125961, 
    slug: "twin-size-air-mattress-with-built-in-rechargeable-pump-16-self-inflating-blow-up-bed-for-home-camping-guests", 
    name: "Twin Size Air Mattress with Built-in Rechargeable Pump – 16 Self-Inflating Blow Up Bed for Home, Camping & Guests", 
    price: "179.00", 
    images: [{ src: Static3 }] 
  },
  { 
    id: 125925, 
    slug: "trimpro-21v-cordless-electric-pruning-shears", 
    name: "TrimPro™ 21V Cordless Electric Pruning Shears", 
    price: "119.90", 
    images: [{ src: Static4 }] 
  },
];

const shuffleArray = (items) => {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Countdown hook
const useCountdown = (targetDate) => {
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;
      if (distance <= 0) {
        clearInterval(interval);
        setTimeLeft({ h: 0, m: 0, s: 0 });
        return;
      }
      setTimeLeft({
        h: Math.floor(distance / (1000 * 60 * 60)),
        m: Math.floor((distance / (1000 * 60)) % 60),
        s: Math.floor((distance / 1000) % 60),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  return timeLeft;
};

// Calculate next 2 AM
const getNext2AM = () => {
  const now = new Date();
  const next2AM = new Date();
  
  // Set to 2 AM today
  next2AM.setHours(2, 0, 0, 0);
  
  // If current time is past 2 AM, set to 2 AM tomorrow
  if (now >= next2AM) {
    next2AM.setDate(next2AM.getDate() + 1);
  }
  
  return next2AM.getTime();
};

const GridCategories = () => {
  const [products, setProducts] = useState([
    initialProductPlaceholders[1],
    initialProductPlaceholders[3],
    initialProductPlaceholders[0],
    initialProductPlaceholders[2],
  ]);
  const [banners, setBanners] = useState([]);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [targetDate] = useState(getNext2AM());

  const { addToCart, cartItems } = useCart();
  const navigate = useNavigate();
  const featuredCountdown = useCountdown(targetDate);

  // Resize detection
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Auto-slide banners
  useEffect(() => {
    if (!isMobile) return;
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [isMobile, banners.length]);

  // Fetch real products in background
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const url = `${API_BASE}/products?consumer_key=${CK}&consumer_secret=${CS}&per_page=4&page=1&orderby=date&order=asc&_fields=id,name,price,regular_price,images`;
        const res = await fetch(url);
        const data = await res.json();

        if (data?.length > 0) {
          const formatted = data.map((prod) => ({
            id: prod.id,
            name: prod.name,
            price: prod.price,
            regular_price: prod.regular_price,
            images: prod.images?.length ? prod.images : [{ src: PlaceHolderImage }],
          }));
          setProducts(shuffleArray(formatted));
        }
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };

    fetchProducts();
  }, []);

  // Set banners
  useEffect(() => {
    setBanners([
      { id: 1, image: "https://db.store1920.com/wp-content/uploads/2026/05/Sub-1.webp" },
      { id: 2, image: "https://db.store1920.com/wp-content/uploads/2026/05/sub-2.webp" },
    ]);
  }, []);

  const isInCart = (id) => cartItems.some((item) => item.id === id);

  return (
    <div className="gcx-container">
      {/* LEFT */}
      <div className="gcx-left">
        <h3 className="gcx-section-title">More Reasons to Shop</h3>
        <div className="gcx-left-grid">
          {staticCategories.map((cat) => (
            <div key={cat.id} className="gcx-category-card" onClick={() => navigate(cat.link)}>
              <img src={cat.image || PlaceHolderImage} alt={cat.name} />
              <div className="gcx-cat-info">
                <h4>{cat.name}</h4>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CENTER */}
      <div className="gcx-middle">
        <div className="gcx-featured-header">
          <h3 className="gcx-mega-title">MEGA DEALS</h3>
          <div className="gcx-featured-countdown">
            ⏳ {featuredCountdown.h}h : {featuredCountdown.m}m : {featuredCountdown.s}s
          </div>
        </div>

        <div className="gcx-middle-grid">
          {products.map((prod, idx) => {
            const inCart = isInCart(prod.id);
            const displayName =
              prod.name?.length > 22 ? prod.name.substring(0, 22) + "…" : prod.name || "Loading...";

            return (
              <div key={prod.id || `ph-${idx}`} className="gcx-product-card"
                onClick={() => prod.id && navigate(`/products/${prod.slug}`)}>
                <img
                  src={prod?.images?.[0]?.src || PlaceHolderImage}
                  alt={prod?.name || "Product"}
                  className="gcx-product-image"
                  loading="lazy"
                />
                <h4
                  className="gcx-product-title"
                  style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                >
                  {displayName}
                </h4>
                {prod?.price && (
                  <div className="gcx-price-wrap">
                    {prod?.regular_price && <span className="gcx-old-price">AED {prod.regular_price}</span>}
                    <span className="gcx-product-price">AED {prod.price}</span>
                  </div>
                )}
                {prod?.id && (
                  <button className="gcx-cart-btn" onClick={() => !inCart && addToCart(prod)}>
                    {inCart ? "Added" : "Add to Cart"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT */}
      <div className="gcx-right">
        {isMobile ? (
          <div
            className="gcx-banner"
            onClick={() => navigate('/products/porodo-trackfit-smart-fitness-band-black-orange')}
            style={{ cursor: "pointer" }}
          >
            <img
              src={banners[currentBanner]?.image}
              alt={`Banner ${banners[currentBanner]?.id}`} 
              style={{ transition: "opacity 0.5s ease-in-out" }}
            />
          </div>
        ) : (
          banners.map((ban) => (
            <div
              key={ban.id}
              className="gcx-banner"
              onClick={() => navigate('/products/porodo-trackfit-smart-fitness-band-black-orange')}
              style={{ cursor: "pointer" }}
            >
              <img src={ban.image} alt={`Banner ${ban.id}`} />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default GridCategories;

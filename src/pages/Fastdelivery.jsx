import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from "react";
import { API_BASE, CONSUMER_KEY, CONSUMER_SECRET } from "../api/woocommerce";
import Product1 from '../assets/images/staticproducts/pressurewasher/1.webp';
import Product2 from '../assets/images/staticproducts/airbed/1.webp';
import Product3 from '../assets/images/staticproducts/paintspray/14.webp';
import Product4 from '../assets/images/staticproducts/pruningmachine/10.webp';
import Product5 from '../assets/images/staticproducts/gamekit/1.webp';
import Product7 from '../assets/images/staticproducts/Air Blower/1.webp';
import Product8 from '../assets/images/staticproducts/AIR BLOWER MINI/9.webp'
import Product9 from '../assets/images/staticproducts/Steamer/1.webp'
import Product10 from '../assets/images/staticproducts/Peeler/1.webp'
import Product11 from '../assets/images/staticproducts/minproject/4.webp'
import Product12 from '../assets/images/staticproducts/Boxing Machine/1.webp'
import Product13 from '../assets/images/staticproducts/CCTV Camera/1.webp'
import Product14 from '../assets/images/staticproducts/drill-machine/2.webp'
import Product15 from '../assets/images/staticproducts/wrinkle-remover/10.webp'
import Product16 from '../assets/images/staticproducts/massager/3.webp'
import product17 from '../assets/images/staticproducts/wirelesscharger/GNPTRIOWCGY-2998.webp'
import Product18 from '../assets/images/staticproducts/quran/9.webp';
import Product19 from '../assets/images/staticproducts/quran speaker/1.webp';
import Product20 from '../assets/images/staticproducts/portable bottle warmer/4.webp';
import Product21 from '../assets/images/staticproducts/scalp_messager/4.webp';
import Product22 from '../assets/images/staticproducts/baby_stroller/10.webp';
import Product23 from '../assets/images/staticproducts/mansoory-scooty/1.webp';
import Product274 from '../assets/images/staticproducts/PorodoTrackFit/1.webp';
import Product279 from '../assets/images/staticproducts/airtab-mini/5.webp';
import Product29 from '../assets/images/staticproducts/porodoband/3.webp';
import NoItemImage from '../assets/images/noitem.png';
import Product290 from '../assets/images/staticproducts/DpofirsSmartBand/1.webp';
import Product296 from '../assets/images/staticproducts/PushUpBoard/1.webp';
import Product300 from '../assets/images/staticproducts/GameConsoleJ36/1.webp';


const DESKTOP_COLUMNS = 5;
const MOBILE_COLUMNS = 2;

const staticProducts = [
   {
    id: "j36-ultra-portable-retro-game-console",
    name: "J36 Ultra Portable Retro Game Console",
    price: "219.00",
    regular_price: "289.00",
    sale_price: "219.00",
    images: [{ src: Product300 }],
    path: "/products/j36-ultra-portable-retro-game-console",
    rating: 5,
    reviews: 18,
    sold: 74,
  },
   {
    id: "15-in-1-push-up-board-home-workout-fitness-rack",
    name: "15 in 1 Push Up Board Portable Home Workout Fitness Rack",
    price: "59.00",
    regular_price: "99.00",
    sale_price: "59.00",
    images: [{ src: Product296 }],
    path: "/products/15-in-1-push-up-board-home-workout-fitness-rack",
    rating: 4,
    reviews: 5,
    sold: 46,
  },
   {
    id: "smart-band-fitness-tracker-black",
    name: "Smart Band Fitness Tracker",
    price: "129.00",
    regular_price: "180.00",
    sale_price: "129.00",
    images: [{ src: Product290 }],
    path: "/products/smart-band-fitness-tracker-black",
    rating: 4,
    reviews: 2,
    sold: 28,
  },
  {
    id: "porodo-trackfit-smart-fitness-band-black-orange",
    name: "Porodo TrackFit Screenless Fitness Band",
    price: "99.00",
    regular_price: "699.00",
    sale_price: "99.00",
    images: [{ src: Product274 }],
    path: "/products/porodo-trackfit-smart-fitness-band-black-orange",
    rating: 5,
    reviews: 12000,
    sold: 3500
  },

  {
    id: "airtab-17-5g-smartphone",
    name: "AirTab 17 Pro Max 5G Smartphone",
    price: "269",
    regular_price: "999.00",
    sale_price: "269",
    images: [{ src: Product279 }],
    path: "/products/airtab-17-5g-smartphone",
    rating: 5,
    reviews: 128,
    sold: 342
  },

     {
    id: "neck-face-massager",
    name: "Neck Face Massager",
    price: "64.99",
    regular_price: "120.  ",
    sale_price: "64.99",
    images: [{ src: Product15 }],
    path: "/products/neck-face-massager",
    rating: 5,
    reviews: 48,
    sold: 102
  },
  
    {
    id: "drill-kit-with-2-battery–ultimate-cordless-power-tool-set",
    name: "Drill Kit with 2 Battery – Ultimate Cordless Power Tool Set",
    price: "119.90",
    regular_price: "150.  ",
    sale_price: "119.90",
    images: [{ src: Product14 }],
    
    path: "/products/drill-kit-with-2-battery–ultimate-cordless-power-tool-set",
    rating: 5,
    reviews: 48,
    sold: 119
  },

  //  {
  //   id: "cctv-camera",
  //   name: "CCTV",
  //   price: "99.90",
  //   regular_price: "120.  ",
  //   sale_price: "99.90",
  //   images: [{ src: Product13 }],
  //   path: "/products/cctv-camera",
  //   rating: 5,
  //   reviews: 48,
  //   sold: 139
  // },
  {
    id: "Boxing machine",
    name: "Music Boxing Machine – Smart Boxing Trainer",
    price: "124.00",
    regular_price: "150.  ",
    sale_price: "124.00",
    images: [{ src: Product12 }],
    path: "/products/boxing-machine",
    rating: 5,
    reviews: 48,
    sold: 152
  },
  {
    id: "Mini Portable Smart Projector",
    name: "Mini Portable Smart Projector",
    price: "149.90",
    regular_price: "329.00",
    sale_price: "149.90",
    images: [{ src: Product11 }],
    path: "/products/mini-portable-smart-projector",
    rating: 5,
    reviews: 48,
    sold: 139
  },

  // {
  //   id: "Porodo TrackFit Smart Fitness Band – 120+ Sports Modes, 30-Day Battery",
  //   name: "Porodo TrackFit Smart Fitness Band – 120+ Sports Modes, 30-Day Battery",
  //   price: "99.90",
  //   regular_price: "169.00",
  //   sale_price: "99.90",
  //   images: [{ src: Product29 }],
  //   path: "/products/porodo-trackfit-smart-fitness-band-black-orange",
  //   rating: 5,
  //   reviews: 28,
  //   sold: 29
  // },





  {
    id: "48V Cordless Portable Car Wash Pressure Washer Gun with Dual",
    name: "48V Cordless Portable Car Wash Pressure Washer Gun with Dual",
    price: "75.00",
    regular_price: "120.00",
    sale_price: "75.00",
    images: [{ src: Product1 }],
    path: "/products/48v-cordless-portable-car-wash-pressure-washer-gun-with-dual",
    rating: 4,
    reviews: 18,
    sold: 120
  },
  {
    id: "twin-size-air-mattress-with-built-in-rechargeable-pump",
    name: "Twin Size Air Mattress with Built-in Rechargeable Pump – Self-Inflating Blow Up Bed",
    price: "159.90",
    regular_price: "189.0",
    sale_price: "159.90",
    images: [{ src: Product2 }],
    path: "/products/twin-size-air-mattress-with-built-in-rechargeable-pump-16-self-inflating-blow-up-bed-for-home-camping-guests",
    rating: 5,
    reviews: 45,
    sold: 135,
  },
  {
    id: "850w-electric-paint-sprayer-uae",
    name: "Electric Paint Sprayer",
    price: "89.90",
    regular_price: "250.0",
    sale_price: "89.90",
    images: [{ src: Product3 }],
    path: "/products/850w-electric-paint-sprayer-uae",
    rating: 5,
    reviews: 159,
    sold: 195,
  },
  {
    id: "5",
    name: "TrimPro™ 21V Cordless Electric Pruning Shears",
    price: "119.90",
    regular_price: "250.0",
    sale_price: "119.90",
    images: [{ src: Product4 }],
    path: "/products/trimpro-21v-cordless-electric-pruning-shears",
    rating: 5,
    reviews: 169,
    sold: 225,
  },
  {
    id: "6",
    name: "GameBox 64 Retro Console – 20,000+ Games, 4K HDMI, Wireless Controllers",
    price: "109.90",
    regular_price: "145.99",
    sale_price: "109.90",
    images: [{ src: Product5 }],
    path: "/products/gamebox-64-retro-console-20000-preloaded-games-4k-hdmi-wireless-controllers",
    rating: 5,
    reviews: 110,
    sold: 185,
  },
  {
    id: "7",
    name: "Cordless Leaf Blower",
    price: "79.00",
    regular_price: "189.00",
    sale_price: "79.00",
    images: [{ src: Product7 }],
    path: "/products/cordless-2-in-1-leaf-blower-vacuum",
    rating: 5,
    reviews: 195,
    sold: 285,
  },
    {
    id: "8",
    name: "Turbo Cordless Leaf Blower – 21V Power for Every Task",
    price: "55.00",
    regular_price: "99.98",
    sale_price: "55.00",
    images: [{ src: Product8 }],
    path: "/products/turbo-cordless-leaf-blower-21v-power-for-every-task",
    rating: 5,
    reviews: 169,
    sold: 225,
  },
      {
    id: "9",
    name: "Steam Cleaner DF-A001 – Japan Technology",
    price: "99.90",
    regular_price: "129.70",
    sale_price: "99.90",
    images: [{ src: Product9 }],
    path: "/products/steam-cleaner-df-a001-japan-technology",
    rating: 5,
    reviews: 139,
    sold: 295,
  },
  {
    id: "10",
    name: "Electric Grape & Garlic Peeling Machine",
    price: "89.90",
    regular_price: "100",
    sale_price: "89.90",
    images: [{ src: Product10 }],
    path: "/products/electric-grape-garlic-peeling-machine",
    rating: 5,
    reviews: 199,
    sold: 305,
  },
   {
    id: "11",
    name: "Heated Shiatsu Massager – Human-Like Neck & Back Relief Anywhere",
    price: "139.00",
    regular_price: "199.00",
    sale_price: "139.00",
    images: [{ src: Product16 }],
    path: "/products/heated-shiatsu-massager-human-like-neck-back-relief-anywhere",
    rating: 5,
    reviews: 182,
    sold: 285,
  },
   {
    id: "12",
    name: "Green Lion Power Trio – 3-in-1 Magnetic Wireless Charger",
    price: "149.00",
    regular_price: "199.00",
    sale_price: "149.00",
    images: [{ src: product17 }],
    path: "/products//green-lion-power-trio-3-in-1-magnetic-wireless-charger",
    rating: 5,
    reviews: 165,
    sold: 195,
  },

  
   {
    id: "13",
    name: "Quran Magnet Speaker with Built-In  Quran",
    price: "75.00",
    regular_price: "199.00",
    sale_price: "75.00",
    images: [{ src: Product18 }],
    path: "/products/quran-magnet-speaker-built-in-surah-player",
    rating: 5,
    reviews: 165,
    sold: 195,
  },
  {
    id: "14",
    name: "Holy Wall Speaker Bluetooth Quran Light Speaker",
    price: "85.00",
    regular_price: "120",
    sale_price: "85.00",
    images: [{ src: Product19 }],
    path: "/products/holy-wall-speaker-bluetooth-quran-light-speaker",
    rating: 5,
    reviews: 165,
    sold: 195,
  },
  {
    id: "15",
    name: "Portable Bottle Warmer",
    price: "69.90",
    regular_price: "150",
    sale_price: "69.90",
    images: [{ src: Product20 }],
    path: "/products/portable-bottle-warmer",
    rating: 5,
    reviews: 165,
    sold: 195,
  },
  {
    id: "15",
    name: "Electric Scalp Massager",
    price: "69.90",
    regular_price: "150",
    sale_price: "89.90",
    images: [{ src: Product21 }],
    path: "/products/electric-scalp-massager",
    rating: 5,
    reviews: 165,
    sold: 195,
  },
  {
    id: "mansory-special-edition-scooter-sm10",
    name: "Mansory Special Edition Scooter SM10",
    price: "3850.00",
    regular_price: "6000.00",
    sale_price: "3850.00",
    images: [{ src: Product23 }],
    path: "/products/mansory-special-edition-scooter-sm10",
    rating: 5,
    reviews: 36,
    sold: 62,
  },
  {
    id: "nexso-2-in-1-baby-stroller-the-last-stroller-youll-ever-need",
    name: "Nexso 2-in-1 Baby Stroller",
    price: "329.00",
    regular_price: "700.00",
    sale_price: "329.00",
    images: [{ src: Product22 }],
    path: "/products/nexso-2-in-1-baby-stroller-the-last-stroller-youll-ever-need",
    rating: 5,
    reviews: 96,
    sold: 148,
  },
  
];
const SkeletonCard = ({ isMobile }) => {
  return (
    <div style={{
      background: "#fff",
      borderRadius: "12px",
      overflow: "hidden",
      boxShadow: "0 3px 10px rgba(0,0,0,0.08)",
      animation: "pulse 1.5s infinite"
    }}>
      {/* Image */}
      <div style={{
        width: "100%",
        height: isMobile ? "160px" : "220px",
        background: "#eee"
      }} />

      {/* Content */}
      <div style={{ padding: "12px" }}>
        <div style={{
          height: "12px",
          background: "#eee",
          marginBottom: "8px",
          borderRadius: "4px"
        }} />

        <div style={{
          height: "12px",
          width: "60%",
          background: "#eee",
          marginBottom: "10px",
          borderRadius: "4px"
        }} />

        <div style={{
          height: "14px",
          width: "40%",
          background: "#ddd",
          borderRadius: "4px"
        }} />
      </div>
    </div>
  );
};
//shuffle productcs 
const shuffleArray = (array) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};


const Fastdelivery = () => {
  const navigate = useNavigate();
  const [apiProducts, setApiProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const isMobile = window.innerWidth <= 768;
  const columnsPerRow = isMobile ? MOBILE_COLUMNS : DESKTOP_COLUMNS;
  useEffect(() => {
    fetchProducts();
  }, []);

const fetchProducts = async () => {
  setLoading(true);

  try {
    const totalLoaded = staticProducts.length + apiProducts.length;
    const remainder = totalLoaded % columnsPerRow;
    const batchSize =
      apiProducts.length === 0 && remainder !== 0
        ? columnsPerRow - remainder
        : columnsPerRow * 2;

    const res = await fetch(
      `${API_BASE}/products?consumer_key=${CONSUMER_KEY}&consumer_secret=${CONSUMER_SECRET}&status=publish&per_page=${batchSize}&offset=${apiProducts.length}&_fields=id,name,price,regular_price,sale_price,images,slug`
    );

    const data = await res.json();

    const formatted = data
      .filter((p) => p && p.images && p.images.length > 0)
      .map((p) => ({
        id: p.id,
        name: p.name,
        sale_price: p.sale_price || p.price,
        regular_price: p.regular_price,
        images: p.images,
        path: `/product/${p.slug}`,
        rating: 5,
        reviews: 0,
        sold: 0,
      }));

    setHasMore(formatted.length === batchSize);

    setApiProducts((prev) => {
      const seen = new Set(prev.map((product) => product.id));
      const nextProducts = formatted.filter((product) => !seen.has(product.id));
      return shuffleArray([...prev, ...nextProducts]);
    });
  } catch (err) {
    console.error("Error fetching products:", err);
    setHasMore(false);
  } finally {
    setLoading(false);
  }
};
  
  const truncateName = (name) => {
    const isMobile = window.innerWidth <= 768;
    const limit = isMobile ? 28 : 50;
    return name.length > limit ? name.substring(0, limit) + "..." : name;
  };
  const loadingSkeletonCount = isMobile ? MOBILE_COLUMNS * 2 : DESKTOP_COLUMNS;
const mergedProducts = [
  ...staticProducts,
  ...apiProducts
].filter(p => p && p.images);
const displayableCount =
  mergedProducts.length <= columnsPerRow
    ? mergedProducts.length
    : Math.floor(mergedProducts.length / columnsPerRow) * columnsPerRow;
const displayedProducts = mergedProducts.slice(0, displayableCount);

  return (
    <div style={{ background: '#fff', padding: '10px 0 40px' }}>

      {/* TITLE */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto 25px',
        textAlign: 'center',
      }}>
        <h2 style={{
          fontSize: isMobile ? '20px' : '26px',
          fontWeight: '700',
          color: '#333',
          marginBottom: '5px',
        }}>
          Fast Delivery Products
        </h2>
        <p style={{
          color: '#666',
          fontSize: isMobile ? '13px' : '15px',
          margin: 0,
        }}>
          Get your top-selling items delivered in no time!
        </p>
      </div>

      {/* PRODUCT GRID */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: isMobile ? `repeat(${MOBILE_COLUMNS}, 1fr)` : `repeat(${DESKTOP_COLUMNS}, minmax(0, 1fr))`,
        gap: isMobile ? '12px' : '20px',
        padding: '0 12px',
      }}>
       {displayedProducts.length === 0 ? (
  // 🔹 First Load Skeletons
  Array.from({ length: 8 }).map((_, index) => (
    <SkeletonCard key={index} isMobile={isMobile} />
  ))
) : (
  <>
    {/* 🔹 Real Products */}
    {displayedProducts.map((product, index) => {
      if (!product) return null;

      return (
        <div
          key={product.id || index}
          onClick={() => navigate(product.path)}
          style={{
            position: 'relative',
            background: '#fff',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 3px 10px rgba(0,0,0,0.10)',
            cursor: 'pointer',
            transition: 'transform 0.25s ease',
          }}
          onMouseEnter={(e) =>
            !isMobile && (e.currentTarget.style.transform = 'translateY(-5px)')
          }
          onMouseLeave={(e) =>
            !isMobile && (e.currentTarget.style.transform = 'translateY(0)')
          }
        >
          {/* 🔸 BADGE */}
          <div
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              background: '#ff6b00',
              color: '#fff',
              padding: '3px 6px',
              borderRadius: '6px',
              fontSize: isMobile ? '10px' : '12px',
              fontWeight: 'bold',
              zIndex: 3,
            }}
          >
            Fast Moving
          </div>

          {/* 🔸 IMAGE */}
          <img
            src={product.images?.[0]?.src || NoItemImage}
            alt={product.name || "Product"}
            style={{
              width: '100%',
              height: isMobile ? '160px' : '220px',
              objectFit: 'cover',
              borderBottom: '1px solid #f0f0f0',
            }}
          />

          {/* 🔸 CONTENT */}
          <div
            style={{
              padding: isMobile ? '10px' : '14px',
              paddingBottom: isMobile ? '60px' : '70px',
            }}
          >
            <h3
              style={{
                fontSize: isMobile ? '12px' : '14px',
                fontWeight: '600',
                color: '#333',
                minHeight: isMobile ? '38px' : '44px',
                marginBottom: '8px',
                overflow: 'hidden',
                lineHeight: '1.4em',
              }}
            >
              {truncateName(product.name || "")}
            </h3>

            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span
                style={{
                  fontWeight: 'bold',
                  color: '#ff6b00',
                  fontSize: isMobile ? '12px' : '14px',
                }}
              >
                AED {product.sale_price || product.price}
              </span>

              {product.regular_price && (
                <span
                  style={{
                    textDecoration: 'line-through',
                    color: '#999',
                    fontSize: isMobile ? '10px' : '12px',
                  }}
                >
                  AED {product.regular_price}
                </span>
              )}
            </div>

            <div
              style={{
                fontSize: isMobile ? '10px' : '12px',
                color: '#666',
                marginTop: '5px',
              }}
            >
              ⭐ {product.rating || 0} ({product.reviews || 0}) • Sold{" "}
              {product.sold || 0}
            </div>
          </div>

          {/* 🔸 BOTTOM ACTION */}
          <div
            style={{
              position: 'absolute',
              bottom: '10px',
              left: '10px',
              right: '10px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                background: '#ffcc00',
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: isMobile ? '9px' : '11px',
                fontWeight: 'bold',
                color: '#000',
              }}
            >
              Fast Delivery
            </div>

            <div
              onClick={(e) => {
                e.stopPropagation();
                navigate(product.path);
              }}
              style={{
                background: '#ff6b00',
                color: '#fff',
                padding: '6px 10px',
                borderRadius: '8px',
                fontSize: isMobile ? '10px' : '12px',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              Buy Now
            </div>
          </div>
        </div>
      );
    })}

    {/* 🔹 Loading More Skeletons */}
    {loading &&
      Array.from({ length: loadingSkeletonCount }).map((_, index) => (
        <SkeletonCard key={`load-${index}`} isMobile={isMobile} />
      ))}
  </>
)}
      </div>
      <div style={{ textAlign: "center", marginTop: "20px" }}>
  {hasMore && (
    <button
      onClick={fetchProducts}
      disabled={loading}
      style={{
        padding: "10px 20px",
        background: "#ff6b00",
        color: "#fff",
        border: "none",
        borderRadius: "8px",
        cursor: loading ? "not-allowed" : "pointer",
        opacity: loading ? 0.7 : 1,
        fontWeight: "bold"
      }}
    >
      {loading ? "Loading..." : "Load More"}
    </button>
  )}
</div>
    </div>
    
  );
};

export default Fastdelivery;

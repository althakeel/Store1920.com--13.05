import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Slider from "react-slick";
import { getAllBrands } from "../api/woocommerce";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "../assets/styles/BrandsCarousel.css";

const BrandsCarousel = ({ brands: propBrands }) => {
  const navigate = useNavigate();
  const [brands, setBrands] = useState(propBrands || []);
  const [loading, setLoading] = useState(!propBrands || propBrands.length === 0);

  // Fetch brands from API if not provided
  useEffect(() => {
    const loadBrands = async () => {
      if (propBrands && propBrands.length > 0) {
        setBrands(propBrands);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const fetchedBrands = await getAllBrands();
        if (fetchedBrands && fetchedBrands.length > 0) {
          setBrands(fetchedBrands);
          console.log("✅ Loaded", fetchedBrands.length, "brands from API");
        } else {
          console.warn("⚠️ No brands returned from API");
          setBrands([]);
        }
      } catch (error) {
        console.error("❌ Error fetching brands:", error);
        setBrands([]);
      } finally {
        setLoading(false);
      }
    };

    loadBrands();
  }, [propBrands]);

  const handleBrandClick = (brand) => {
    navigate(`/brand/${brand.slug}`);
    window.scrollTo(0, 0);
  };

  const sliderSettings = {
    dots: false,
    infinite: brands.length > 4,
    speed: 500,
    slidesToShow: Math.min(4, Math.max(1, brands.length)),
    slidesToScroll: 1,
    autoplay: brands.length > 4,
    autoplaySpeed: 3000,
    arrows: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: Math.min(3, Math.max(1, brands.length)),
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: Math.min(2, Math.max(1, brands.length)),
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  return (
    <div className="brands-carousel-wrapper">
      <h2 className="brands-carousel-title">Featured Brands</h2>
      
      {loading ? (
        <div className="brands-carousel-container brands-loading-list">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="brand-card brand-skeleton">
              <div className="brand-logo-wrapper" style={{ background: "#eee" }} />
              <div className="brand-name" style={{ background: "#eee", height: "12px", borderRadius: "4px" }} />
            </div>
          ))}
        </div>
      ) : brands && brands.length > 0 ? (
        <div className="brands-carousel-container">
          <Slider {...sliderSettings} className="brands-carousel-slider">
            {brands.map((brand) => (
              <div key={brand.id} className="brand-slide-wrap">
                <div
                  className="brand-card"
                  onClick={() => handleBrandClick(brand)}
                  title={brand.name}
                >
                  <div className="brand-logo-wrapper">
                    <img
                      src={brand.logo || "https://via.placeholder.com/150x100?text=" + encodeURIComponent(brand.name)}
                      alt={brand.name}
                      className="brand-logo"
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/150x100?text=" + encodeURIComponent(brand.name);
                      }}
                    />
                  </div>
                  <p className="brand-name">{brand.name}</p>
                </div>
              </div>
            ))}
          </Slider>
        </div>
      ) : (
        <div style={{ padding: "20px", textAlign: "center", color: "#999", fontSize: "14px" }}>
          No brands available
        </div>
      )}
    </div>
  );
};

export default BrandsCarousel;

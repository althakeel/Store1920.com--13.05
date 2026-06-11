import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

// Components
import MainBanner from '../components/MainBanner';
import Whychoose from '../components/sub/home/whychoose';
import WhychooseMobile from '../components/sub/home/whychoosemobile';
import CategorySlider from '../components/sub/home/categoryslider';
import ProductCategory from '../components/sub/home/productcategory';
import LightningBanner from '../components/sub/home/LightningBanner';
import LightningBannerMobile from '../components/Mobile/mobileLightningdeals';
import CourierBanner from '../components/sub/home/CourierBanner';
import Shippingmobile from '../components/Mobile/shipping';
import MobileCategoriesSlider from '../components/Mobile/MobileCategorySlider';
import MobileCourierBanner from '../components/Mobile/MobileCourierBanner';
import GridAds from '../components/sub/home/gridcategories'

const Home = ({ setNavbarColor }) => {
  const { currentTheme } = useTheme();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [banners, setBanners] = useState([]);

  // --- 1. Update isMobile flag on resize ---
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- 2. Update navbar color & set static banners whenever theme changes ---
  useEffect(() => {
    if (!currentTheme) return;

    // Update navbar color
    setNavbarColor?.(currentTheme.navbarBg);

    const bannerImages = currentTheme.bannerKeys || [currentTheme.bannerKey];
    const staticBanners = bannerImages.filter(Boolean).map((bannerImage, index) => ({
      id: index + 1,
      url: bannerImage,
      mobileUrl: bannerImage,
      bgColor: currentTheme.bannerBg,
      link: index === 1 ? '/fast-delivery' : currentTheme.link,
      category: null
    }));

    setBanners(staticBanners);
  }, [currentTheme, setNavbarColor]);

  // --- 3. Render UI ---
  return (
    <div style={{ width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>
      {/* Main Banner */}
      <MainBanner banners={banners} themeLink={currentTheme.link}  bannerKey={currentTheme?.bannerKey} />

      {/* Conditional mobile/desktop sections */}
      {isMobile ? <Shippingmobile /> : <Whychoose />}
            <GridAds/>
      {isMobile ? <LightningBannerMobile /> : <LightningBanner />}
      {isMobile ? <MobileCategoriesSlider /> : <CategorySlider />}
      {isMobile ? <MobileCourierBanner /> : <CourierBanner />}

      {/* Product categories */}
      <ProductCategory />
    </div>
  );
};

export default Home;

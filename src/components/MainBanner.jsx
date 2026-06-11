import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/styles/MainBanner.css';

const preloadImage = (src) =>
  new Promise((resolve) => {
    if (!src) {
      resolve();
      return;
    }

    const img = new Image();

    const finish = () => {
      if (typeof img.decode === 'function') {
        img.decode().catch(() => {}).finally(resolve);
        return;
      }

      resolve();
    };

    img.onload = finish;
    img.onerror = resolve;
    img.src = src;

    if (img.complete) {
      finish();
    }
  });

const MainBanner = ({ banners = [], themeLink, onBannerClick }) => {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const [currentBanner, setCurrentBanner] = useState(null);
  const [previousBanner, setPreviousBanner] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const currentBannerRef = useRef(null);

  useEffect(() => {
    currentBannerRef.current = currentBanner;
  }, [currentBanner]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!banners || banners.length === 0) {
      setActiveIndex(0);
      return;
    }

    if (activeIndex >= banners.length) {
      setActiveIndex(0);
    }
  }, [activeIndex, banners]);

  useEffect(() => {
    if (!banners || banners.length <= 1) return;

    const timer = setInterval(() => {
      setActiveIndex((index) => (index + 1) % banners.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [banners]);

  useEffect(() => {
    if (!banners || banners.length === 0) {
      setCurrentBanner(null);
      setPreviousBanner(null);
      setIsTransitioning(false);
      return;
    }

    const nextBanner = banners[activeIndex] || banners[0];
    const resolvedUrl = isMobile ? nextBanner.mobileUrl || nextBanner.url : nextBanner.url;
    const bannerToShow = { ...nextBanner, resolvedUrl };
    const current = currentBannerRef.current;

    if (
      current &&
      current.resolvedUrl === bannerToShow.resolvedUrl &&
      current.bgColor === bannerToShow.bgColor &&
      current.link === bannerToShow.link
    ) {
      return;
    }

    let isCancelled = false;

    const loadNextBanner = async () => {
      await preloadImage(resolvedUrl);

      if (isCancelled) return;

      const previous = currentBannerRef.current;
      setPreviousBanner(previous);
      setCurrentBanner(bannerToShow);
      setIsTransitioning(Boolean(previous));
    };

    loadNextBanner();

    return () => {
      isCancelled = true;
    };
  }, [activeIndex, banners, isMobile]);

  useEffect(() => {
    if (!isTransitioning) return;

    const timer = setTimeout(() => {
      setPreviousBanner(null);
      setIsTransitioning(false);
    }, 450);

    return () => clearTimeout(timer);
  }, [isTransitioning]);

  const handleClick = () => {
    if (typeof onBannerClick === 'function') {
      onBannerClick(currentBanner);
      return;
    }

    const targetLink = currentBanner?.link || themeLink || '/products/mansory-special-edition-scooter-sm10';

    if (/^https?:\/\//i.test(targetLink)) {
      window.location.href = targetLink;
      return;
    }

    navigate(targetLink);
  };

  const handleDotClick = (event, index) => {
    event.stopPropagation();
    setActiveIndex(index);
  };

  if (!currentBanner) {
    return null;
  }

  return (
    <div
      className="banner-wrap"
      role="region"
      aria-label="Homepage Banner"
      style={{
        backgroundColor: currentBanner.bgColor || 'transparent',
        cursor: typeof onBannerClick === 'function' ? 'default' : 'pointer',
      }}
      onClick={handleClick}
    >
      <div className="banner-inner">
        {previousBanner && (
          <img
            src={previousBanner.resolvedUrl}
            alt="Previous Main Banner"
            className={`banner-image banner-image-previous ${isTransitioning ? 'is-leaving' : ''}`}
            loading="eager"
            fetchPriority="high"
            decoding="sync"
          />
        )}
        <img
          src={currentBanner.resolvedUrl}
          alt="Main Banner"
          className={`banner-image banner-image-current ${isTransitioning ? 'is-entering' : 'is-visible'}`}
          loading="eager"
          fetchPriority="high"
          decoding="sync"
        />
        {banners.length > 1 && (
          <div className="banner-dots" aria-label="Banner slides">
            {banners.map((banner, index) => (
              <button
                key={banner.id || banner.url || index}
                type="button"
                className={`dot ${index === activeIndex ? 'active' : ''}`}
                aria-label={`Show banner ${index + 1}`}
                aria-current={index === activeIndex ? 'true' : undefined}
                onClick={(event) => handleDotClick(event, index)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MainBanner;

import React, { useEffect, useRef, useState } from 'react';
import { trackPageView } from '../utils/gtmTracking';

// Inject Montserrat font
const injectFont = () => {
  if (!document.getElementById('montserrat-font')) {
    const link = document.createElement('link');
    link.id = 'montserrat-font';
    link.href =
      'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }
};

const sections = [
  {
    id: 'eligibility',
    title: '1. Return Window & Eligibility',
    content: (
      <>
        <p>
          Almost all items purchased on Store1920 are eligible for return within <strong>7 days</strong> from the date of purchase for a full refund. 
          There are exceptions for health, safety, or hygiene reasons:
        </p>
        <ul>
          <li>Used or damaged personal items (e.g., worn clothing, lingerie without tags/seals).</li>
          <li>Perishable or personal care items (food, groceries, opened cosmetics/skincare, sanitary products).</li>
          <li>Custom or made-to-order products (e.g., engraved items).</li>
          <li>Underwear & swimwear (if hygiene liners are removed).</li>
          <li>Free gifts or promotional items.</li>
        </ul>
        <p>
          <strong>Electronics:</strong> Most electronics have a 90-day window, though some may be shorter (45–60 days). 
          Electronics also come with manufacturer warranties and consumer law protection.
        </p>
      </>
    ),
  },
  {
  id: 'how-to-return',
  title: '2. How to Initiate a Return',
  content: (
    <>
      <ol>
        <li>
          Log in to your Store1920 account, go to <strong>“Your Orders”</strong>, and click <strong>“Return/Refund”</strong>.
        </li>
        <li>
          If you checked out as a guest, use the return link provided in your order confirmation email.
        </li>
        <li>
          Select the item(s) you wish to return and choose the reason for the return. 
          <strong> Upload a photo or video showing:</strong> the item's condition, original packaging, all accessories, and proof that everything delivered is being returned.
        </li>
        <li>
          <strong>Verify Item Condition:</strong> Ensure the item is in its original condition with all accessories, packaging, and any other components received.
        </li>
        <li>
          Pack the item securely with all original components, attach the return label, and drop it off with the courier or at an authorized drop-off point.
        </li>
      </ol>
      <p>
        <strong>Important:</strong> To be eligible for a full refund, returns must include all delivered items and accessories in their original condition.
      </p>
    </>
  ),
}
,
  {
    id: 'shipping',
    title: '3. Return Shipping Costs',
    content: (
      <>
        <p>
          The first return per order is <strong>free</strong>. If you return additional items later from the same order, 
          a return shipping fee may be deducted from your refund.
        </p>
        <p>
          Oversized/heavy items or remote locations may require special arrangements. 
          If you pay for return shipping due to our or seller’s fault, we reimburse reasonable costs.
        </p>
      </>
    ),
  },
  {
    id: 'refund-process',
    title: '4. Refund Process & Methods',
    content: (
      <>
        <p>Once your return arrives and passes inspection, refunds are processed as follows:</p>
        <ul>
          <li><strong>Original Payment Method:</strong> 7–14 business days (up to 30 for some banks).</li>
          <li><strong>Cash on Delivery:</strong> Refunded via bank transfer or Store1920 credits.</li>
          <li><strong>Store1920 Credits:</strong> Instant after check-in (can be used for future orders).</li>
        </ul>
        <p>
          In some cases, we may issue an <strong>Instant/Advanced Refund</strong> before the return arrives, 
          especially for loyal customers or obvious defects.
        </p>
      </>
    ),
  },
  {
    id: 'refund-amounts',
    title: '5. Refund Amounts',
    content: (
      <>
        <p>
          If the return is due to our/seller’s fault (wrong/defective item), you’ll receive a full refund including shipping.  
          If due to buyer’s remorse, original shipping fees may not be refunded.
        </p>
        <p>
          Items returned used/damaged beyond normal inspection may be refunded partially.  
          We assess fairly and notify you if a deduction applies.
        </p>
      </>
    ),
  },
  {
    id: 'non-delivery',
    title: '6. Non-Delivery & Missing Items',
    content: (
      <>
        <p>
          If your order shows “delivered” but you didn’t receive it, or if items are missing from the package, 
          contact us. We’ll investigate and either resend or refund after verification.
        </p>
      </>
    ),
  },
  {
    id: 'exchange',
    title: '7. Exchange Policy',
    content: (
      <>
        <p>
          Currently, exchanges are processed as return-and-reorder.  
          Return the item for a refund, then place a new order for the size/color you want.
        </p>
      </>
    ),
  },
  {
    id: 'mobile-devices',
    title: '8. Used Mobile Devices Not Eligible for Returns',
    content: (
      <>
        <p>
          <strong>Used mobile devices are not eligible for returns.</strong>
        </p>
        <p>
          Mobile devices, including smartphones, tablets, and related accessories, are excluded from our standard return policy if they have been used. 
          This includes devices that show any signs of use, even minor ones such as:
        </p>
        <br />
        <ul>
          <li>Screen usage or activation of the device</li>
          <li>Removal of protective seals or packaging</li>
          <li>Any software installation or updates</li>
          <li>Connection to any network or service</li>
          <li>Physical wear or cosmetic changes</li>
        </ul>
        <p>
          <strong>Exception:</strong> If a mobile device is defective, damaged by our/seller's fault, or arrives dead/non-functional, 
          it may still qualify for a replacement or refund under our defective product warranty. In such cases, contact our support team immediately with proof of the defect.
        </p>
        <p>
          <strong>Manufacturer Warranty:</strong> Mobile devices come with manufacturer warranties that cover manufacturing defects and are valid for the warranty period stated by the manufacturer. 
          Please refer to the manufacturer's warranty for coverage details.
        </p>
      </>
    ),
  },
  {
    id: 'important-notices',
    title: '9. Important Notices',
    content: (
      <>
        <ul>
          <li><strong>Original Condition Required:</strong> All returned items must be in original condition with original packaging and all delivered accessories included.</li>
          <li>Always use the return label provided — not the manufacturer/original sender's address.</li>
          <li>Do not include unrelated/personal items in your return package.</li>
          <li>Ensure all items delivered in the original order are included in the return package to avoid refund deductions.</li>
          <li>Contact support if you face issues; we can assist or liaise with sellers.</li>
          <li>Policy abuse (excessive returns of used items) may result in refusal or restocking fees.</li>
        </ul>
      </>
    ),
  },
];


// CSS styles for hiding scrollbar on Webkit and Firefox
const hideScrollbar = {
  scrollbarWidth: 'none', // Firefox
  msOverflowStyle: 'none', // IE 10+
};

const hideScrollbarWebkit = {
  '&::-webkit-scrollbar': {
    display: 'none', // Safari and Chrome
  },
};

const styles = {
  layout: {
    display: 'flex',
    fontFamily: "'Montserrat', sans-serif",
    maxWidth: '1400px',
    margin: '0 auto',
    height: '100vh',
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  sidebar: {
    width: '280px',
    padding: '40px 25px',
    borderRight: '1px solid #eee',
    position: 'sticky',
    top: 0,
    height: '100vh',
    overflowY: 'auto',
    ...hideScrollbar,
    // To hide scrollbars on Webkit browsers (Chrome, Safari)
    scrollbarWidth: 'none',
  },
  sidebarItem: (active) => ({
    padding: '14px 0',
    cursor: 'pointer',
    borderLeft: active ? '4px solid #FF6600' : '4px solid transparent',
    paddingLeft: '14px',
    fontWeight: active ? '600' : '500',
    color: active ? '#FF6600' : '#333',
    fontSize: '15px',
    transition: 'all 0.3s ease',
    userSelect: 'none',
  }),
  contentWrapper: {
    flex: 1,
    padding: '40px 60px',
    overflowY: 'auto',
    scrollBehavior: 'smooth',
    ...hideScrollbar,
  },
  section: {
    marginBottom: '80px',
    scrollMarginTop: '100px',
  },
  heading: {
    fontSize: '22px',
    fontWeight: '600',
    marginBottom: '16px',
    color: '#222',
  },
  text: {
    fontSize: '15px',
    lineHeight: 1.7,
    color: '#444',
  },
};

// Mobile overrides for inline styles (ensures they win over desktop inline styles)
const mobileStyles = {
  layout: {
    display: 'block',
    height: 'auto',
    overflow: 'visible',
  },
  sidebar: {
    position: 'sticky',
    top: 0,
    width: '100%',
    height: 'auto',
    borderRight: 'none',
    borderBottom: '1px solid #eee',
    padding: '12px 16px',
    background: '#fff',
    zIndex: 2,
    overflowX: 'auto',
    whiteSpace: 'nowrap',
  },
  item: {
    display: 'inline-block',
    marginRight: 16,
    borderLeft: 'none',
    paddingLeft: 0,
    fontSize: '14px',
  },
  content: {
    padding: '16px',
    height: 'auto',
    overflow: 'visible',
  },
  heading: { fontSize: '18px' },
  text: { fontSize: '14px' },
};

const ReturnPolicyPage = () => {
  const [activeSection, setActiveSection] = useState(sections[0].id);
  const contentRef = useRef(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Track page view on component mount
  useEffect(() => {
    trackPageView('Return & Refund Policy', window.location.href);
  }, []);

  useEffect(() => {
    // handle responsive breakpoint
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);

    injectFont();

    // For desktop/tablet we observe inside the scrolling container; on mobile we observe viewport
    if (!isMobile && !contentRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        root: isMobile ? null : contentRef.current,
        rootMargin: '-50px 0px -60% 0px',
        threshold: 0.1,
      }
    );

    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, [isMobile]);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (!el) return;

    if (isMobile) {
      // Let the window scroll on mobile; rely on section scroll-margin-top for offset
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (contentRef.current) {
      contentRef.current.scrollTo({ top: el.offsetTop - 20, behavior: 'smooth' });
    }
    // Immediately highlight in sidebar
    setActiveSection(id);
  };


  return (
    <div style={{ ...styles.layout, ...(isMobile ? mobileStyles.layout : {}) }} className="rp-layout">
      {/* Sidebar */}
      <aside
        style={{
          ...styles.sidebar,
          ...(isMobile ? mobileStyles.sidebar : {}),
          // Hide scrollbar on Webkit browsers by inline style trick:
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
        className="hide-scrollbar rp-sidebar"
      >
        {sections.map(({ id, title }) => (
          <div
            key={id}
            onClick={() => scrollToSection(id)}
            style={{
              ...styles.sidebarItem(activeSection === id),
              ...(isMobile ? mobileStyles.item : {}),
            }}
            className="rp-item"
          >
            {title}
          </div>
        ))}
      </aside>

      {/* Content */}
      <main
        style={{
          ...styles.contentWrapper,
          ...(isMobile ? mobileStyles.content : {}),
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
        ref={contentRef}
        className="hide-scrollbar rp-content"
      >
      <p style={{ ...styles.text, ...(isMobile ? mobileStyles.text : {}), fontWeight: 600, marginTop: 0, marginBottom: 28 }}>
        Last updated: April 6, 2026
      </p>
      {sections.map(({ id, title, content }) => (
  <section key={id} id={id} style={styles.section}>
    <h2
      style={{
        ...styles.heading,
        ...(isMobile ? mobileStyles.heading : {}),
        textDecoration: activeSection === id ? 'underline' : 'none',
        textDecorationColor: '#FF6600',
        textDecorationThickness: '2px',
      }}
      className="rp-heading"
    >
      {title}
    </h2>
    <div style={{ ...styles.text, ...(isMobile ? mobileStyles.text : {}) }} className="rp-text">{content}</div>
  </section>
))}
      </main>

      {/* Inline style to hide scrollbars on Webkit browsers */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
          width: 0 !important;
          height: 0 !important;
        }

        /* Responsive layout for mobile */
        @media (max-width: 768px) {
          .rp-layout {
            display: block;
            height: auto;
            overflow: visible;
          }
          .rp-sidebar {
            position: sticky;
            top: 0;
            width: 100%;
            height: auto;
            border-right: none;
            border-bottom: 1px solid #eee;
            padding: 12px 16px;
            background: #fff;
            z-index: 2;
            overflow-x: auto;
            white-space: nowrap;
          }
          .rp-sidebar .rp-item {
            display: inline-block;
            margin-right: 16px;
            border-left: none !important;
            padding-left: 0 !important;
            font-size: 14px;
          }
          .rp-content {
            padding: 16px;
            height: auto;
            overflow: visible;
          }
          .rp-heading { font-size: 18px; }
          .rp-text { font-size: 14px; }
        }
      `}</style>
    </div>
  );
};

export default ReturnPolicyPage;

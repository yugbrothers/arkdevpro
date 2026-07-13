import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const GA_MEASUREMENT_ID = import.meta.env.NEXT_PUBLIC_GA_ID;

export default function GoogleAnalytics() {
  const location = useLocation();

  useEffect(() => {
    // Only run in production
    if (!import.meta.env.PROD) return;

    if (!GA_MEASUREMENT_ID) {
      console.warn('Google Analytics Measurement ID is missing.');
      return;
    }

    // Check if script is already loaded
    if (!window.gtag) {
      const script = document.createElement('script');
      script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
      script.async = true;
      document.head.appendChild(script);

      window.dataLayer = window.dataLayer || [];
      window.gtag = function () {
        window.dataLayer.push(arguments);
      };
      window.gtag('js', new Date());
      window.gtag('config', GA_MEASUREMENT_ID, {
        send_page_view: false // Disable default page_view since we send it manually below
      });
    }
  }, []);

  // Track virtual page views on route changes
  useEffect(() => {
    if (!import.meta.env.PROD) return;
    if (window.gtag && GA_MEASUREMENT_ID) {
      window.gtag('event', 'page_view', {
        page_path: location.pathname + location.search,
        page_title: document.title
      });
    }
  }, [location]);

  return null;
}

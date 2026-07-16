import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const GA_MEASUREMENT_ID = import.meta.env.NEXT_PUBLIC_GA_ID || 'G-0DBMV6BXEK';

export default function GoogleAnalytics() {
  const location = useLocation();

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

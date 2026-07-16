import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const GA_MEASUREMENT_ID = import.meta.env.NEXT_PUBLIC_GA_ID || import.meta.env.VITE_GA_ID || 'G-0DBMV6BXEK';

export default function GoogleAnalytics() {
  const location = useLocation();

  // Inject Google Tag Manager script dynamically on mount
  useEffect(() => {
    if (!GA_MEASUREMENT_ID) return;

    // Check if the script is already added
    const scriptId = 'google-analytics-script';
    let script = document.getElementById(scriptId);

    if (!script) {
      // Create external gtag script tag
      script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
      script.async = true;
      document.head.appendChild(script);

      // Create inline config script
      const configScript = document.createElement('script');
      configScript.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        window.gtag = gtag;
        gtag('js', new Date());
        gtag('config', '${GA_MEASUREMENT_ID}', { page_path: '${window.location.pathname}' });
      `;
      document.head.appendChild(configScript);
    }
  }, []);

  // Track virtual page views on route changes
  useEffect(() => {
    if (window.gtag && GA_MEASUREMENT_ID) {
      window.gtag('event', 'page_view', {
        page_path: location.pathname + location.search,
        page_title: document.title
      });
    }
  }, [location]);

  return null;
}

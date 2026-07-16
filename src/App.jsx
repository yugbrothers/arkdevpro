import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { NuqsAdapter } from 'nuqs/adapters/react-router/v6';
import Providers from './components/layout/Providers';
import { useEffect, lazy, Suspense, Component } from 'react';
import { ActiveRouteProvider } from './components/context/ActiveRouteContext/ActiveRouteContext';
import { forceChakraDarkTheme } from './utils/utils';
import GoogleAnalytics from './components/GoogleAnalytics';

import AnnouncementModal from './components/common/AnnouncementModal/AnnouncementModal';
import SidebarLayout from './components/layout/SidebarLayout';

class GlobalErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('GlobalErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', background: '#0b0f19', color: '#ef4444', minHeight: '100vh', fontFamily: 'monospace' }}>
          <h2>Application Error</h2>
          <p>The application encountered an uncaught rendering error during navigation:</p>
          <pre style={{ background: '#1e293b', padding: '16px', borderRadius: '4px', color: '#f87171', overflowX: 'auto', marginBottom: '12px' }}>
            {this.state.error?.toString()}
          </pre>
          <h3>React Component Stack:</h3>
          <pre style={{ background: '#1e293b', padding: '16px', borderRadius: '4px', color: '#cbd5e1', overflowX: 'auto', maxHeight: '200px', marginBottom: '12px' }}>
            {this.state.errorInfo?.componentStack || 'No component stack trace available'}
          </pre>
          <h3>JS Call Stack:</h3>
          <pre style={{ background: '#1e293b', padding: '16px', borderRadius: '4px', color: '#94a3b8', overflowX: 'auto', maxHeight: '200px', marginBottom: '16px' }}>
            {this.state.error?.stack}
          </pre>
          <button 
            onClick={() => window.location.reload()} 
            style={{ 
              padding: '10px 20px', 
              background: '#3b82f6', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Helper to retry dynamic imports when chunk files change in production build (avoiding blank page)
const lazyRetry = (componentImport) => {
  return lazy(async () => {
    try {
      return await componentImport();
    } catch (error) {
      console.error("Chunk load failed, forcing page reload...", error);
      window.location.reload();
      return new Promise(() => {}); // keeps suspense active while page reloads
    }
  });
};

const LandingPage = lazyRetry(() => import('./pages/LandingPage'));
const CategoryPage = lazyRetry(() => import('./pages/CategoryPage'));
const ShowcasePage = lazyRetry(() => import('./pages/ShowcasePage'));
const FavoritesPage = lazyRetry(() => import('./pages/FavoritesPage'));
const SponsorsPage = lazyRetry(() => import('./pages/SponsorsPage'));
const ToolsPage = lazyRetry(() => import('./pages/ToolsPage'));
const AuthPage = lazyRetry(() => import('./pages/AuthPage'));
const ProfilePage = lazyRetry(() => import('./pages/ProfilePage'));
const PricingPage = lazyRetry(() => import('./pages/PricingPage'));
const CheckoutPage = lazyRetry(() => import('./pages/CheckoutPage'));
const AdminDashboard = lazyRetry(() => import('./pages/AdminDashboard'));

function AppContent() {
  return (
    <>
      <Providers>
        <GlobalErrorBoundary>
          <Suspense fallback={<div style={{ background: '#0b0f19', minHeight: '100vh' }} />}>
          <Routes>
            <Route exact path="/" element={<LandingPage />} />
            <Route exact path="/showcase" element={<ShowcasePage />} />
            <Route exact path="/sponsors" element={<SponsorsPage />} />
            <Route exact path="/signin" element={<AuthPage />} />
            <Route exact path="/profile" element={<ProfilePage />} />
            <Route exact path="/pricing" element={<PricingPage />} />
            <Route exact path="/checkout/:plan" element={<CheckoutPage />} />
            <Route exact path="/admin" element={<AdminDashboard />} />
            <Route path="/tools/:toolId?" element={<ToolsPage />} />
            <Route
              path="/:category/:subcategory"
              element={
                <SidebarLayout>
                  <CategoryPage />
                </SidebarLayout>
              }
            />

            <Route
              path="/favorites"
              element={
                <SidebarLayout>
                  <FavoritesPage />
                </SidebarLayout>
              }
            />
          </Routes>
        </Suspense>
      </GlobalErrorBoundary>
    </Providers>
    </>
  );
}

export default function App() {
  useEffect(() => {
    forceChakraDarkTheme();
  }, []);

  return (
    <Router>
      <GoogleAnalytics />
      <NuqsAdapter>
        <ActiveRouteProvider>
          <AppContent />
          <AnnouncementModal />
        </ActiveRouteProvider>
      </NuqsAdapter>
    </Router>
  );
}

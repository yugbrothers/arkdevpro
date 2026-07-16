import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { NuqsAdapter } from 'nuqs/adapters/react-router/v6';
import Providers from './components/layout/Providers';
import { useEffect, lazy, Suspense } from 'react';
import { ActiveRouteProvider } from './components/context/ActiveRouteContext/ActiveRouteContext';
import { forceChakraDarkTheme } from './utils/utils';
import GoogleAnalytics from './components/GoogleAnalytics';

import AnnouncementModal from './components/common/AnnouncementModal/AnnouncementModal';
import SidebarLayout from './components/layout/SidebarLayout';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const CategoryPage = lazy(() => import('./pages/CategoryPage'));
const ShowcasePage = lazy(() => import('./pages/ShowcasePage'));
const FavoritesPage = lazy(() => import('./pages/FavoritesPage'));
const SponsorsPage = lazy(() => import('./pages/SponsorsPage'));
const ToolsPage = lazy(() => import('./pages/ToolsPage'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const PricingPage = lazy(() => import('./pages/PricingPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

function AppContent() {
  return (
    <>
      <Providers>
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

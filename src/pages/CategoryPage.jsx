import React, { useEffect, Suspense, lazy } from 'react';
import { useParams } from 'react-router-dom';
import { componentMap } from '../constants/Components';
import { decodeLabel } from '../utils/utils';
import { Box, Text } from '@chakra-ui/react';
import { useTransition } from '../hooks/useTransition';
import BackToTopButton from '../components/common/BackToTopButton';
import { SkeletonLoader, GetStartedLoader } from '../components/common/SkeletonLoader';
import IndexPage from './IndexPage';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
    fetch('/api/debug-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: error?.message || String(error),
        info: errorInfo?.componentStack
      })
    }).catch(() => {});
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box p={8} bg="rgba(239, 68, 68, 0.05)" border="1px solid rgba(239, 68, 68, 0.2)" borderRadius="16px" mt={6} textAlign="center">
          <Text color="#ef4444" fontWeight={700} fontSize="18px" mb={2}>
            Failed to render preview
          </Text>
          <Text color="#94a3b8" fontSize="14px" mb={4}>
            An error occurred while loading this component. This is often due to unsupported WebGL canvas renderers in the local browser shell.
          </Text>
          <button 
            onClick={() => this.setState({ hasError: false })}
            style={{
              background: '#6366f1',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            Retry Preview
          </button>
        </Box>
      );
    }
    return this.props.children;
  }
}

const lazyCache = {};
const getLazyComponent = (subcategory, componentFactory) => {
  if (!subcategory || !componentFactory) return null;
  if (!lazyCache[subcategory]) {
    lazyCache[subcategory] = lazy(async () => {
      try {
        return await componentFactory();
      } catch (error) {
        console.error("Demo component chunk load failed, forcing page reload...", error);
        window.location.reload();
        return new Promise(() => {}); // keep suspense active while page reloads
      }
    });
  }
  return lazyCache[subcategory];
};

const CategoryPage = () => {
  const { category, subcategory } = useParams();
  const { transitionPhase } = useTransition();

  const decodedLabel = decodeLabel(subcategory);
  const isLoading = transitionPhase === 'loading';
  const opacity = ['fade-out', 'loading'].includes(transitionPhase) ? 0 : 1;
  const isGetStartedRoute = category === 'get-started';
  const isIndexPage = subcategory === 'index';

  console.log('CategoryPage rendering:', { subcategory, transitionPhase, opacity, isIndexPage });

  const componentFactory = subcategory && componentMap[subcategory];
  const SubcategoryComponent = getLazyComponent(subcategory, componentFactory);
  const Loader = isGetStartedRoute ? GetStartedLoader : SkeletonLoader;

  useEffect(() => {
    if (transitionPhase !== 'fade-out') {
      try {
        window.scrollTo({ top: 0, behavior: 'auto' });
      } catch {
        window.scrollTo(0, 0);
      }
    }
  }, [subcategory, transitionPhase]);

  useEffect(() => {
    if (decodedLabel) {
      document.title = `ArkDev - ${decodedLabel}`;
    }
  }, [decodedLabel]);

  return (
    <>
      {isIndexPage ? (
        <IndexPage />
      ) : (
        <Box className={`category-page ${isLoading ? 'loading' : ''}`}>
          <Box className="page-transition-fade" style={{ opacity }}>
            {!isGetStartedRoute && <h2 className="sub-category">{decodedLabel}</h2>}

            {SubcategoryComponent ? (
              <ErrorBoundary key={subcategory}>
                <Suspense fallback={<Loader />}>
                  <SubcategoryComponent />
                </Suspense>
              </ErrorBoundary>
            ) : (
              <Box p={6}>
                <Text color="#fff" fontWeight={600} fontSize="18px">
                  Not found
                </Text>
                <Text color="#a6a6a6" fontSize="14px">
                  This section is unavailable.
                </Text>
              </Box>
            )}
          </Box>
          <BackToTopButton />
        </Box>
      )}
    </>
  );
};

export default CategoryPage;

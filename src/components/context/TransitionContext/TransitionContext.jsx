import { createContext, useState, useCallback, useRef } from 'react';

const TransitionContext = createContext();

export const TransitionProvider = ({ children }) => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionPhase, setTransitionPhase] = useState('idle');
  const preloadedComponents = useRef(new Map());
  const isTransitioningRef = useRef(false);

  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

  const preloadComponent = useCallback(async (subcategory, componentMap) => {
    if (!subcategory || preloadedComponents.current.has(subcategory)) {
      return preloadedComponents.current.get(subcategory);
    }

    try {
      const loader = componentMap[subcategory];

      if (loader) {
        const component = await loader();
        preloadedComponents.current.set(subcategory, component);
        return component;
      }
    } catch (error) {
      console.error('Failed to preload component:', error);
    }
    return null;
  }, []);

  const startTransition = useCallback(
    async (targetSubcategory, componentMap, onNavigate) => {
      console.log('TransitionContext: startTransition triggered for', targetSubcategory);
      if (isTransitioningRef.current) {
        console.log('TransitionContext: startTransition ignored because already transitioning');
        return;
      }
      isTransitioningRef.current = true;
      setIsTransitioning(true);

      console.log('TransitionContext: phase set to fade-out');
      setTransitionPhase('fade-out');

      const preloadPromise = preloadComponent(targetSubcategory, componentMap);
      await delay(250);

      console.log('TransitionContext: phase set to loading');
      setTransitionPhase('loading');

      const MAX_PRELOAD_WAIT = 500;
      await Promise.race([preloadPromise, delay(MAX_PRELOAD_WAIT)]);

      console.log('TransitionContext: triggering onNavigate()');
      onNavigate();

      console.log('TransitionContext: phase set to fade-in');
      setTransitionPhase('fade-in');
      await delay(250);

      console.log('TransitionContext: phase set to idle');
      setTransitionPhase('idle');
      setIsTransitioning(false);
      isTransitioningRef.current = false;
    },
    [preloadComponent]
  );

  const value = {
    isTransitioning,
    transitionPhase,
    startTransition,
    preloadComponent,
    clearPreloadedComponents: useCallback(() => preloadedComponents.current.clear(), []),
    getPreloadedComponent: useCallback(subcategory => preloadedComponents.current.get(subcategory), [])
  };

  return <TransitionContext.Provider value={value}>{children}</TransitionContext.Provider>;
};

export { TransitionContext };

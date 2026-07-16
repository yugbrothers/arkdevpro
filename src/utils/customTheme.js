import { createSystem, defaultConfig, defineSlotRecipe } from '@chakra-ui/react';

const drawerRecipe = defineSlotRecipe({
  className: 'drawer',
  slots: ['content'],
  base: {
    content: {
      w: '100vw',
      h: '100vh'
    }
  }
});

const tabsRecipe = defineSlotRecipe({
  className: 'tabs',
  slots: ['trigger'],
  base: {
    trigger: {
      flex: '0 0 auto',
      bg: '#121212',
      borderRadius: '6px',
      fontSize: '13px',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      h: 8,
      px: '0.75rem',
      transition: 'all .2s ease-in-out',

      _hover: { bg: 'rgba(255, 255, 255, 0.05)' },

      "&[data-state='active']": {
        color: '#ffffff',
        bg: '#6366f1',
        borderColor: '#6366f1'
      }
    }
  }
});

export const toastStyles = {
  style: {
    fontSize: '12px',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    color: '#fff',
    backgroundColor: '#121212',
    textAlign: 'center',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)'
  }
};

export const customTheme = createSystem(defaultConfig, {
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false
  },

  styles: {
    global: {
      'html, body': {
        minHeight: '100vh',
        fontFamily: 'var(--font-sans)',
        backgroundColor: '#000000'
      }
    }
  },

  components: {
    Slider: {
      baseStyle: {
        thumb: { bg: '#fff', _focus: { boxShadow: 'none' } }
      },
      variants: {
        solid: {
          track: { bg: 'rgba(255, 255, 255, 0.08)' },
          filledTrack: { bg: '#6366f1' }
        }
      },
      defaultProps: { variant: 'solid' }
    },
    Switch: {
      baseStyle: {
        track: {
          bg: 'rgba(255, 255, 255, 0.08)',
          _checked: { bg: '#6366f1' },
          _focus: { boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.2)' },
          _active: { bg: '#6366f1' }
        },
        thumb: {
          _checked: { bg: 'white' },
          _active: { bg: 'white' }
        }
      }
    }
  },

  recipes: {
    drawer: drawerRecipe,
    tabs: tabsRecipe
  }
});

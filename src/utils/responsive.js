import { useMediaQuery } from '@mui/material';

// Breakpoint values (in px)
export const breakpoints = {
  xs: 0,
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536,
};

// Hook to check if the current viewport matches the breakpoint
export function useResponsive(query, key) {
  const mediaUp = useMediaQuery((theme) => theme.breakpoints.up(key));
  const mediaDown = useMediaQuery((theme) => theme.breakpoints.down(key));
  const mediaOnly = useMediaQuery((theme) => theme.breakpoints.only(key));
  const mediaBetween = (start, end) => {
    return useMediaQuery((theme) => theme.breakpoints.between(start, end));
  };

  if (query === 'up') return mediaUp;
  if (query === 'down') return mediaDown;
  if (query === 'only') return mediaOnly;
  if (query === 'between') return mediaBetween;
  return mediaUp;
}

// Simplified hooks for common scenarios
export function useIsDesktop() {
  return useResponsive('up', 'lg');
}

export function useIsTablet() {
  return useResponsive('between', ['md', 'lg']);
}

export function useIsMobile() {
  return useResponsive('down', 'sm');
} 
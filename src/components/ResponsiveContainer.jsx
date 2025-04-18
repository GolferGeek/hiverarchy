import { Container, Box } from '@mui/material'
import { useIsMobile, useIsTablet } from '../utils/responsive'

/**
 * A responsive container component that adjusts padding and width based on screen size
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 * @param {string} props.maxWidth - Maximum width of container ('xs', 'sm', 'md', 'lg', 'xl')
 * @param {Object} props.sx - Additional MUI sx props
 * @param {boolean} props.disableGutters - Whether to disable default padding
 * @param {boolean} props.fluid - Whether the container should take full width
 * @returns {JSX.Element}
 */
export default function ResponsiveContainer({ 
  children, 
  maxWidth = 'lg', 
  sx = {}, 
  disableGutters = false,
  fluid = false,
  ...props 
}) {
  const isMobile = useIsMobile()
  const isTablet = useIsTablet()
  
  const padding = {
    xs: 2,
    sm: isMobile ? 2 : 3,
    md: isMobile ? 2 : isTablet ? 3 : 4,
    lg: isMobile ? 2 : isTablet ? 3 : 4,
    xl: isMobile ? 2 : isTablet ? 3 : 4,
  }

  return (
    <Container
      maxWidth={fluid ? false : maxWidth}
      disableGutters={disableGutters}
      sx={{
        px: disableGutters ? 0 : padding[maxWidth] || 3,
        width: '100%',
        ...sx
      }}
      {...props}
    >
      {children}
    </Container>
  )
}

/**
 * A responsive grid component for creating flexible layouts
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 * @param {Object} props.sx - Additional MUI sx props
 * @param {number} props.spacing - Grid spacing (1-5)
 * @param {number} props.columns - Number of columns (1-12)
 * @param {string} props.direction - Flex direction ('row', 'column', 'row-reverse', 'column-reverse')
 * @returns {JSX.Element}
 */
export function ResponsiveGrid({
  children,
  spacing = 2,
  columns = 12,
  direction = 'row',
  wrap = 'wrap',
  sx = {},
  ...props
}) {
  const isMobile = useIsMobile()

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : direction,
        flexWrap: wrap,
        gap: spacing,
        width: '100%',
        ...sx
      }}
      {...props}
    >
      {children}
    </Box>
  )
}

/**
 * A responsive grid item component for use within ResponsiveGrid
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 * @param {Object} props.sx - Additional MUI sx props
 * @param {number} props.xs - Column span on extra small screens (1-12)
 * @param {number} props.sm - Column span on small screens (1-12)
 * @param {number} props.md - Column span on medium screens (1-12)
 * @param {number} props.lg - Column span on large screens (1-12)
 * @param {number} props.xl - Column span on extra large screens (1-12)
 * @returns {JSX.Element}
 */
export function ResponsiveGridItem({
  children,
  xs = 12,
  sm,
  md,
  lg,
  xl,
  sx = {},
  ...props
}) {
  const isMobile = useIsMobile()
  const isTablet = useIsTablet()

  // Calculate width based on breakpoints
  const getWidth = () => {
    if (isMobile) return `${(xs / 12) * 100}%`
    if (isTablet) return `${((sm || xs) / 12) * 100}%`
    
    // Desktop and larger
    return {
      xs: `${(xs / 12) * 100}%`,
      sm: sm ? `${(sm / 12) * 100}%` : undefined,
      md: md ? `${(md / 12) * 100}%` : undefined,
      lg: lg ? `${(lg / 12) * 100}%` : undefined,
      xl: xl ? `${(xl / 12) * 100}%` : undefined,
    }
  }

  return (
    <Box
      sx={{
        width: getWidth(),
        ...sx
      }}
      {...props}
    >
      {children}
    </Box>
  )
} 
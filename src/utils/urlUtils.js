import { supabase } from '../lib/supabase'
import { useProfile } from '../contexts/ProfileContext'

const DEFAULT_USERNAME = import.meta.env.VITE_DEFAULT_USERNAME || 'golfergeek'

export const getDomain = () => {
  return window.location.hostname
}

export const getPort = () => {
  return window.location.port
}

export const isHiverarchyDomain = () => {
  const domain = getDomain()
  const port = getPort()
  
  // Consider localhost:4021 as hierarchy.com (for development)
  if (domain === 'localhost' && port === '4021') {
    return true
  }
  
  return domain.includes('hiverarchy.com')
}

export const isUserDomain = () => {
  const domain = getDomain()
  return !isHiverarchyDomain() && !isLocalhost()
}

export const isLocalhost = () => {
  const domain = getDomain()
  const port = getPort()
  
  // Only consider localhost without port 4021 as regular localhost
  // localhost:4021 is treated as hierarchy.com
  return domain === 'localhost' && port !== '4021'
}

export const shouldShowUsernameInUrl = () => {
  // Show username in URL for hiverarchy.com domain and localhost:4021
  return isHiverarchyDomain() || (getDomain() === 'localhost' && getPort() === '4021')
}

export const shouldShowWelcomePage = () => {
  // Only show welcome page on hiverarchy.com domain root path
  // Do not show welcome page on localhost:4021
  const isLocalHierarchy = getDomain() === 'localhost' && getPort() === '4021'
  
  // Never show welcome page on localhost:4021
  if (isLocalHierarchy) {
    return false;
  }
  
  // Only show welcome page on hierarchy.com root path
  return isHiverarchyDomain() && window.location.pathname === '/'
}

export const getEffectiveUsername = async (blogProfile = null) => {
  // First check if we have a blog profile
  if (blogProfile?.username) {
    return blogProfile.username
  }

  // Check if we're on localhost:4021 (hierarchy mode)
  const domain = getDomain()
  const port = getPort()
  const isLocalHierarchy = domain === 'localhost' && port === '4021'
  
  // For regular localhost (not port 4021), use the environment variable
  if (isLocalhost()) {
    return import.meta.env.VITE_DEFAULT_USERNAME || 'golfergeek'
  }

  // For user domains (e.g., golfergeek.com), extract username from domain
  if (isUserDomain()) {
    const domain = getDomain()
    return domain.split('.')[0]
  }

  // For hiverarchy domain, get username from URL if present
  if (isHiverarchyDomain()) {
    const pathParts = window.location.pathname.split('/').filter(Boolean)
    if (pathParts[0]) {
      return pathParts[0]
    }
    
    // Special case for localhost:4021
    if (isLocalHierarchy) {
      // Return null to let the app use the logged-in user's profile
      // instead of defaulting to golfergeek
      return null
    }
  }

  // If all else fails, return default username from env
  // But NOT for localhost:4021
  if (isLocalHierarchy) {
    return null
  }
  
  return import.meta.env.VITE_DEFAULT_USERNAME || 'golfergeek'
}

export const formatPath = (path = '', username = null) => {
  // Remove leading/trailing slashes and filter out empty segments
  const cleanPath = path.split('/').filter(Boolean).join('/')
  
  // If username should not be shown in URL, just return the path
  if (!shouldShowUsernameInUrl()) {
    return `/${cleanPath}`
  }

  // For hierarchy.com and localhost:4021, include username in path
  // Ensure we have a valid username before including it in the path
  if (username) {
    return `/${username}/${cleanPath}`
  }
  
  // If no username is provided but we should show it, 
  // we'll let the app redirect to include username
  return `/${cleanPath}`
}

export const isValidPath = (path) => {
  const parts = path.split('/').filter(Boolean)
  
  // Check if it's a root path that needs redirection
  if (parts.length === 0) {
    return false
  }

  // If we're on hiverarchy domain or localhost:4021, first part should be username
  if (shouldShowUsernameInUrl()) {
    const username = (import.meta.env.VITE_DEFAULT_USERNAME || 'golfergeek')
    // For localhost:4021 this should check against the actual user's username
    // This validation will be handled by getRedirectPath since it needs async access
    // to the user profile info
    return true
  }

  // For non-hiverarchy domains, path should not start with username
  return parts[0] !== (import.meta.env.VITE_DEFAULT_USERNAME || 'golfergeek')
}

export const getRedirectPath = async (currentPath, blogProfile = null) => {
  // Sanitize the input path to remove any query parameters or hash fragments
  // that might cause issues with URL manipulation
  let cleanPath = currentPath;
  if (currentPath.includes('?') || currentPath.includes('#')) {
    cleanPath = currentPath.split(/[?#]/)[0];
    console.log('Sanitized path:', { original: currentPath, cleaned: cleanPath });
  }
  
  // Split the path into its components and filter out empty segments
  const parts = cleanPath.split('/').filter(Boolean);
  const username = await getEffectiveUsername(blogProfile);
  
  console.log('getRedirectPath:', {
    originalPath: currentPath,
    cleanPath,
    parts,
    username,
    isHiverarchyDomain: isHiverarchyDomain(),
    domain: getDomain(),
    port: getPort()
  });
  
  // Early return if we don't have a username but username is required in path
  if (!username && shouldShowUsernameInUrl()) {
    console.log('Early return: Username required but not available');
    return null;
  }
  
  // Never redirect to the same path
  const currentPathClean = '/' + parts.join('/');
  
  // For user domains (e.g., golfergeek.com)
  if (isUserDomain()) {
    // On user domains, username should not be in URL
    if (parts.length === 0) {
      return '/';
    }
    
    // If first part is a username, remove it
    if (parts[0] === username) {
      return '/' + parts.slice(1).join('/');
    }
    
    return null;
  }

  // For hiverarchy domain or localhost:4021
  if (isHiverarchyDomain() || (getDomain() === 'localhost' && getPort() === '4021')) {
    // Root path shows welcome page (handled by shouldShowWelcomePage)
    if (parts.length === 0) {
      // For localhost:4021, redirect to /:username if at root
      if (getDomain() === 'localhost' && getPort() === '4021' && username) {
        return `/${username}`;
      }
      return null;
    }
    
    // CRITICAL CHECK: If the first part is a valid username (any user's profile),
    // allow viewing that profile without redirection
    if (parts.length > 0) {
      try {
        // IMPORTANT: When the first part of the URL is a username different from the logged-in user,
        // we SHOULD NOT redirect as this would prevent cross-profile navigation
        const { data: profileData } = await supabase
          .from('profiles')
          .select('username')
          .eq('username', parts[0])
          .single();
        
        if (profileData) {
          console.log(`Found valid username ${parts[0]} in URL, no redirection needed`);
          
          // If we're viewing another user's profile, never redirect
          if (username && parts[0] !== username) {
            console.log(`Allowing cross-profile navigation to ${parts[0]}`);
            return null;
          }
          
          // If we're on a username path with additional segments, check if those are valid
          if (parts.length > 1) {
            // Check for valid second-level paths like /:username/interest/:interestName
            if (parts[1] === 'interest' && parts.length > 2) {
              return null; // Valid path structure
            }
            
            // Check for valid manage paths like /:username/manage/interests
            if (parts[1] === 'manage' && parts.length > 2) {
              return null; // Valid path structure
            }
            
            // Add more valid path patterns as needed
          }
          
          // If we only have the username, it's a valid path
          return null;
        }
      } catch (error) {
        // Error means the first part is not a valid username
        console.log('First URL part is not a valid username:', parts[0]);
      }
    }
    
    // If we're already on a path with the correct username, don't redirect
    if (username && parts[0] === username) {
      // We're already on a path with the correct username
      return null;
    }
    
    if (username) {
      // Special case for interest pages:
      // Convert /interest/interestName to /username/interest/interestName
      if (parts[0] === 'interest' && parts.length > 1) {
        const redirectPath = `/${username}/interest/${parts[1]}`;
        if (redirectPath === cleanPath) {
          return null; // Already on the correct path
        }
        return redirectPath;
      }
      
      // Special case for manage pages:
      // Convert /manage/x to /username/manage/x
      if (parts[0] === 'manage' && parts.length > 1) {
        const redirectPath = `/${username}/manage/${parts.slice(1).join('/')}`;
        if (redirectPath === cleanPath) {
          return null; // Already on the correct path
        }
        return redirectPath;
      }
      
      // For all other routes, if username is not the first part, add it
      if (parts[0] !== username) {
        const redirectPath = `/${username}/${parts.join('/')}`;
        if (redirectPath === cleanPath) {
          return null; // Already on the correct path
        }
        return redirectPath;
      }
    }
  }
  
  return null;
}

export const removeUsernameFromPath = async (path) => {
  const parts = path.split('/').filter(Boolean)
  if (parts.length > 0) {
    // Remove the username part if it exists
    const { data } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', parts[0])
      .single()
    
    if (data) {
      return '/' + parts.slice(1).join('/')
    }
  }
  return path
}
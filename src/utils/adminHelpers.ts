import { supabase } from '@/lib/supabase';

/**
 * Helper functions for admin operations
 */

export const makeUserAdmin = async (userId: string) => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', userId);

    if (error) throw error;
    
    console.log('User successfully made admin:', userId);
    return true;
  } catch (error) {
    console.error('Error making user admin:', error);
    return false;
  }
};

export const createTestAdmin = async (email: string, password: string) => {
  try {
    // Sign up the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;

    if (authData.user) {
      // Make them admin
      const success = await makeUserAdmin(authData.user.id);
      if (success) {
        console.log('Test admin created successfully:', email);
        return authData.user;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error creating test admin:', error);
    return null;
  }
};

export const getCurrentUserRole = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (error) throw error;
    
    return profile?.role || 'citizen';
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
};

// Development helper - call this in browser console to make current user admin
export const makeCurrentUserAdmin = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log('No user logged in');
      return false;
    }

    const success = await makeUserAdmin(user.id);
    if (success) {
      console.log('Current user is now admin. Please refresh the page.');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error making current user admin:', error);
    return false;
  }
};

// Export for browser console access
if (typeof window !== 'undefined') {
  (window as any).makeCurrentUserAdmin = makeCurrentUserAdmin;
  (window as any).getCurrentUserRole = getCurrentUserRole;
}

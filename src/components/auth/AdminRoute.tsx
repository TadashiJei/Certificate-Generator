import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { supabase } from '../../lib/supabase';

interface AdminRouteProps {
  children: React.ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { session } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!session?.user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        // Check user metadata
        const metadataRole = session.user.user_metadata?.role;
        
        // Check database role
        const { data, error } = await supabase
          .from('auth.users')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
          return;
        }

        console.log('Admin Check:', {
          userId: session.user.id,
          metadataRole,
          databaseRole: data?.role,
        });

        // User is admin if either metadata or database indicates admin role
        const isAdminUser = 
          metadataRole === 'admin' || 
          data?.role === 'admin' ||
          metadataRole === 'super_admin' ||
          data?.role === 'super_admin';

        setIsAdmin(isAdminUser);
      } catch (err) {
        console.error('Error in admin check:', err);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [session]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!session) {
    return <Navigate to="/login" />;
  }

  if (!isAdmin) {
    console.log('Access denied: User is not an admin');
    return <Navigate to="/dashboard" />;
  }

  return <>{children}</>;
}

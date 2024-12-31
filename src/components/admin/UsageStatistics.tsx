import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/Button';

interface UsageMetrics {
  total_users: number;
  active_users: number;
  total_certificates: number;
  certificates_this_month: number;
  storage_used: number;
  active_templates: number;
}

interface UserActivity {
  date: string;
  certificates_generated: number;
  users_active: number;
}

export function UsageStatistics() {
  const [metrics, setMetrics] = useState<UsageMetrics | null>(null);
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      // Fetch overall metrics
      const { data: usersData } = await supabase
        .from('auth.users')
        .select('count');

      const { data: activeUsersData } = await supabase
        .from('auth.users')
        .select('count')
        .eq('account_status', 'active');

      const { data: certificatesData } = await supabase
        .from('certificates')
        .select('count');

      const { data: certificatesThisMonth } = await supabase
        .from('certificates')
        .select('count')
        .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());

      const { data: templatesData } = await supabase
        .from('templates')
        .select('count');

      // Calculate storage used
      const { data: storageData } = await supabase
        .from('usage_statistics')
        .select('metrics->storage_bytes')
        .order('created_at', { ascending: false })
        .limit(1);

      setMetrics({
        total_users: usersData?.[0]?.count || 0,
        active_users: activeUsersData?.[0]?.count || 0,
        total_certificates: certificatesData?.[0]?.count || 0,
        certificates_this_month: certificatesThisMonth?.[0]?.count || 0,
        storage_used: storageData?.[0]?.metrics?.storage_bytes || 0,
        active_templates: templatesData?.[0]?.count || 0,
      });

      // Fetch daily activity for the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: activityData } = await supabase
        .from('activity_logs')
        .select('created_at, action')
        .gte('created_at', thirtyDaysAgo.toISOString());

      // Process activity data into daily statistics
      const dailyStats = new Map<string, UserActivity>();
      
      activityData?.forEach(activity => {
        const date = new Date(activity.created_at).toISOString().split('T')[0];
        const stats = dailyStats.get(date) || {
          date,
          certificates_generated: 0,
          users_active: 0
        };

        if (activity.action === 'generate_certificate') {
          stats.certificates_generated++;
        }
        stats.users_active++;

        dailyStats.set(date, stats);
      });

      setActivities(Array.from(dailyStats.values()));

    } catch (err) {
      console.error('Error fetching statistics:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-600">{error}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Usage Statistics</h1>
        <Button onClick={fetchStatistics}>Refresh</Button>
      </div>

      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">Users</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-2xl font-bold">{metrics.total_users}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Active</p>
                <p className="text-2xl font-bold">{metrics.active_users}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">Certificates</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-2xl font-bold">{metrics.total_certificates}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">This Month</p>
                <p className="text-2xl font-bold">{metrics.certificates_this_month}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">System</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Storage Used</p>
                <p className="text-2xl font-bold">{(metrics.storage_used / (1024 * 1024 * 1024)).toFixed(2)} GB</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Active Templates</p>
                <p className="text-2xl font-bold">{metrics.active_templates}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <h3 className="text-lg font-semibold p-6 bg-gray-50">Daily Activity (Last 30 Days)</h3>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Certificates Generated
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Active Users
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {activities.map((activity) => (
              <tr key={activity.date}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(activity.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {activity.certificates_generated}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {activity.users_active}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

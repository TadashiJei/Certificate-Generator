import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/Button';

interface SystemSetting {
  id: string;
  key: string;
  value: any;
  description: string;
  category: string;
  updated_at: string;
}

export function SystemSettings() {
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .order('category', { ascending: true });

      if (error) throw error;
      setSettings(data || []);
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (id: string, newValue: any) => {
    try {
      const { error } = await supabase
        .from('system_settings')
        .update({ value: newValue })
        .eq('id', id);

      if (error) throw error;
      setEditingId(null);
      await fetchSettings();
    } catch (err) {
      console.error('Error updating setting:', err);
      setError(err instanceof Error ? err.message : 'Failed to update setting');
    }
  };

  const renderSettingValue = (setting: SystemSetting) => {
    if (editingId === setting.id) {
      if (typeof setting.value === 'boolean') {
        return (
          <select
            value={setting.value.toString()}
            onChange={(e) => updateSetting(setting.id, e.target.value === 'true')}
            className="rounded border-gray-300"
          >
            <option value="true">True</option>
            <option value="false">False</option>
          </select>
        );
      }

      if (Array.isArray(setting.value)) {
        return (
          <input
            type="text"
            value={setting.value.join(', ')}
            onChange={(e) => updateSetting(setting.id, e.target.value.split(',').map(s => s.trim()))}
            className="rounded border-gray-300"
          />
        );
      }

      return (
        <input
          type="text"
          value={JSON.stringify(setting.value)}
          onChange={(e) => {
            try {
              const value = JSON.parse(e.target.value);
              updateSetting(setting.id, value);
            } catch (err) {
              // Handle invalid JSON
            }
          }}
          className="rounded border-gray-300"
        />
      );
    }

    return (
      <div onClick={() => setEditingId(setting.id)} className="cursor-pointer">
        {JSON.stringify(setting.value)}
      </div>
    );
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
        <h1 className="text-2xl font-bold">System Settings</h1>
        <Button onClick={fetchSettings}>Refresh</Button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Key
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Value
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Updated
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {settings.map((setting) => (
              <tr key={setting.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {setting.key}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {renderSettingValue(setting)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {setting.description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {setting.category}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(setting.updated_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

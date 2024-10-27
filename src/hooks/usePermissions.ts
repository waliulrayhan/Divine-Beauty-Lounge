import { useState, useEffect } from 'react';

export function usePermissions(feature: 'service' | 'product' | 'stockIn' | 'stockOut') {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const response = await fetch('/api/user/permissions');
        const data = await response.json();
        setPermissions(data.permissions[feature] || []);
      } catch (error) {
        console.error('Error fetching permissions:', error);
        setPermissions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, [feature]);

  const can = (action: 'view' | 'create' | 'edit' | 'delete') => {
    return permissions.includes(action);
  };

  return { can, loading };
}

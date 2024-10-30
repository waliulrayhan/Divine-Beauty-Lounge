import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Box from '@mui/material/Box';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';

interface StockItem {
  id: string;
  brandName: string;
  productName: string;
  serviceName: string;
  totalStockIn: number;
  totalStockOut: number;
  currentStock: number;
}

const CurrentStock: React.FC = () => {
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCurrentStock();
  }, []);

  const fetchCurrentStock = async () => {
    try {
      const response = await fetch('/api/current-stock');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setStockItems(data);
    } catch (error) {
      console.error('Error fetching current stock:', error);
      toast.error('Failed to load current stock');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { field: 'brandName', headerName: 'Brand Name', flex: 1 },
    { field: 'productName', headerName: 'Product', flex: 1 },
    { field: 'serviceName', headerName: 'Service', flex: 1 },
    { field: 'totalStockIn', headerName: 'Total Stock In', flex: 1 },
    { field: 'totalStockOut', headerName: 'Total Stock Out', flex: 1 },
    { 
      field: 'currentStock', 
      headerName: 'Current Stock', 
      flex: 1,
      renderCell: (params: any) => (
        <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium
          ${params.value <= 2 
            ? 'text-red-600' 
            : params.value <= 5
              ? 'text-yellow-600'
              : 'text-green-600'
          }`}>
          {params.value}
        </span>
      )
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-black">Current Stock Overview</h2>
      </div>
      
      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={stockItems}
          columns={columns}
          disableColumnFilter
          disableColumnSelector
          disableDensitySelector
          slots={{ toolbar: GridToolbar }}
          slotProps={{
            toolbar: {
              showQuickFilter: true,
            },
          }}
        />
      </Box>
    </div>
  );
};

export default CurrentStock;

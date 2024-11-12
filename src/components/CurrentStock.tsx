import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Box from "@mui/material/Box";
import { DataGrid, GridToolbar, GridColDef } from "@mui/x-data-grid";

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

  // const fetchCurrentStock = async () => {
  //   try {
  //     const response = await fetch("/api/current-stock");
  //     if (!response.ok) {
  //       throw new Error(`HTTP error! status: ${response.status}`);
  //     }
  //     const data = await response.json();
  //     setStockItems(data);

  //     // Check stock levels and send notifications
  //     data.forEach(async (item: StockItem) => {
  //       if (item.currentStock <= 5) {
  //         // Call the new API route to send notification
  //         const notificationResponse = await fetch('/api/send-notification', {
  //           method: 'POST',
  //           headers: {
  //             'Content-Type': 'application/json',
  //           },
  //           body: JSON.stringify({
  //             productName: item.productName,
  //             currentStock: item.currentStock,
  //           }),
  //         });

  //         if (!notificationResponse.ok) {
  //           toast.error("Failed to send notification");
  //         }
  //       }
  //     });
  //   } catch (error) {
  //     console.error("Error fetching current stock:", error);
  //     toast.error("Failed to load current stock");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const fetchCurrentStock = async () => {
    try {
      const response = await fetch("/api/current-stock");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setStockItems(data);
  
      // Check stock levels and send notifications
      const lastNotificationDate = localStorage.getItem('lastNotificationDate');
      const today = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format
  
      if (lastNotificationDate !== today) {
        data.forEach(async (item: StockItem) => {
          if (item.currentStock <= 5) {
            // Call the new API route to send notification
            const notificationResponse = await fetch('/api/send-notification', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                productName: item.productName,
                currentStock: item.currentStock,
              }),
            });
  
            if (!notificationResponse.ok) {
              toast.error("Failed to send notification");
            }
          }
        });
        // Update the last notification date in local storage
        localStorage.setItem('lastNotificationDate', today);
      }
    } catch (error) {
      console.error("Error fetching current stock:", error);
      toast.error("Failed to load current stock");
    } finally {
      setLoading(false);
    }
  };

  const columns: GridColDef<StockItem>[] = [
    {
      field: "brandName",
      headerName: "Brand Name",
      flex: 1,
      headerClassName: "table-header",
      cellClassName: "table-cell",
      type: "string",
      align: "center",
      headerAlign: "center",
    },
    {
      field: "productName",
      headerName: "Product",
      flex: 1,
      headerClassName: "table-header",
      cellClassName: "table-cell",
      type: "string",
      align: "center",
      headerAlign: "center",
    },
    {
      field: "serviceName",
      headerName: "Product Category",
      flex: 1,
      headerClassName: "table-header",
      cellClassName: "table-cell",
      type: "string",
      align: "center",
      headerAlign: "center",
    },
    {
      field: "totalStockIn",
      headerName: "Total Stock In",
      flex: 1,
      headerClassName: "table-header",
      cellClassName: "table-cell",
      align: "center",
      headerAlign: "center",
      type: "number",
    },
    {
      field: "totalStockOut",
      headerName: "Total Stock Out",
      flex: 1,
      headerClassName: "table-header",
      cellClassName: "table-cell",
      align: "center",
      headerAlign: "center",
      type: "number",
    },
    {
      field: "currentStock",
      headerName: "Current Stock",
      flex: 1,
      headerClassName: "table-header",
      cellClassName: "table-cell",
      align: "center",
      headerAlign: "center",
      type: "number",
      renderCell: (params) => (
        <span
          className={`
          inline-flex items-center justify-center px-4 py-1.5 rounded-full text-sm font-semibold
          ${
            params.value <= 2
              ? "bg-red-100 text-red-700"
              : params.value <= 5
              ? "bg-yellow-100 text-yellow-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {params.value}
        </span>
      ),
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
        <h2 className="text-3xl font-bold text-gray-800 tracking-tight">
          Current Stock Overview
        </h2>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <Box
          sx={{
            height: 600,
            width: "100%",
            "& .table-header": {
              backgroundColor: "#f8fafc",
              color: "#1e293b",
              fontSize: "0.875rem",
              fontWeight: 600,
            },
            "& .table-cell": {
              fontSize: "0.875rem",
              color: "#334155",
            },
            "& .MuiDataGrid-root": {
              border: "none",
            },
            "& .MuiDataGrid-cell": {
              borderBottom: "1px solid #f1f5f9",
            },
            "& .MuiDataGrid-columnHeaders": {
              borderBottom: "2px solid #e2e8f0",
            },
            "& .MuiDataGrid-toolbarContainer": {
              padding: "1rem",
              backgroundColor: "#ffffff",
              borderBottom: "1px solid #f1f5f9",
            },
            "& .MuiButton-root": {
              color: "#475569",
            },
            "& .MuiInputBase-root": {
              backgroundColor: "#f8fafc",
              borderRadius: "0.5rem",
              padding: "0.25rem 0.5rem",
            },
          }}
        >
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
                quickFilterProps: { debounceMs: 500 },
              },
            }}
            sx={{
              "& .MuiDataGrid-row:hover": {
                backgroundColor: "#f8fafc",
              },
            }}
          />
        </Box>
      </div>
    </div>
  );
};

export default CurrentStock;

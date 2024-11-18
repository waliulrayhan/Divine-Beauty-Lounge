"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import Link from "next/link";
import Box from "@mui/material/Box";
import { DataGrid, GridToolbar, GridColDef } from "@mui/x-data-grid";

interface Service {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  serviceId: string;
}

interface Brand {
  id: string;
  name: string;
  productId: string;
}

interface StockIn {
  id: string;
  productId: string;
  productName: string;
  serviceName: string;
  brandId: string;
  brandName: string;
  quantity: number;
  pricePerUnit: number;
  comments: string;
  createdBy: string;
  createdAt: string;
}

interface StockInListProps {
  permissions: string[];
}

const StockInList: React.FC<StockInListProps> = ({ permissions }) => {
  const { data: session } = useSession();
  const [stockIns, setStockIns] = useState<StockIn[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [stockInInputs, setStockInInputs] = useState([
    {
      serviceId: "",
      productId: "",
      brandId: "",
      brandName: "",
      quantity: 0,
      pricePerUnit: 0,
      comments: "",
    },
  ]);
  const [editingStockIn, setEditingStockIn] = useState<StockIn | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedStockIn, setSelectedStockIn] = useState<StockIn | null>(null);
  const [inputProducts, setInputProducts] = useState<{ [key: number]: Product[] }>({});
  const [inputBrands, setInputBrands] = useState<{ [key: number]: Brand[] }>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStockIns();
    fetchServices();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!(event.target as HTMLElement).closest(".brand-input-container")) {
        // Logic for closing brand suggestion dropdowns
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchStockIns = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/stock-in");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setStockIns(data);
    } catch (error) {
      console.error("Error fetching stock ins:", error);
      toast.error("Failed to load stock ins");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await fetch("/api/services");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setServices(data);
    } catch (error) {
      console.error("Error fetching services:", error);
      toast.error("Failed to load services");
    }
  };

  const fetchProducts = async (serviceId: string, index: number) => {
    try {
      const response = await fetch(`/api/products?serviceId=${serviceId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setInputProducts((prev) => ({
        ...prev,
        [index]: data,
      }));
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    }
  };

  const fetchBrands = async (productId: string, index: number) => {
    try {
      const response = await fetch(`/api/brands?productId=${productId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setInputBrands((prev) => ({
        ...prev,
        [index]: data,
      }));
    } catch (error) {
      console.error("Error fetching brands:", error);
      toast.error("Failed to load brands");
    }
  };

  const handleInputChange = (
    index: number,
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    const newInputs = [...stockInInputs];
    newInputs[index] = {
      ...newInputs[index],
      [name]:
        name === "quantity" || name === "pricePerUnit" ? Number(value) : value,
    };
    setStockInInputs(newInputs);

    if (name === "serviceId") {
      fetchProducts(value, index);
    } else if (name === "productId") {
      fetchBrands(value, index);
    }
  };

  const addAnotherStockIn = () => {
    const currentIndex = stockInInputs.length;
    if (currentIndex > 0) {
      const lastIndex = currentIndex - 1;
      if (inputProducts[lastIndex]) {
        setInputProducts((prev) => ({
          ...prev,
          [currentIndex]: inputProducts[lastIndex],
        }));
      }
    }
    setStockInInputs([
      ...stockInInputs,
      {
        serviceId: "",
        productId: "",
        brandId: "",
        brandName: "",
        quantity: 0,
        pricePerUnit: 0,
        comments: "",
      },
    ]);
  };

  const removeStockIn = (index: number) => {
    if (stockInInputs.length > 1) {
      const newInputs = stockInInputs.filter((_, i) => i !== index);
      setStockInInputs(newInputs);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Check if editing an existing stock in
      if (editingStockIn) {
        const response = await fetch(`/api/stock-in/${editingStockIn.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: stockInInputs[0].productId,
            brandId: stockInInputs[0].brandId,
            quantity: stockInInputs[0].quantity,
            pricePerUnit: stockInInputs[0].pricePerUnit,
            comments: stockInInputs[0].comments,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to update stock in");
        }

        toast.success("Stock in updated successfully");
        await fetchStockIns();
        setShowForm(false);
        setEditingStockIn(null);
        setStockInInputs([
          {
            serviceId: "",
            productId: "",
            brandId: "",
            brandName: "",
            quantity: 0,
            pricePerUnit: 0,
            comments: "",
          },
        ]);
      } else {
        // Create stock ins
        await Promise.all(
          stockInInputs.map(async (stockIn) => {
            const response = await fetch("/api/stock-in", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(stockIn),
            });

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || "Failed to create stock ins");
            }
          })
        );

        toast.success("Stock ins created successfully");
        await fetchStockIns();
        setShowForm(false);
        setStockInInputs([
          {
            serviceId: "",
            productId: "",
            brandId: "",
            brandName: "",
            quantity: 0,
            pricePerUnit: 0,
            comments: "",
          },
        ]);
      }
    } catch (error) {
      console.error("Error creating or updating stock ins:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to process stock ins"
      );
    }
  };

  const handleEdit = (stockIn: StockIn) => {
    setEditingStockIn(stockIn);
    setStockInInputs([
      {
        serviceId:
          services.find((s) => s.name === stockIn.serviceName)?.id || "",
        productId: stockIn.productId,
        brandId: stockIn.brandId || "",
        brandName: stockIn.brandName,
        quantity: stockIn.quantity,
        pricePerUnit: stockIn.pricePerUnit,
        comments: stockIn.comments || "",
      },
    ]);

    const serviceId = services.find((s) => s.name === stockIn.serviceName)?.id;
    if (serviceId) {
      fetchProducts(serviceId, 0);
      if (stockIn.productId) {
        fetchBrands(stockIn.productId, 0);
      }
    }

    setShowForm(true);
  };

  const handleDelete = async (stockInId: string) => {
    if (window.confirm("Are you sure you want to delete this stock in record?")) {
      try {
        const response = await fetch(`/api/stock-in/${stockInId}`, {
          method: "DELETE",
        });
        if (!response.ok) throw new Error("Failed to delete stock in");
        await fetchStockIns();
        toast.success("Stock in record deleted successfully");
      } catch (error) {
        console.error("Error deleting stock in:", error);
        toast.error("Failed to delete stock in record");
      }
    }
  };

  const handleViewDetails = (stockIn: StockIn) => {
    setSelectedStockIn(stockIn);
  };

  // Check permissions
  const canCreate = permissions.includes("create");
  const canEdit = permissions.includes("edit");
  const canDelete = permissions.includes("delete");
  const canView = permissions.includes("view");

  const columns: GridColDef[] = [
    {
      field: "createdAt",
      headerName: "Date",
      flex: 1,
      headerClassName: "table-header",
      cellClassName: "table-cell",
      align: "center",
      headerAlign: "center",
      renderCell: (params) => new Date(params.value).toLocaleDateString(),
    },
    // { field: 'createdBy', headerName: 'User Name', flex: 1, headerClassName: 'table-header', cellClassName: 'table-cell', align: 'center', headerAlign: 'center' }, // Commented out
    {
      field: "brandName",
      headerName: "Brand Name",
      flex: 1,
      headerClassName: "table-header",
      cellClassName: "table-cell",
      align: "center",
      headerAlign: "center",
    },
    {
      field: "productName",
      headerName: "Product Name",
      flex: 1,
      headerClassName: "table-header",
      cellClassName: "table-cell",
      align: "center",
      headerAlign: "center",
    },
    // {
    //   field: "serviceName",
    //   headerName: "Service Name",
    //   flex: 1,
    //   headerClassName: "table-header",
    //   cellClassName: "table-cell",
    //   align: "center",
    //   headerAlign: "center",
    // },
    {
      field: "quantity",
      headerName: "Quantity",
      flex: 1,
      headerClassName: "table-header",
      cellClassName: "table-cell",
      align: "center",
      headerAlign: "center",
    },
    {
      field: "pricePerUnit",
      headerName: "Unit Price",
      flex: 1,
      headerClassName: "table-header",
      cellClassName: "table-cell",
      align: "center",
      headerAlign: "center",
      renderCell: (params) => `${params.value.toFixed(2)} Tk`,
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      headerClassName: "table-header",
      cellClassName: "table-cell",
      sortable: false,
      filterable: false,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <div className="flex gap-2 justify-center items-center h-full mt-0">
          {canView && (
            <button
              onClick={() => handleViewDetails(params.row)}
              className="px-2 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md transition duration-200 text-sm"
            >
              <svg
                className="w-4 h-4 inline-block mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              View
            </button>
          )}
          {canEdit && (
            <button
              onClick={() => handleEdit(params.row)}
              className="px-2 py-1 bg-green-50 text-green-600 hover:bg-green-100 rounded-md transition duration-200 text-sm"
            >
              <svg
                className="w-4 h-4 inline-block mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Edit
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => handleDelete(params.row.id)}
              className="px-2 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded-md transition duration-200 text-sm"
            >
              <svg
                className="w-4 h-4 inline-block mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Delete
            </button>
          )}
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-black">Stock In History</h2>
        <div className="flex items-center gap-4">
          {canCreate && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:-translate-y-1 flex items-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Stock In
            </button>
          )}

          {session?.user?.role === "SUPER_ADMIN" && (
            <Link
              href="/brand-management"
              className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:-translate-y-1 inline-flex items-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                />
              </svg>
              Manage Brand Name
            </Link>
          )}
        </div>
      </div>
      {showForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/75 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-xl shadow-2xl max-w-4xl w-full p-8 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-black">
                {editingStockIn ? "Edit Stock In" : "Add New Stock In"}
              </h3>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {stockInInputs.map((stockIn, index) => (
              <div key={index} className="mb-6 p-6 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-semibold text-black">
                    Stock In #{index + 1}
                  </h4>
                  {!editingStockIn && stockInInputs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeStockIn(index)}
                      className="text-red-500 hover:text-red-700 flex items-center gap-1"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      Remove
                    </button>
                  )}
                </div>

                <div className="grid gap-6">
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Product Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="serviceId"
                      value={stockIn.serviceId}
                      onChange={(e) => handleInputChange(index, e)}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                    >
                      <option value="">Select a Product Category</option>
                      {services.map((service) => (
                        <option key={service.id} value={service.id}>
                          {service.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Product <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="productId"
                      value={stockIn.productId}
                      onChange={(e) => handleInputChange(index, e)}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                    >
                      <option value="">Select a product</option>
                      {(inputProducts[index] || [])
                        .filter(
                          (product) =>
                            !stockIn.serviceId ||
                            product.serviceId === stockIn.serviceId
                        )
                        .map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.name}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Brand <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="brandId"
                      value={stockIn.brandId}
                      onChange={(e) => handleInputChange(index, e)}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                    >
                      <option value="">Select a brand</option>
                      {(inputBrands[index] || [])
                        .filter(
                          (brand) =>
                            !stockIn.productId ||
                            brand.productId === stockIn.productId
                        )
                        .map((brand) => (
                          <option key={brand.id} value={brand.id}>
                            {brand.name}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Quantity <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="quantity"
                      value={stockIn.quantity === 0 ? "" : stockIn.quantity}
                      onChange={(e) => handleInputChange(index, e)}
                      required
                      min="1"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Price Per Unit <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="pricePerUnit"
                      value={
                        stockIn.pricePerUnit === 0 ? "" : stockIn.pricePerUnit
                      }
                      onChange={(e) => handleInputChange(index, e)}
                      required
                      min="0"
                      step="0.01"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Comments
                    </label>
                    <textarea
                      name="comments"
                      value={stockIn.comments}
                      onChange={(e) => handleInputChange(index, e)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            ))}

            <div className="flex justify-end gap-4 mt-6">
              {!editingStockIn && (
                <button
                  type="button"
                  onClick={addAnotherStockIn}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
                >
                  Add More
                </button>
              )}
              <button
                type="submit"
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-300"
              >
                {editingStockIn ? "Update Stock In" : "Create Stock In(s)"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <Box
          sx={{
            height: 700, // Adjusted height to fit the div
            width: "100%", // Adjusted width to fit the div
            "& .table-header": {
              backgroundColor: "#f8fafc",
              color: "#1e293b",
              fontSize: "0.875rem",
              fontWeight: 600,
              padding: "0.5rem 1rem", // Adjusted padding for table header cells
            },
            "& .table-cell": {
              fontSize: "0.875rem",
              color: "#334155",
              padding: "0.5rem 1rem", // Adjusted padding for table cells
            },
            "& .MuiDataGrid-root": { border: "none" },
            "& .MuiDataGrid-cell": {
              borderBottom: "1px solid #f1f5f9",
              padding: "0.5rem 1rem", // Adjusted padding for data grid cells
            },
            "& .MuiDataGrid-columnHeaders": {
              borderBottom: "2px solid #e2e8f0",
            },
            "& .MuiDataGrid-toolbarContainer": {
              padding: "1rem",
              backgroundColor: "#ffffff",
              borderBottom: "1px solid #f1f5f9",
            },
            "& .MuiButton-root": { color: "#475569" },
            "& .MuiInputBase-root": {
              backgroundColor: "#f8fafc",
              borderRadius: "0.5rem",
              padding: "0.5rem 1rem", // Adjusted padding for input base root
            },
          }}
        >
          <DataGrid
            rows={stockIns}
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
              width: "100%", // Added to make the table wider
              height: "100%", // Adjusted height to fit the div
            }}
          />
        </Box>
      </div>

      {selectedStockIn && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full transform transition-all">
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-2xl font-bold text-gray-900">
                  Stock In Details
                </h3>
                <button
                  onClick={() => setSelectedStockIn(null)}
                  className="rounded-full p-1.5 text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-500 mb-2">
                    Product Details
                  </h4>
                  <div className="space-y-2">
                    <p className="text-gray-900">
                      Product Category: {selectedStockIn.serviceName}
                    </p>
                    <p className="text-gray-900">
                      Product: {selectedStockIn.productName}
                    </p>
                    <p className="text-gray-900">
                      Brand: {selectedStockIn.brandName}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-500 mb-2">
                    Stock Information
                  </h4>
                  <div className="space-y-2">
                    <p className="text-gray-900">
                      Quantity: {selectedStockIn.quantity}
                    </p>
                    <p className="text-gray-900">
                      Price Per Unit: {selectedStockIn.pricePerUnit.toFixed(2)}{" "}
                      Tk
                    </p>
                    <p className="text-gray-900">
                      Total Value:{" "}
                      {(
                        selectedStockIn.quantity * selectedStockIn.pricePerUnit
                      ).toFixed(2)}{" "}
                      Tk
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-500 mb-2">
                    Additional Information
                  </h4>
                  <p className="text-gray-900">{selectedStockIn.comments}</p>
                </div>

                <div className="flex gap-4">
                  <div className="flex-1 bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-gray-500 mb-2">
                      Created By
                    </h4>
                    <p className="text-gray-900">{selectedStockIn.createdBy}</p>
                  </div>

                  <div className="flex-1 bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-gray-500 mb-2">
                      Created At
                    </h4>
                    <p className="text-gray-900">
                      {new Date(selectedStockIn.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockInList;

"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
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
  productId: string; // Add this line
}

interface StockOut {
  id: string;
  productId: string;
  productName: string;
  serviceName: string;
  brandId: string;
  brandName: string;
  quantity: number;
  comments: string;
  createdBy: string;
  createdAt: string;
}

interface StockOutListProps {
  permissions: string[];
}

const StockOutList: React.FC<StockOutListProps> = ({ permissions }) => {
  const { data: session } = useSession();
  const [stockOuts, setStockOuts] = useState<StockOut[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [stockOutInputs, setStockOutInputs] = useState([
    {
      serviceId: "",
      productId: "",
      brandId: "",
      quantity: 0,
      comments: "",
    },
  ]);
  const [editingStockOut, setEditingStockOut] = useState<StockOut | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedStockOut, setSelectedStockOut] = useState<StockOut | null>(
    null
  );
  const [inputProducts, setInputProducts] = useState<{
    [key: number]: Product[];
  }>({});
  const [inputBrands, setInputBrands] = useState<{ [key: number]: Brand[] }>(
    {}
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStockOuts();
    fetchServices();
  }, []);

  const fetchStockOuts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/stock-out");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setStockOuts(data);
    } catch (error) {
      console.error("Error fetching stock outs:", error);
      toast.error("Failed to load stock outs");
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
      setProducts(data); // Keep this for backward compatibility
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
      setBrands(data); // Keep this for backward compatibility
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
    const newInputs = [...stockOutInputs];
    newInputs[index] = {
      ...newInputs[index],
      [name]: name === "quantity" ? Number(value) : value,
    };
    setStockOutInputs(newInputs);

    if (name === "serviceId") {
      fetchProducts(value, index);
    } else if (name === "productId") {
      fetchBrands(value, index);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        // Validate that required fields are filled
        const hasEmptyFields = stockOutInputs.some(
            (input) => !input.productId || !input.brandId || !input.quantity
        );

        if (hasEmptyFields) {
            toast.error("Please fill all required fields");
            return;
        }

        // Prepare the stock out items to send
        const stockOutItems = stockOutInputs.map(input => ({
            productId: input.productId,
            brandId: input.brandId,
            quantity: input.quantity,
            comments: input.comments,
        }));

        // Check if editing an existing stock out
        if (editingStockOut) {
            const response = await fetch(`/api/stock-out/${editingStockOut.id}`, {
                method: "PUT", // Use PUT for updating
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    productId: stockOutInputs[0].productId,
                    brandId: stockOutInputs[0].brandId,
                    quantity: stockOutInputs[0].quantity,
                    comments: stockOutInputs[0].comments,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to update stock out");
            }

            // Show success toast
            toast.success("Stock out updated successfully");
        } else {
            // Create stock outs
            const response = await fetch("/api/stock-out", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(stockOutItems), // Send the array of stock out items
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to create stock outs");
            }

            // Show success toast for creation
            toast.success("Stock outs created successfully");
        }

        // Reload the stock outs table
        await fetchStockOuts();

        // Reset form and state
        setShowForm(false);
        setEditingStockOut(null);
        setStockOutInputs([
            {
                serviceId: "",
                productId: "",
                brandId: "",
                quantity: 0,
                comments: "",
            },
        ]);
    } catch (error) {
        console.error("Error creating or updating stock outs:", error);
        toast.error(
            error instanceof Error ? error.message : "Failed to process stock outs"
        );
    }
  };

  const handleEdit = (stockOut: StockOut) => {
    setEditingStockOut(stockOut);
    setStockOutInputs([
      {
        serviceId:
          services.find((s) => s.name === stockOut.serviceName)?.id || "",
        productId: stockOut.productId,
        brandId: stockOut.brandId,
        quantity: stockOut.quantity,
        comments: stockOut.comments,
      },
    ]);
    setShowForm(true);
    fetchProducts(
      services.find((s) => s.name === stockOut.serviceName)?.id || "",
      0
    );
    fetchBrands(stockOut.productId, 0);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this stock out?")) {
      try {
        const response = await fetch(`/api/stock-out/${id}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        await fetchStockOuts();
        toast.success("Stock out deleted successfully");
      } catch (error) {
        console.error("Error deleting stock out:", error);
        toast.error("Failed to delete stock out");
      }
    }
  };

  const handleViewDetails = (stockOut: StockOut) => {
    setSelectedStockOut(stockOut);
  };

  const addAnotherStockOut = () => {
    const currentIndex = stockOutInputs.length;
    // Copy products and brands from the last entry if they exist
    if (currentIndex > 0) {
      const lastIndex = currentIndex - 1;
      if (inputProducts[lastIndex]) {
        setInputProducts((prev) => ({
          ...prev,
          [currentIndex]: inputProducts[lastIndex],
        }));
      }
      if (inputBrands[lastIndex]) {
        setInputBrands((prev) => ({
          ...prev,
          [currentIndex]: inputBrands[lastIndex],
        }));
      }
    }
    setStockOutInputs([
      ...stockOutInputs,
      {
        serviceId: "",
        productId: "",
        brandId: "",
        quantity: 0,
        comments: "",
      },
    ]);
  };

  const removeStockOut = (index: number) => {
    if (stockOutInputs.length > 1) {
      const newInputs = stockOutInputs.filter((_, i) => i !== index);
      setStockOutInputs(newInputs);
    }
  };

  const isSuperAdmin = session?.user?.role === "SUPER_ADMIN";
  const canCreate = isSuperAdmin || permissions.includes("create");
  const canEdit = isSuperAdmin || permissions.includes("edit");
  const canDelete = isSuperAdmin || permissions.includes("delete");
  const canView = isSuperAdmin || permissions.includes("view");

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
    {
      field: "serviceName",
      headerName: "Product Category",
      flex: 1,
      headerClassName: "table-header",
      cellClassName: "table-cell",
      align: "center",
      headerAlign: "center",
    },
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
        <h2 className="text-2xl font-bold text-black">Stock Out History</h2>
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
            Stock Out
          </button>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/75 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-xl shadow-2xl max-w-4xl w-full p-8 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-black">
                {editingStockOut ? "Edit Stock Out" : "Add New Stock Out"}
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

            {stockOutInputs.map((stockOut, index) => (
              <div key={index} className="mb-6 p-6 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-semibold text-black">
                    Stock Out #{index + 1}
                  </h4>
                  {!editingStockOut && stockOutInputs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeStockOut(index)}
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
                      value={stockOut.serviceId}
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
                      value={stockOut.productId}
                      onChange={(e) => handleInputChange(index, e)}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                    >
                      <option value="">Select a product</option>
                      {(inputProducts[index] || [])
                        .filter(
                          (product) =>
                            !stockOut.serviceId ||
                            product.serviceId === stockOut.serviceId
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
                      value={stockOut.brandId}
                      onChange={(e) => handleInputChange(index, e)}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                    >
                      <option value="">Select a brand</option>
                      {(inputBrands[index] || [])
                        .filter(
                          (brand) =>
                            !stockOut.productId ||
                            brand.productId === stockOut.productId
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
                      value={stockOut.quantity === 0 ? "" : stockOut.quantity}
                      onChange={(e) => handleInputChange(index, e)}
                      required
                      min="1"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Comments
                    </label>
                    <textarea
                      name="comments"
                      value={stockOut.comments}
                      onChange={(e) => handleInputChange(index, e)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            ))}

            <div className="flex justify-end gap-4 mt-6">
              {!editingStockOut && (
                <button
                  type="button"
                  onClick={addAnotherStockOut}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
                >
                  Add Another Entry
                </button>
              )}
              <button
                type="submit"
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-300"
              >
                {editingStockOut ? "Update Stock Out" : "Create Stock Out(s)"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <Box
          sx={{
            height: 700,
            width: "100%",
            "& .table-header": {
              backgroundColor: "#f8fafc",
              color: "#1e293b",
              fontSize: "0.875rem",
              fontWeight: 600,
              padding: "0.5rem 1rem",
            },
            "& .table-cell": {
              fontSize: "0.875rem",
              color: "#334155",
              padding: "0.5rem 1rem",
            },
            "& .MuiDataGrid-root": { border: "none" },
            "& .MuiDataGrid-cell": {
              borderBottom: "1px solid #f1f5f9",
              padding: "0.5rem 1rem",
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
              padding: "0.5rem 1rem",
            },
          }}
        >
          <DataGrid
            rows={stockOuts}
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
              width: "100%",
              height: "100%",
            }}
          />
        </Box>
      </div>

      {selectedStockOut && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full transform transition-all">
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-2xl font-bold text-gray-900">
                  Stock Out Details
                </h3>
                <button
                  onClick={() => setSelectedStockOut(null)}
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
                      Product Category: {selectedStockOut.serviceName}
                    </p>
                    <p className="text-gray-900">
                      Product: {selectedStockOut.productName}
                    </p>
                    <p className="text-gray-900">
                      Brand: {selectedStockOut.brandName}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-500 mb-2">
                    Stock Information
                  </h4>
                  <div className="space-y-2">
                    <p className="text-gray-900">
                      Quantity: {selectedStockOut.quantity}
                    </p>
                  </div>
                </div>

                {selectedStockOut.comments && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-gray-500 mb-2">
                      Additional Information
                    </h4>
                    <p className="text-gray-900">{selectedStockOut.comments}</p>
                  </div>
                )}

                <div className="flex gap-4">
                  <div className="flex-1 bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-gray-500 mb-2">
                      Created By
                    </h4>
                    <p className="text-gray-900">
                      {selectedStockOut.createdBy}
                    </p>
                  </div>

                  <div className="flex-1 bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-gray-500 mb-2">
                      Created At
                    </h4>
                    <p className="text-gray-900">
                      {new Date(selectedStockOut.createdAt).toLocaleString()}
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

export default StockOutList;

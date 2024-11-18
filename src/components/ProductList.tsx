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
  description: string;
  serviceId: string;
  serviceName: string;
  createdBy: string;
  createdAt: string;
}

interface ProductListProps {
  permissions: string[];
}

const ProductList: React.FC<ProductListProps> = ({ permissions }) => {
  const { data: session } = useSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [productInputs, setProductInputs] = useState([
    {
      name: "",
      description: "",
      serviceId: "",
    },
  ]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log("Received permissions:", permissions);
    fetchProducts();
    fetchServices();
  }, [permissions]);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/products");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
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

  const handleInputChange = (
    index: number,
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    const newInputs = [...productInputs];
    newInputs[index] = {
      ...newInputs[index],
      [name]: value,
    };
    setProductInputs(newInputs);
  };

  const addProductInput = () => {
    setProductInputs([
      ...productInputs,
      {
        name: "",
        description: "",
        serviceId: "",
      },
    ]);
  };

  const removeProductInput = (index: number) => {
    const newInputs = productInputs.filter((_, i) => i !== index);
    setProductInputs(newInputs);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        // Handle edit
        const response = await fetch(`/api/products/${editingProduct.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(productInputs[0]),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Failed to update product");
        }

        toast.success("Product updated successfully");
      } else {
        // Handle create
        const responses = await Promise.all(
          productInputs.map((product) =>
            fetch("/api/products", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(product),
            })
          )
        );

        // Check each response and collect errors
        const results = await Promise.all(
          responses.map(async (response) => {
            const data = await response.json();
            return { ok: response.ok, data };
          })
        );

        const errors = results
          .filter((result) => !result.ok)
          .map((result) => result.data.error);

        if (errors.length > 0) {
          throw new Error(errors.join(", "));
        }

        toast.success(
          `${productInputs.length} product(s) created successfully`
        );
      }

      await fetchProducts();
      setShowForm(false);
      setProductInputs([{ name: "", description: "", serviceId: "" }]);
      setEditingProduct(null);
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save product"
      );
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setProductInputs([
      {
        name: product.name,
        description: product.description,
        serviceId: product.serviceId,
      },
    ]);
    setShowForm(true);
  };

  const handleDelete = async (productId: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        const response = await fetch(`/api/products/${productId}`, {
          method: "DELETE",
        });
        if (!response.ok) throw new Error("Failed to delete product");
        await fetchProducts();
        toast.success("Product deleted successfully");
      } catch (error) {
        console.error("Error deleting product:", error);
        toast.error("Failed to delete product");
      }
    }
  };

  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product);
  };

  const isSuperAdmin = session?.user?.role === "SUPER_ADMIN";
  const canCreate = isSuperAdmin || permissions.includes("create");
  const canEdit = isSuperAdmin || permissions.includes("edit");
  const canDelete = isSuperAdmin || permissions.includes("delete");
  const canView = permissions.includes("view");

  console.log("Can create:", canCreate);
  console.log("Can edit:", canEdit);
  console.log("Can delete:", canDelete);

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Product Name",
      flex: 1,
      headerClassName: "table-header",
      cellClassName: "table-cell",
      type: "string",
      align: "center",
      headerAlign: "center",
    },
    {
      field: "description",
      headerName: "Description",
      flex: 2,
      headerClassName: "table-header",
      cellClassName: "table-cell",
      type: "string",
      align: "center",
      headerAlign: "center",
    },
    {
      field: "serviceName",
      headerName: "Product Category Name",
      flex: 1,
      headerClassName: "table-header",
      cellClassName: "table-cell",
      type: "string",
      align: "center",
      headerAlign: "center",
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1.5,
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
              className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md transition duration-200 text-sm"
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
              className="px-3 py-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-md transition duration-200 text-sm"
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
              className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-md transition duration-200 text-sm"
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
        <h2 className="text-2xl font-bold text-gray-800">Product Management</h2>
        {canCreate && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-medium transition duration-200 flex items-center gap-2 shadow-lg"
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
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Add New Product
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <Box
          sx={{
            height: 800,
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
            rows={products}
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

      {showForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/75 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-xl shadow-2xl max-w-4xl w-full p-8 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-black">
                {editingProduct ? "Edit Product" : "Add New Products"}
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

            {productInputs.map((product, index) => (
              <div key={index} className="mb-6 p-6 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-semibold text-black">
                    Product #{index + 1}
                  </h4>
                  {productInputs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeProductInput(index)}
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
                      value={product.serviceId}
                      onChange={(e) => handleInputChange(index, e)}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                    >
                      <option value="">Select a service</option>
                      {services.map((service) => (
                        <option key={service.id} value={service.id}>
                          {service.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Product Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={product.name}
                      onChange={(e) => handleInputChange(index, e)}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="description"
                      value={product.description}
                      onChange={(e) => handleInputChange(index, e)}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            ))}

            <div className="flex justify-end gap-4 mt-6">
              {!editingProduct && (
                <button
                  type="button"
                  onClick={addProductInput}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
                >
                  Add Another Product
                </button>
              )}
              <button
                type="submit"
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-300"
              >
                {editingProduct ? "Update Product" : "Create Products"}
              </button>
            </div>
          </form>
        </div>
      )}

      {selectedProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full transform transition-all">
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-2xl font-bold text-gray-900">
                  {selectedProduct.name} Details
                </h3>
                <button
                  onClick={() => setSelectedProduct(null)}
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
                    Description
                  </h4>
                  <p className="text-gray-900">{selectedProduct.description}</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-500 mb-2">
                    Product Category
                  </h4>
                  <p className="text-gray-900">{selectedProduct.serviceName}</p>
                </div>

                <div className="flex gap-4">
                  <div className="flex-1 bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-gray-500 mb-2">
                      Created By
                    </h4>
                    <p className="text-gray-900">{selectedProduct.createdBy}</p>
                  </div>

                  <div className="flex-1 bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-gray-500 mb-2">
                      Created At
                    </h4>
                    <p className="text-gray-900">
                      {new Date(selectedProduct.createdAt).toLocaleString()}
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

export default ProductList;

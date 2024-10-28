import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

interface StockOutFormProps {
  onSubmit: (data: StockOutData) => void;
}

interface StockOutData {
  productId: string;
  brandId: string;
  quantity: number;
  comments: string;
}

const StockOutForm: React.FC<StockOutFormProps> = ({ onSubmit }) => {
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(0);
  const [comments, setComments] = useState<string>('');
  const [availableStock, setAvailableStock] = useState<number | null>(null);

  // Add this function to check available stock when product and brand are selected
  const checkAvailableStock = async (productId: string, brandId: string) => {
    try {
      const response = await fetch(
        `/api/stock/available?productId=${productId}&brandId=${brandId}`
      );
      const data = await response.json();
      setAvailableStock(data.availableStock);
    } catch (error) {
      console.error('Error checking available stock:', error);
      toast.error('Failed to check available stock');
    }
  };

  // Call this function when product or brand selection changes
  useEffect(() => {
    if (selectedProduct && selectedBrand) {
      checkAvailableStock(selectedProduct, selectedBrand);
    } else {
      setAvailableStock(null);
    }
  }, [selectedProduct, selectedBrand]);

  // Add validation to quantity input
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (availableStock !== null && value > availableStock) {
      toast.error(`Cannot exceed available stock of ${availableStock}`);
      return;
    }
    setQuantity(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProduct || !selectedBrand || quantity <= 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (availableStock !== null && quantity > availableStock) {
      toast.error(`Cannot exceed available stock of ${availableStock}`);
      return;
    }

    onSubmit({
      productId: selectedProduct,
      brandId: selectedBrand,
      quantity,
      comments
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Product
        </label>
        <select
          value={selectedProduct}
          onChange={(e) => setSelectedProduct(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        >
          <option value="">Select a product</option>
          {/* Add your product options here */}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Brand
        </label>
        <select
          value={selectedBrand}
          onChange={(e) => setSelectedBrand(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        >
          <option value="">Select a brand</option>
          {/* Add your brand options here */}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Quantity {availableStock !== null && `(Available: ${availableStock})`}
        </label>
        <input
          type="number"
          min="1"
          value={quantity}
          onChange={handleQuantityChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Comments
        </label>
        <textarea
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          rows={3}
        />
      </div>

      <button
        type="submit"
        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Submit Stock Out
      </button>
    </form>
  );
};

export default StockOutForm;

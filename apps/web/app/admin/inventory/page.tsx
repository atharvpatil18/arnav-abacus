'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CircularProgress } from '@/components/ui/circular-progress';
import { axiosInstance } from '@/lib/axios';
import {
  Package,
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
  Archive,
  TrendingDown
} from 'lucide-react';
import { toast } from 'sonner';

interface Batch {
  id: number;
  name: string;
}

interface InventoryAllocation {
  id: number;
  batch: Batch;
  quantityAllocated: number;
  allocatedDate: string;
  returnedDate?: string;
}

interface InventoryItem {
  id: number;
  name: string;
  category: string;
  quantity: number;
  minimumQuantity: number;
  allocations?: InventoryAllocation[];
}

interface CreateItemDto {
  name: string;
  category: string;
  quantity: number;
  minimumQuantity: number;
}

interface CreateAllocationDto {
  itemId: number;
  batchId: number;
  quantityAllocated: number;
}

export default function InventoryPage() {
  const queryClient = useQueryClient();
  const [showItemForm, setShowItemForm] = useState(false);
  const [showAllocationForm, setShowAllocationForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [itemFormData, setItemFormData] = useState<CreateItemDto>({
    name: '',
    category: 'ABACUS',
    quantity: 0,
    minimumQuantity: 10,
  });

  const [allocationFormData, setAllocationFormData] = useState<CreateAllocationDto>({
    itemId: 0,
    batchId: 0,
    quantityAllocated: 0,
  });

  const { data: items, isLoading } = useQuery<InventoryItem[]>({
    queryKey: ['inventory'],
    queryFn: async () => {
      const response = await axiosInstance.get('/inventory?page=1&limit=1000');
      return Array.isArray(response.data) ? response.data : response.data?.items || [];
    },
  });

  const { data: batches } = useQuery<Batch[]>({
    queryKey: ['batches'],
    queryFn: async () => {
      const response = await axiosInstance.get('/batches?page=1&limit=1000');
      return Array.isArray(response.data) ? response.data : response.data?.items || [];
    },
  });

  const createItemMutation = useMutation({
    mutationFn: async (data: CreateItemDto) => {
      return axiosInstance.post('/inventory', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      resetItemForm();
      toast.success('Item added successfully!');
    },
    onError: () => {
      toast.error('Failed to add item');
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: CreateItemDto }) => {
      return axiosInstance.patch(`/inventory/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      resetItemForm();
      toast.success('Item updated successfully!');
    },
    onError: () => {
      toast.error('Failed to update item');
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (id: number) => {
      return axiosInstance.delete(`/inventory/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast.success('Item deleted successfully!');
    },
    onError: () => {
      toast.error('Failed to delete item');
    },
  });

  const createAllocationMutation = useMutation({
    mutationFn: async (data: CreateAllocationDto) => {
      return axiosInstance.post('/inventory/allocations', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      resetAllocationForm();
      toast.success('Item allocated successfully!');
    },
    onError: () => {
      toast.error('Failed to allocate item');
    },
  });

  const resetItemForm = () => {
    setItemFormData({
      name: '',
      category: 'ABACUS',
      quantity: 0,
      minimumQuantity: 10,
    });
    setShowItemForm(false);
    setEditingId(null);
  };

  const resetAllocationForm = () => {
    setAllocationFormData({
      itemId: 0,
      batchId: 0,
      quantityAllocated: 0,
    });
    setShowAllocationForm(false);
  };

  const handleEditItem = (item: InventoryItem) => {
    setItemFormData({
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      minimumQuantity: item.minimumQuantity,
    });
    setEditingId(item.id);
    setShowItemForm(true);
  };

  const handleSubmitItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemFormData.name || !itemFormData.category) {
      toast.error('Please fill all required fields');
      return;
    }

    if (editingId) {
      updateItemMutation.mutate({ id: editingId, data: itemFormData });
    } else {
      createItemMutation.mutate(itemFormData);
    }
  };

  const handleSubmitAllocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!allocationFormData.itemId || !allocationFormData.batchId || !allocationFormData.quantityAllocated) {
      toast.error('Please fill all required fields');
      return;
    }

    createAllocationMutation.mutate(allocationFormData);
  };

  const handleDeleteItem = (id: number) => {
    if (confirm('Are you sure you want to delete this item?')) {
      deleteItemMutation.mutate(id);
    }
  };

  const calculateStats = () => {
    const itemsData = items || [];
    const lowStock = itemsData.filter((item) => item.quantity <= item.minimumQuantity).length;
    const totalItems = itemsData.reduce((sum, item) => sum + item.quantity, 0);
    const totalAllocated = itemsData.reduce(
      (sum, item) =>
        sum +
        (item.allocations?.reduce((s, a) => s + (a.returnedDate ? 0 : a.quantityAllocated), 0) || 0),
      0
    );

    return {
      totalItems: itemsData.length,
      lowStock,
      totalQuantity: totalItems,
      totalAllocated,
    };
  };

  const stats = calculateStats();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Inventory Management
          </h1>
          <p className="text-gray-600 mt-1">Manage items and allocations</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowAllocationForm(!showAllocationForm)}
            className="bg-gradient-to-r from-green-500 to-teal-500"
          >
            <Archive className="w-4 h-4 mr-2" />
            {showAllocationForm ? 'Cancel' : 'Allocate Item'}
          </Button>
          <Button
            onClick={() => setShowItemForm(!showItemForm)}
            className="bg-gradient-to-r from-blue-500 to-purple-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            {showItemForm ? 'Cancel' : 'Add Item'}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700">Total Items</p>
                <p className="text-2xl font-bold text-blue-800">{stats.totalItems}</p>
              </div>
              <Package className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-700">Low Stock</p>
                <p className="text-2xl font-bold text-red-800">{stats.lowStock}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700">Total Quantity</p>
                <p className="text-2xl font-bold text-green-800">{stats.totalQuantity}</p>
              </div>
              <TrendingDown className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700">Allocated</p>
                <p className="text-2xl font-bold text-purple-800">{stats.totalAllocated}</p>
              </div>
              <Archive className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Item Form */}
      {showItemForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Item' : 'Add New Item'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitItem} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Item Name *</label>
                  <input
                    type="text"
                    value={itemFormData.name}
                    onChange={(e) => setItemFormData({ ...itemFormData, name: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter item name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Category *</label>
                  <select
                    value={itemFormData.category}
                    onChange={(e) => setItemFormData({ ...itemFormData, category: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="ABACUS">Abacus</option>
                    <option value="BOOKS">Books</option>
                    <option value="STATIONERY">Stationery</option>
                    <option value="EQUIPMENT">Equipment</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Quantity</label>
                  <input
                    type="number"
                    value={itemFormData.quantity}
                    onChange={(e) => setItemFormData({ ...itemFormData, quantity: Number(e.target.value) })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    min={0}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Minimum Quantity</label>
                  <input
                    type="number"
                    value={itemFormData.minimumQuantity}
                    onChange={(e) => setItemFormData({ ...itemFormData, minimumQuantity: Number(e.target.value) })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    min={0}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={createItemMutation.isPending || updateItemMutation.isPending}
                  className="bg-gradient-to-r from-blue-500 to-purple-500"
                >
                  {createItemMutation.isPending || updateItemMutation.isPending
                    ? 'Saving...'
                    : editingId
                    ? 'Update Item'
                    : 'Add Item'}
                </Button>
                <Button type="button" onClick={resetItemForm} variant="outline">
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Allocation Form */}
      {showAllocationForm && (
        <Card>
          <CardHeader>
            <CardTitle>Allocate Item to Batch</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitAllocation} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Item *</label>
                  <select
                    value={allocationFormData.itemId}
                    onChange={(e) => setAllocationFormData({ ...allocationFormData, itemId: Number(e.target.value) })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value={0}>Select item</option>
                    {items?.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} (Available: {item.quantity})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Batch *</label>
                  <select
                    value={allocationFormData.batchId}
                    onChange={(e) => setAllocationFormData({ ...allocationFormData, batchId: Number(e.target.value) })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value={0}>Select batch</option>
                    {batches?.map((batch) => (
                      <option key={batch.id} value={batch.id}>
                        {batch.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Quantity *</label>
                  <input
                    type="number"
                    value={allocationFormData.quantityAllocated}
                    onChange={(e) => setAllocationFormData({ ...allocationFormData, quantityAllocated: Number(e.target.value) })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    min={1}
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={createAllocationMutation.isPending}
                  className="bg-gradient-to-r from-green-500 to-teal-500"
                >
                  {createAllocationMutation.isPending ? 'Allocating...' : 'Allocate'}
                </Button>
                <Button type="button" onClick={resetAllocationForm} variant="outline">
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Items List */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory Items</CardTitle>
        </CardHeader>
        <CardContent>
          {items && items.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Category</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Quantity</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Min. Quantity</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {items.map((item) => {
                    const isLowStock = item.quantity <= item.minimumQuantity;
                    return (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">{item.name}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                            {item.category}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={isLowStock ? 'text-red-600 font-semibold' : ''}>
                            {item.quantity}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{item.minimumQuantity}</td>
                        <td className="px-4 py-3">
                          {isLowStock ? (
                            <span className="flex items-center gap-1 text-red-600">
                              <AlertTriangle className="w-4 h-4" />
                              Low Stock
                            </span>
                          ) : (
                            <span className="text-green-600">In Stock</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditItem(item)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteItem(item.id)}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>No inventory items yet</p>
              <p className="text-sm mt-1">Click &quot;Add Item&quot; to create one</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

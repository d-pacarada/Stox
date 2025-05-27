import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarUser from '../assets/Components/SidebarUser';
import Header from '../assets/Components/Header';
import CreatableSelect from 'react-select/creatable';

function AddPurchase() {
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [supplierInput, setSupplierInput] = useState('');
  const [products, setProducts] = useState([]);
  const [items, setItems] = useState([{ productId: '', quantity: 1, price: 0 }]);
  const [total, setTotal] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
    fetchSuppliers();
  }, []);

  useEffect(() => {
    const calculatedTotal = items.reduce((sum, item) => sum + item.quantity * item.price, 0);
    setTotal(calculatedTotal);
  }, [items]);

  const fetchProducts = async () => {
    try {
      const res = await fetch('http://localhost:5064/api/product/user', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error("Failed to fetch products", err);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const res = await fetch('http://localhost:5064/api/supplier/user', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setSuppliers(data);
    } catch (err) {
      console.error("Failed to fetch suppliers", err);
    }
  };

  const supplierOptions = suppliers.map(s => ({ label: s.name, value: s.name }));
  const productOptions = products.map(p => ({
    label: p.product_Name,
    value: p.product_ID,
    price: p.price
  }));

  const handleProductSelect = (index, option) => {
    const newItems = [...items];
    newItems[index].productId = option?.value || '';
    newItems[index].price = option?.price || 0;
    newItems[index].quantity = 1;
    setItems(newItems);
  };

  const handleChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = field === 'quantity' || field === 'price' ? parseFloat(value) || 0 : value;
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { productId: '', quantity: 1, price: 0 }]);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      const updated = [...items];
      updated.splice(index, 1);
      setItems(updated);
    }
  };

  const formatCurrency = (val) => val.toLocaleString('de-DE', { minimumFractionDigits: 2 });

  const handleSubmit = async () => {
    setErrorMessage("");

    const supplierName = selectedSupplier?.label || supplierInput.trim();
    if (!supplierName) {
      setErrorMessage("Please select or enter a supplier name.");
      return;
    }

    const invalidItems = items.filter(item => !item.productId || item.quantity <= 0 || item.price <= 0);
    if (invalidItems.length > 0) {
      setErrorMessage("Each item must have a product selected, quantity > 0, and valid price.");
      return;
    }

    const mappedItems = items.map(item => ({
      product_ID: item.productId,
      quantity: item.quantity,
      price: item.price
    }));

    const payload = {
      supplier_Name: supplierName,
      total_Amount: total,
      items: mappedItems
    };

    try {
      const res = await fetch('http://localhost:5064/api/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error(await res.text());

      alert('Purchase saved successfully!');
      navigate('/Purchase');
    } catch (err) {
      setErrorMessage("Failed to save purchase: " + err.message);
    }
  };

  return (
    <div className="flex flex-col min-h-screen md:flex-row overflow-hidden">
      <SidebarUser />
      <div className="flex-1 p-4 md:p-0 flex flex-col">
        <Header />
        <div className="flex justify-center mt-10">
          <div className="max-w-xl w-full">
            <div className="relative mb-5">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="absolute left-0 text-sm font-medium text-gray-800 hover:text-amber-500 lg:mt-2"
              >
                &lt;&lt; Back
              </button>
              <h2 className="text-2xl font-bold text-center text-[#112D4E]">Purchase Invoice</h2>
            </div>

            <label className="text-sm font-semibold">Supplier</label>
            <CreatableSelect
              options={supplierOptions}
              onChange={(selected) => {
                setSelectedSupplier(selected);
                setSupplierInput(selected?.label || '');
              }}
              onInputChange={(inputValue, actionMeta) => {
                if (actionMeta.action === 'input-change') {
                  setSupplierInput(inputValue);
                  setSelectedSupplier({ label: inputValue, value: null });
                }
              }}
              value={selectedSupplier}
              placeholder="Start typing or select a supplier"
              className="mb-3"
              isClearable
              isSearchable
            />

            <div className="grid grid-cols-5 gap-2 font-semibold text-sm mb-2">
              <div className="col-span-2">Product</div>
              <div>Qty</div>
              <div>Price</div>
              <div>Amount</div>
            </div>

            <div className="max-h-80 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
              {items.map((item, index) => {
                const selectedProduct = productOptions.find(p => p.value === item.productId);
                const amount = item.quantity * item.price;

                return (
                  <div key={index}>
                    <div className="grid grid-cols-5 gap-2 mb-1 items-center relative">
                      <div className="col-span-2">
                        <CreatableSelect
                          options={productOptions}
                          onChange={(option) => handleProductSelect(index, option)}
                          value={selectedProduct}
                          placeholder="Select or type"
                          className="text-sm"
                          menuPortalTarget={document.body}
                          styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                        />
                      </div>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleChange(index, 'quantity', e.target.value)}
                        className="border px-2 py-1 rounded-md text-center"
                      />
                      <input
                        type="number"
                        step="0.01"
                        value={item.price}
                        onChange={(e) => handleChange(index, 'price', e.target.value)}
                        className="border px-2 py-1 rounded-md text-center"
                      />
                      <input
                        type="text"
                        readOnly
                        value={formatCurrency(amount)}
                        className="border px-2 py-1 rounded-md bg-gray-100 text-center"
                      />
                      {items.length > 1 && (
                        <button
                          onClick={() => removeItem(index)}
                          className="absolute -right-6 top-2 text-red-500 text-xl font-bold hover:text-red-700"
                          title="Remove"
                        >
                          &times;
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={addItem}
              className="text-blue-600 font-semibold text-sm mt-2 mb-4"
            >
              + Add Item
            </button>

            <div className="flex justify-between font-semibold text-lg mb-4">
              <span>Total:</span>
              <span>{formatCurrency(total)}</span>
            </div>

            {errorMessage && (
              <div className="text-red-600 font-medium text-xs mb-2 text-center">
                {errorMessage}
              </div>
            )}

            <button
              onClick={handleSubmit}
              className="bg-[#112D4E] hover:bg-[#0b213f] text-white px-6 py-2 rounded-md w-full"
            >
              Save Invoice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddPurchase;

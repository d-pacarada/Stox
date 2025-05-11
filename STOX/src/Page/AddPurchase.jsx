import React, { useState, useEffect } from 'react';
import SidebarUser from '../assets/Components/SidebarUser';
import Header from '../assets/Components/Header';
import CreatableSelect from 'react-select/creatable';

function AddPurchase() {
  const [supplierName, setSupplierName] = useState('');
  const [products, setProducts] = useState([]);
  const [items, setItems] = useState([
    { productName: '', quantity: 1, price: 0 }
  ]);
  const [total, setTotal] = useState(0);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const calculatedTotal = items.reduce((sum, item) => {
      return sum + item.quantity * item.price;
    }, 0);
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

  const productOptions = products.map((p) => ({
    label: p.product_Name,
    value: p.product_Name
  }));

  const handleChange = (index, field, value) => {
    const newItems = [...items];
    if (field === 'quantity' || field === 'price') {
      newItems[index][field] = parseFloat(value) || 0;
    } else {
      newItems[index][field] = value;
    }
    setItems(newItems);
  };

  const handleProductSelect = (index, option) => {
    const newItems = [...items];
    newItems[index].productName = option?.value || '';
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { productName: '', quantity: 1, price: 0 }]);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      const updated = [...items];
      updated.splice(index, 1);
      setItems(updated);
    }
  };

  const formatCurrency = (val) =>
    val.toLocaleString('de-DE', { minimumFractionDigits: 2 });

  return (
    <div className="flex flex-col min-h-screen md:flex-row">
      <SidebarUser />
      <div className="flex-1 p-4 md:p-8 flex flex-col">
        <Header />

        <div className="flex justify-center mt-10 lg:mt-40">
          <div className="max-w-xl w-full p-6">
            <h2 className="text-2xl font-bold mb-4 text-[#112D4E]">Purchase Invoice</h2>

            <label className="text-sm font-semibold">Supplier</label>
            <input
              type="text"
              value={supplierName}
              onChange={(e) => setSupplierName(e.target.value)}
              placeholder="Supplier Name"
              className="w-full border px-4 py-2 rounded-md mb-6"
            />

            <div className="grid grid-cols-5 gap-2 font-semibold text-sm mb-2">
              <div className="col-span-2">Product</div>
              <div>Qty</div>
              <div>Price</div>
              <div>Amount</div>
            </div>

            {items.map((item, index) => {
              const amount = item.quantity * item.price;

              return (
                <div key={index}>
                  <div className="grid grid-cols-5 gap-2 mb-1 items-center relative">
                    <div className="col-span-2">
                      <CreatableSelect
                        options={productOptions}
                        onChange={(option) =>
                          handleProductSelect(index, option)
                        }
                        value={
                          item.productName
                            ? { label: item.productName, value: item.productName }
                            : null
                        }
                        placeholder="Select or type"
                        className="text-sm"
                      />
                    </div>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        handleChange(index, 'quantity', e.target.value)
                      }
                      className="border px-2 py-1 rounded-md text-center"
                    />
                    <input
                      type="number"
                      step="0.01"
                      value={item.price}
                      onChange={(e) =>
                        handleChange(index, 'price', e.target.value)
                      }
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

            <button
              onClick={addItem}
              className="text-blue-600  font-semibold text-sm mt-2 mb-4"
            >
              + Add Item
            </button>

            <div className="flex justify-between font-semibold text-lg mb-4">
              <span>Total:</span>
              <span>{formatCurrency(total)}</span>
            </div>

            <button className="bg-[#112D4E] hover:bg-[#0b213f] text-white px-6 py-2 rounded-md w-full">
              Save Invoice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddPurchase;

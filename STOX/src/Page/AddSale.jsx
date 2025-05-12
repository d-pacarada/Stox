import React, { useEffect, useState } from 'react';
import SidebarUser from '../assets/Components/SidebarUser';
import Header from "../assets/Components/Header";
import Select from 'react-select';

function AddSale() {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [items, setItems] = useState([{ productId: '', quantity: 1, price: 0, warning: '' }]);
  const [total, setTotal] = useState(0);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchCustomers();
    fetchProducts();
  }, []);

  useEffect(() => {
    const newTotal = items.reduce((sum, item) => sum + item.quantity * item.price, 0);
    setTotal(newTotal);
  }, [items]);

  const fetchCustomers = async () => {
    try {
      const res = await fetch('http://localhost:5064/api/customer/user', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setCustomers(data);
    } catch (err) {
      console.error("Failed to fetch customers", err);
    }
  };

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

  const handleProductChange = (index, selectedOption) => {
    const newItems = [...items];
    newItems[index].productId = selectedOption.value;
    newItems[index].price = selectedOption.price;
    newItems[index].quantity = 1;
    newItems[index].warning = '';
    setItems(newItems);
  };

  const handleQuantityChange = (index, quantity) => {
    const newItems = [...items];
    const selectedOption = productOptions.find(
      (p) => p.value === parseInt(newItems[index].productId)
    );

    newItems[index].quantity = parseInt(quantity) || 0;

    if (selectedOption && newItems[index].quantity > selectedOption.stock) {
      newItems[index].warning = `Only ${selectedOption.stock} in stock`;
    } else {
      newItems[index].warning = '';
    }

    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { productId: '', quantity: 1, price: 0, warning: '' }]);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      const updatedItems = [...items];
      updatedItems.splice(index, 1);
      setItems(updatedItems);
    }
  };

  const formatCurrency = (val) => val.toLocaleString('de-DE', { minimumFractionDigits: 2 });

  const customerOptions = customers.map(c => ({
    value: c.customer_ID,
    label: c.full_Name
  }));

  const productOptions = products.map(p => ({
    value: p.product_ID,
    label: `${p.product_Name} (Stock: ${p.stock_Quantity})`,
    price: p.price,
    stock: p.stock_Quantity
  }));

  return (
    <div className="flex flex-col min-h-screen md:flex-row">
      <SidebarUser />
      <div className="flex-1 p-4 md:p-8 flex flex-col">
        <Header />

        <div className="flex justify-center mt-10 lg:mt-20">
          <div className="max-w-xl w-full p-6">
            <h2 className="text-2xl font-bold mb-4 text-[#112D4E]">Invoice</h2>

            <label className="text-sm font-semibold">Customer</label>
            <Select
              options={customerOptions}
              value={customerOptions.find(c => c.value === parseInt(selectedCustomer))}
              onChange={(selectedOption) => setSelectedCustomer(selectedOption.value)}
              placeholder="Select customer"
              className="mb-6"
            />

            <div className="grid grid-cols-5 gap-2 font-semibold text-sm mb-2">
              <div className="col-span-2">Product</div>
              <div>Qty</div>
              <div>Price</div>
              <div>Amount</div>
            </div>

            {items.map((item, index) => {
              const selectedProduct = productOptions.find(p => p.value === parseInt(item.productId));
              const amount = item.quantity * item.price;

              return (
                <div key={index}>
                  <div className="grid grid-cols-5 gap-2 mb-1 items-center relative">
                    <div className="col-span-2">
                      <Select
                        options={productOptions}
                        value={selectedProduct}
                        onChange={(option) => handleProductChange(index, option)}
                        placeholder="Select product"
                        className="text-sm"
                      />
                    </div>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(index, e.target.value)}
                      className="border px-2 py-1 rounded-md text-center"
                    />
                    <input
                      type="text"
                      readOnly
                      value={formatCurrency(item.price)}
                      className="border px-2 py-1 rounded-md bg-gray-100 text-center"
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

                  {item.warning && (
                    <div className="text-red-600 text-xs mb-2">{item.warning}</div>
                  )}
                </div>
              );
            })}

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

            <button className="bg-[#112D4E] hover:bg-[#0b213f] text-white px-6 py-2 rounded-md w-full">
              Save Invoice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddSale;

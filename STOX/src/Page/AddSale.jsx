import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import SidebarUser from '../assets/Components/SidebarUser';
import Header from "../assets/Components/Header";
import Select from 'react-select';

function AddSale() {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [items, setItems] = useState([{ productId: '', quantity: 1, price: 0, warning: '' }]);
  const [total, setTotal] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const token = localStorage.getItem('token');
  const navigate = useNavigate();

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

    newItems[index].warning = selectedOption.stock === 0 ? 'This product is out of stock!' : '';
    setItems(newItems);
  };

  const handleQuantityChange = (index, quantity) => {
    const newItems = [...items];
    const selectedOption = productOptions.find(p => p.value === parseInt(newItems[index].productId));

    newItems[index].quantity = parseInt(quantity) || 0;

    if (selectedOption && newItems[index].quantity > selectedOption.stock) {
      newItems[index].warning = `Only ${selectedOption.stock} in stock`;
    } else if (selectedOption && selectedOption.stock === 0) {
      newItems[index].warning = 'This product is out of stock!';
    } else if (newItems[index].quantity <= 0) {
      newItems[index].warning = 'Quantity must be greater than 0';
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

  const handleSubmit = async () => {
    setErrorMessage("");

    if (!selectedCustomer || items.length === 0) {
      setErrorMessage("Please select a customer and add at least one item.");
      return;
    }

    if (items.some(item => !item.productId)) {
      setErrorMessage("Please select a product for each item.");
      return;
    }

    if (items.some(item => item.quantity <= 0)) {
      setErrorMessage("All quantities must be greater than 0.");
      return;
    }

    if (items.some(item => {
      const selected = productOptions.find(p => p.value === parseInt(item.productId));
      return selected?.stock === 0;
    })) {
      setErrorMessage("One or more products are out of stock. Please remove or change them before submitting.");
      return;
    }

    const mappedItems = items.map(item => ({
      product_ID: parseInt(item.productId),
      quantity: item.quantity,
      price: item.price
    }));

    const payload = {
      customer_ID: selectedCustomer,
      total_Amount: total,
      items: mappedItems
    };

    try {
      const res = await fetch("http://localhost:5064/api/invoice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error(await res.text());

      setShowSuccessModal(true);
      setSelectedCustomer('');
      setItems([{ productId: '', quantity: 1, price: 0, warning: '' }]);
      setTotal(0);
    } catch (err) {
      setErrorMessage("Failed to save invoice: " + err.message);
    }
  };

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

  const isSubmitDisabled = items.some(item => item.warning);

  return (
    <div className="flex flex-col min-h-screen md:flex-row overflow-hidden">
      <SidebarUser />
      <div className="flex-1 p-4 md:p-0 flex flex-col relative">
        <Header />
        <div className="flex justify-center mt-10 2xl:mt-35 xl:mt-10">
          <div className="max-w-xl w-full max-h-screen">
            <div className="relative mb-5">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="absolute left-0 text-sm font-medium text-gray-800 hover:text-amber-500 lg:mt-2 cursor-pointer"
              >
                &lt;&lt; Back
              </button>
              <h2 className="text-2xl font-bold text-center text-[#112D4E]">Invoice</h2>
            </div>

            <label className="text-sm font-semibold">Customer</label>
            <Select
              options={customerOptions}
              value={customerOptions.find(c => c.value === parseInt(selectedCustomer))}
              onChange={(selectedOption) => setSelectedCustomer(selectedOption.value)}
              placeholder="Select customer"
              className="mb-3"
              menuPortalTarget={document.body}
              styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
            />

            <div className="grid grid-cols-5 gap-2 font-semibold text-sm mb-2">
              <div className="col-span-2">Product</div>
              <div>Quantity</div>
              <div>Price</div>
              <div>Amount</div>
            </div>

            <div className="max-h-80 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
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
                          menuPortalTarget={document.body}
                          styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
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
              <div className="text-red-600 text-sm font-medium mb-4 text-center">
                {errorMessage}
              </div>
            )}

            <button
              onClick={handleSubmit}
              className={`text-white px-6 py-2 rounded-md w-full cursor-pointer ${isSubmitDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#112D4E] hover:bg-[#0b213f]'}`}
              disabled={isSubmitDisabled}
            >
              Save Invoice
            </button>
          </div>
        </div>

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="absolute inset-0 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-md w-96 text-center border border-[#112D4E]">
              <h2 className="text-xl font-semibold text-green-700">Invoice Saved!</h2>
              <p className="mt-2 text-gray-700">The invoice has been recorded successfully.</p>
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  navigate("/Sale");
                }}
                className="mt-4 px-6 py-2 bg-[#112D4E] text-white rounded hover:bg-[#0b213f]"
              >
                Go to Invoice List
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AddSale;

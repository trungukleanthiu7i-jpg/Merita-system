import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/AddProduct.scss";

const AddProduct = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    unitsPerBox: "",
    image: "",
    stoc: "in stoc", // default stock value
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Ensure stoc values are normalized
    if (name === "stoc") {
      setForm({ ...form, [name]: value.trim().toLowerCase() });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Send the entire form including the chosen stock value
      await axios.post("http://localhost:5000/api/products", form);

      alert("Product added successfully!");
      navigate("/admin");
    } catch (err) {
      console.error("Add product error:", err.response?.data || err);
      alert("Error adding product. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="addproduct-page">
      <h1>Add Product</h1>
      <form onSubmit={handleSubmit} className="product-form">
        <input
          type="text"
          name="name"
          placeholder="Product Name"
          required
          onChange={handleChange}
        />

        <textarea
          name="description"
          placeholder="Description (optional)"
          onChange={handleChange}
        />

        <input
          type="number"
          name="price"
          placeholder="Price"
          required
          min="0"
          step="0.01"
          onChange={handleChange}
        />

        <input
          type="text"
          name="category"
          placeholder="Category"
          required
          onChange={handleChange}
        />

        <input
          type="number"
          name="unitsPerBox"
          placeholder="Units per Box"
          required
          min="1"
          onChange={handleChange}
        />

        <input
          type="text"
          name="image"
          placeholder="Image URL (optional)"
          onChange={handleChange}
        />

        {/* Stock status selection */}
        <label htmlFor="stoc">Stock Status:</label>
        <select
          name="stoc"
          id="stoc"
          value={form.stoc}
          onChange={handleChange}
          required
        >
          <option value="in stoc">In Stock</option>
          <option value="out of stoc">Out of Stock</option>
        </select>

        <button type="submit" disabled={loading}>
          {loading ? "Adding..." : "Add Product"}
        </button>
      </form>
    </div>
  );
};

export default AddProduct;

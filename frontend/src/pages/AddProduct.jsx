// src/pages/AddProduct.jsx
import React, { useState } from "react";
import axiosClient from "../api/axiosClient";  // ← FOARTE IMPORTANT
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
    stoc: "in stoc",
    barcode: "", // ✅ cod de bare opțional
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

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
      // Salvează codul de bare ca număr sau null dacă e gol
      const payload = {
        ...form,
        barcode: form.barcode ? form.barcode : null,
      };

      // ★ FOLOSEȘTE axiosClient, NU axios + localhost!!!
      await axiosClient.post("/products", payload);

      alert("Produsul a fost adăugat cu succes!");
      navigate("/admin");
    } catch (err) {
      console.error("Eroare la adăugarea produsului:", err.response?.data || err);
      alert("Eroare la adăugarea produsului. Verifică consola pentru detalii.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="addproduct-page">
      <h1>Adaugă Produs</h1>
      <form onSubmit={handleSubmit} className="product-form">
        <input
          type="text"
          name="name"
          placeholder="Nume Produs"
          required
          onChange={handleChange}
        />

        <textarea
          name="description"
          placeholder="Descriere (opțional)"
          onChange={handleChange}
        />

        <input
          type="number"
          name="price"
          placeholder="Preț (RON)"
          required
          min="0"
          step="0.01"
          onChange={handleChange}
        />

        <input
          type="text"
          name="category"
          placeholder="Categorie"
          required
          onChange={handleChange}
        />

        <input
          type="number"
          name="unitsPerBox"
          placeholder="Unități per cutie"
          required
          min="1"
          onChange={handleChange}
        />

        <input
          type="text"
          name="image"
          placeholder="URL Imagine (opțional)"
          onChange={handleChange}
        />

        {/* ✅ Cod de bare opțional */}
        <input
          type="text"
          name="barcode"
          placeholder="Număr cod de bare (opțional)"
          onChange={handleChange}
        />

        <label htmlFor="stoc">Stare stoc:</label>
        <select
          name="stoc"
          id="stoc"
          value={form.stoc}
          onChange={handleChange}
          required
        >
          <option value="in stoc">În Stoc</option>
          <option value="out of stoc">Stoc Epuizat</option>
        </select>

        <button type="submit" disabled={loading}>
          {loading ? "Se adaugă..." : "Adaugă Produs"}
        </button>
      </form>
    </div>
  );
};

export default AddProduct;

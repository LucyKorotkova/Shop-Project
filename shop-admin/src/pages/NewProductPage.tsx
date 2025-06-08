import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function NewProductPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const response = await axios.post("/api/products", {
      title,
      description,
      price: price ? Number(price) : null,
    });
    if (response.status === 201) {
      const product = response.data;
      navigate(`/${product.id}`);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Создать товар</h2>
      <input placeholder="Название" value={title} onChange={e => setTitle(e.target.value)} required />
      <textarea placeholder="Описание" value={description} onChange={e => setDescription(e.target.value)} />
      <input type="number" placeholder="Цена" value={price} onChange={e => setPrice(e.target.value)} />
      <button type="submit">Сохранить</button>
    </form>
  );
}

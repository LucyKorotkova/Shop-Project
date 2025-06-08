import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

export default function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Для формы комментария
  const [form, setForm] = useState({ name: "", email: "", body: "" });
  const [commentLoading, setCommentLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    axios.get(`/api/products/${id}`).then(res => setProduct(res.data)).finally(() => setLoading(false));
    axios.get(`/api/products/${id}/related`).then(res => setRelated(res.data));
  }, [id]);

  function handleCommentSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCommentLoading(true);
    axios.post("/api/comments", {
      ...form,
      productId: id
    }).then(() => {
      setForm({ name: "", email: "", body: "" });
      // Обновить комментарии
      axios.get(`/api/products/${id}`).then(res => setProduct(res.data));
    }).finally(() => setCommentLoading(false));
  }

  if (loading || !product) return <p>Загрузка...</p>;

  return (
    <div>
      <h2>{product.title}</h2>
      <img
        src={product.images?.[0]?.url || "/placeholder.png"}
        alt={product.title}
        style={{ width: 200, height: 200, objectFit: "cover" }}
      />
      <div>Цена: {product.price}</div>
      <div>Описание: {product.description}</div>

      <h3>Похожие товары</h3>
      <ul>
        {related.map(r => (
          <li key={r.id}>
            <Link to={`/${r.id}`}>{r.title}</Link> — {r.price}
          </li>
        ))}
      </ul>

      <h3>Комментарии</h3>
      <ul>
        {product.comments?.map((c: any) => (
          <li key={c.id}>
            <b>{c.name}</b> ({c.email}):<br />
            {c.body}
          </li>
        ))}
      </ul>

      <h4>Добавить комментарий</h4>
      <form onSubmit={handleCommentSubmit}>
        <input
          placeholder="Заголовок"
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          required
        />
        <input
          placeholder="E-mail"
          value={form.email}
          onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          required
        />
        <textarea
          placeholder="Текст комментария"
          value={form.body}
          onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
          required
        />
        <button type="submit" disabled={commentLoading}>Сохранить</button>
      </form>
    </div>
  );
}

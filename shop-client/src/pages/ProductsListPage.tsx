import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

export default function ProductsListPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [filter, setFilter] = useState({ title: "", priceFrom: "", priceTo: "" });
  const [loading, setLoading] = useState(true);

  function fetchProducts() {
    setLoading(true);
    const params: any = {};
    if (filter.title) params.title = filter.title;
    if (filter.priceFrom) params.priceFrom = filter.priceFrom;
    if (filter.priceTo) params.priceTo = filter.priceTo;
    axios.get("/api/products/search", { params })
      .then(res => setProducts(res.data))
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchProducts(); }, []);

  return (
    <div>
      <h2>Список товаров ({products.length})</h2>
      <form onSubmit={e => { e.preventDefault(); fetchProducts(); }}>
        <input
          placeholder="Название"
          value={filter.title}
          onChange={e => setFilter(f => ({ ...f, title: e.target.value }))}
        />
        <input
          type="number"
          placeholder="Цена от"
          value={filter.priceFrom}
          onChange={e => setFilter(f => ({ ...f, priceFrom: e.target.value }))}
        />
        <input
          type="number"
          placeholder="Цена до"
          value={filter.priceTo}
          onChange={e => setFilter(f => ({ ...f, priceTo: e.target.value }))}
        />
        <button type="submit">Фильтр</button>
      </form>
      {loading ? <p>Загрузка...</p> : (
        <ul>
          {products.map(p => (
            <li key={p.id}>
              <Link to={`/${p.id}`}>
                <h3>{p.title}</h3>
                <img
                  src={p.images?.[0]?.url || "/placeholder.png"}
                  alt={p.title}
                  style={{ width: 100, height: 100, objectFit: "cover" }}
                />
              </Link>
              <div>Цена: {p.price}</div>
              <div>Комментариев: {p.comments?.length || 0}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

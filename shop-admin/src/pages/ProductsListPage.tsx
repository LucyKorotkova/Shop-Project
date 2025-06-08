import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

export default function ProductsListPage() {
  const [products, setProducts] = useState<any[]>([]);
  useEffect(() => {
    axios.get("/api/products").then(res => setProducts(res.data));
  }, []);
  return (
    <div>
      <h2>Список товаров ({products.length})</h2>
      <Link to="/new-product"><button>Add product</button></Link>
      <ul>
        {products.map(p => (
          <li key={p.id}>
            <Link to={`/${p.id}`}>{p.title}</Link> — {p.price}
          </li>
        ))}
      </ul>
    </div>
  );
}

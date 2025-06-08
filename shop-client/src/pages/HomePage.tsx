import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function HomePage() {
  const [count, setCount] = useState<number>(0);
  const [sum, setSum] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("/api/products").then(res => {
      setCount(res.data.length);
      setSum(res.data.reduce((acc: number, p: any) => acc + (p.price || 0), 0));
      setLoading(false);
    });
  }, []);

  return (
    <div>
      <h1>Shop.Client</h1>
      {loading ? <p>Загрузка...</p> : (
        <p>В базе данных находится {count} товаров общей стоимостью {sum}</p>
      )}
      <Link to="/products-list">
        <button>Перейти к списку товаров</button>
      </Link>
      <a href="/admin" target="_blank" rel="noopener noreferrer">
        <button>Перейти в систему администрирования</button>
      </a>
    </div>
  );
}

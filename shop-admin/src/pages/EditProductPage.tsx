import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function EditProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);

  useEffect(() => {
    axios.get(`/api/products/${id}`).then(res => setProduct(res.data));
  }, [id]);

  if (!product) return <p>Загрузка...</p>;

  return (
    <div>
      <h2>Редактировать товар: {product.title}</h2>
      {/* Форма редактирования */}
      {/* Блок управления похожими товарами */}
      {/* Блок управления изображениями и комментариями */}
    </div>
  );
}

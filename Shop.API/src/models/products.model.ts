import { connection } from "../../index";
import { RowDataPacket } from "mysql2";

// Получить id похожих товаров
export async function getRelatedProducts(productId: string) {
  if (!connection) throw new Error("No DB connection");
  const [rows] = await connection.query<RowDataPacket[]>(
    "SELECT related_id FROM related_products WHERE product_id = ?",
    [productId]
  );
  return (rows as { related_id: string }[]).map(r => r.related_id);
}

// Добавить связи похожих товаров
export async function addRelatedProducts(pairs: { productId: string, relatedId: string }[]) {
  if (!connection) throw new Error("No DB connection");
  if (!pairs.length) return;
  const values = pairs.map(pair => [pair.productId, pair.relatedId]);
  await connection.query(
    "INSERT IGNORE INTO related_products (product_id, related_id) VALUES " +
    values.map(() => "(?, ?)").join(","),
    values.flat()
  );
}

// Удалить все связи для массива товаров
export async function deleteRelatedProducts(productIds: string[]) {
  if (!connection) throw new Error("No DB connection");
  if (!productIds.length) return;
  await connection.query(
    `DELETE FROM related_products WHERE product_id IN (${productIds.map(() => '?').join(',')})`,
    productIds
  );
}

// Для формы обновления товара: обновить связи
export async function updateRelatedProducts(productId: string, newRelatedIds: string[]) {
  await deleteRelatedProducts([productId]);
  const pairs = newRelatedIds.map(relatedId => ({ productId, relatedId }));
  await addRelatedProducts(pairs);
}

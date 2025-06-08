export const COMMENT_DUPLICATE_QUERY = `
  SELECT * FROM comments
  WHERE LOWER(email) = ?
    AND LOWER(name) = ?
    AND LOWER(body) = ?
    AND product_id = ?
`;

export const INSERT_COMMENT_QUERY = `
  INSERT INTO comments (comment_id, email, name, body, product_id)
  VALUES (?, ?, ?, ?, ?);
`;

export const INSERT_PRODUCT_QUERY = `
  INSERT INTO products
  (product_id, title, description, price)
  VALUES (?, ?, ?, ?)
`;

import { IProductSearchFilter } from "../types";

export const getProductsFilterQuery = (
    filter: IProductSearchFilter
): [string, any[]] => {
    const { title, description, priceFrom, priceTo } = filter;

    let query = "SELECT * FROM products WHERE ";
    const values: any[] = [];

    if (title) {
        query += "title LIKE ? ";
        values.push(`%${title}%`);
    }

    if (description) {
        if (values.length) {
            query += "OR ";
        }
        query += "description LIKE ? ";
        values.push(`%${description}%`);
    }

    if (priceFrom || priceTo) {
        if (values.length) {
            query += "OR ";
        }
        query += "(price > ? AND price < ?)";
        values.push(priceFrom || 0);
        values.push(priceTo || 999999);
    }

    return [query, values];
};

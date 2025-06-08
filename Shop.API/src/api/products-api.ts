import { Router, Request, Response } from "express";
import { connection } from "../../index";
import { v4 as uuidv4 } from "uuid";
import { OkPacket } from "mysql2";
import { body, validationResult } from "express-validator";
import { IProductEntity, ICommentEntity, ProductCreatePayload, IProductSearchFilter } from "../types";
import { mapProductsEntity, mapCommentsEntity, enhanceProductsComments } from "../services/mapping";
import { getProductsFilterQuery, INSERT_PRODUCT_QUERY } from "../services/queries";
import { getRelatedProducts, addRelatedProducts, deleteRelatedProducts, updateRelatedProducts } from "../models/products.model";

export const productsRouter = Router();

const throwServerError = (res: Response, e: any) => {
    console.debug(e.message);
    res.status(500).send("Something went wrong");
};

productsRouter.get('/:id/related', async (req, res) => {
  try {
    const { id } = req.params;
    const relatedIds = await getRelatedProducts(id);
    if (!relatedIds.length) {
      res.status(200).send([]);
      return;
    }
    const [products] = await connection.query<IProductEntity[]>(
      `SELECT * FROM products WHERE product_id IN (${relatedIds.map(() => '?').join(',')})`,
      relatedIds
    );
    res.send(mapProductsEntity(products));
  } catch (e) {
    throwServerError(res, e);
  }
});

productsRouter.post(
  '/related',
  body().isArray({ min: 1 }),
  body('*.productId').isString().notEmpty(),
  body('*.relatedId').isString().notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }
    res.status(201).send("Related products added");
  }
);

// DELETE /products/related
productsRouter.delete(
  '/related',
  body().isArray({ min: 1 }),
  body('*').isString().notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }
    try {
      await deleteRelatedProducts(req.body);
      res.status(200).send("Related products deleted");
    } catch (e) {
      throwServerError(res, e);
    }
  }
);



// Поиск по фильтру (должен быть ДО /:id)
productsRouter.get('/search', async (
    req: Request<{}, {}, {}, IProductSearchFilter>,
    res: Response
) => {
    try {
        const [query, values] = getProductsFilterQuery(req.query);
        const [rows] = await connection.query<IProductEntity[]>(query, values);

        if (!rows?.length) {
            res.status(200).send([]);
            return;
        }

        const [commentRows] = await connection.query<ICommentEntity[]>(
            "SELECT * FROM comments"
        );

        const products = mapProductsEntity(rows);
        const result = enhanceProductsComments(products, commentRows);

        res.send(result);
    } catch (e) {
        throwServerError(res, e);
    }
});

// Список всех товаров с комментариями
productsRouter.get('/', async (req: Request, res: Response) => {
    try {
        const [productRows] = await connection.query<IProductEntity[]>("SELECT * FROM products");
        const [commentRows] = await connection.query<ICommentEntity[]>("SELECT * FROM comments");

        const products = mapProductsEntity(productRows);
        const result = enhanceProductsComments(products, commentRows);

        res.send(result);
    } catch (e) {
        throwServerError(res, e);
    }
});

// Получить товар по id
productsRouter.get('/:id', async (
    req: Request<{ id: string }>,
    res: Response
) => {
    try {
        const [rows] = await connection.query<IProductEntity[]>(
            "SELECT * FROM products WHERE product_id = ?",
            [req.params.id]
        );

        if (!rows?.[0]) {
            res.status(404).send(`Product with id ${req.params.id} is not found`);
            return;
        }

        const [comments] = await connection.query<ICommentEntity[]>(
            "SELECT * FROM comments WHERE product_id = ?",
            [req.params.id]
        );

        const product = mapProductsEntity(rows)[0];

        if (comments.length) {
            product.comments = mapCommentsEntity(comments);
        }

        res.send(product);
    } catch (e) {
        throwServerError(res, e);
    }
});

// Добавить товар
productsRouter.post('/', async (
    req: Request<{}, {}, ProductCreatePayload>,
    res: Response
) => {
    try {
        const { title, description, price } = req.body;
        const id = uuidv4();
        await connection.query<OkPacket>(
            INSERT_PRODUCT_QUERY,
            [id, title || null, description || null, price || null]
        );
        // Вернуть созданный товар
        const [rows] = await connection.query<IProductEntity[]>(
            "SELECT * FROM products WHERE product_id = ?",
            [id]
        );
        const product = mapProductsEntity(rows)[0];
        res.status(201).json(product);
    } catch (e) {
        throwServerError(res, e);
    }
});

// Удалить товар
productsRouter.delete('/:id', async (
    req: Request<{ id: string }>,
    res: Response
) => {
    try {
        const [info] = await connection.query<OkPacket>(
            "DELETE FROM products WHERE product_id = ?",
            [req.params.id]
        );

        if (info.affectedRows === 0) {
            res.status(404).send(`Product with id ${req.params.id} is not found`);
            return;
        }

        res.status(200).end();
    } catch (e: any) {
        if (e.code === 'ER_ROW_IS_REFERENCED_2') {
            res.status(409).send("Cannot delete product: it is referenced in related_products");
        } else {
            throwServerError(res, e);
        }
    }
});

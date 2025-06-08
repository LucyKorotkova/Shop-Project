import { Router, Request, Response } from "express";
import { connection } from "../../index";
import { v4 as uuidv4 } from "uuid";
import { OkPacket } from "mysql2";
import { IComment } from "@Shared/types";      
import { ICommentEntity } from "../types";
import { mapCommentEntity, mapCommentsEntity } from "../services/mapping";
import { validateComment } from "../helpers";
import { COMMENT_DUPLICATE_QUERY, INSERT_COMMENT_QUERY } from "../services/queries";

export const commentsRouter = Router();

const throwServerError = (res: Response, e: any) => {
    console.debug(e.message);
    res.status(500).send("Something went wrong");
};

// GET all comments
commentsRouter.get("/", async (req, res) => {
    try {
        const [rows] = await connection.query<ICommentEntity[]>("SELECT * FROM comments");
        res.status(200).send(mapCommentsEntity(rows));
    } catch (e: any) {
        throwServerError(res, e);
    }
});

// GET comment by id
commentsRouter.get("/:id", async (req, res) => {
    try {
        const [rows] = await connection.query<ICommentEntity[]>(
            "SELECT * FROM comments WHERE comment_id = ?",
            [req.params.id]
        );
        if (!rows.length) {
            res.status(404).send(`Comment with id ${req.params.id} is not found`);
            return;
        }
        res.status(200).send(mapCommentEntity(rows[0]));
    } catch (e: any) {
        throwServerError(res, e);
    }
});

// POST create comment
commentsRouter.post("/", async (req, res) => {
    const validationResult = validateComment(req.body);
    if (validationResult) {
        res.status(400).send(validationResult);
        return;
    }
    try {
        const { name, email, body, productId } = req.body;
        const [sameResult] = await connection.query<ICommentEntity[]>(
            COMMENT_DUPLICATE_QUERY,
            [email.toLowerCase(), name.toLowerCase(), body.toLowerCase(), productId]
        );
        if (sameResult.length) {
            res.status(422).send("Comment with the same fields already exists");
            return;
        }
        const id = uuidv4();
        await connection.query<OkPacket>(
            INSERT_COMMENT_QUERY,
            [id, email, name, body, productId]
        );
        // Вернуть созданный комментарий
        const [rows] = await connection.query<ICommentEntity[]>(
            "SELECT * FROM comments WHERE comment_id = ?",
            [id]
        );
        res.status(201).json(mapCommentEntity(rows[0]));
    } catch (e: any) {
        throwServerError(res, e);
    }
});

// PATCH update or create comment
commentsRouter.patch("/", async (req, res) => {
    try {
        let updateQuery = "UPDATE comments SET ";
        const valuesToUpdate: any[] = [];
        ["name", "body", "email"].forEach(fieldName => {
            if (req.body.hasOwnProperty(fieldName)) {
                if (valuesToUpdate.length) updateQuery += ", ";
                updateQuery += `${fieldName} = ?`;
                valuesToUpdate.push(req.body[fieldName]);
            }
        });
        updateQuery += " WHERE comment_id = ?";
        valuesToUpdate.push(req.body.id);

        const [info] = await connection.query<OkPacket>(updateQuery, valuesToUpdate);

        if (info.affectedRows === 1) {
            // Вернуть обновлённый комментарий
            const [rows] = await connection.query<ICommentEntity[]>(
                "SELECT * FROM comments WHERE comment_id = ?",
                [req.body.id]
            );
            res.status(200).json(mapCommentEntity(rows[0]));
            return;
        }

        // Если не найден — создать новый
        const newComment = req.body as IComment;
        const validationResult = validateComment(newComment);
        if (validationResult) {
            res.status(400).send(validationResult);
            return;
        }
        const id = uuidv4();
        await connection.query<OkPacket>(
            INSERT_COMMENT_QUERY,
            [id, newComment.email, newComment.name, newComment.body, newComment.productId]
        );
        const [rows] = await connection.query<ICommentEntity[]>(
            "SELECT * FROM comments WHERE comment_id = ?",
            [id]
        );
        res.status(201).json(mapCommentEntity(rows[0]));
    } catch (e: any) {
        throwServerError(res, e);
    }
});

// DELETE comment by id
commentsRouter.delete("/:id", async (req, res) => {
    try {
        const [result] = await connection.query<OkPacket>(
            "DELETE FROM comments WHERE comment_id = ?",
            [req.params.id]
        );
        if (result.affectedRows === 0) {
            res.status(404).send(`Comment with id ${req.params.id} not found`);
            return;
        }
        res.status(200).end();
    } catch (e: any) {
        throwServerError(res, e);
    }
});

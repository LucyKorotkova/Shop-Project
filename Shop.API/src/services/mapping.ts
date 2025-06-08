import { IComment, IProduct } from "@Shared/types";
import { ICommentEntity, IProductEntity } from "../types";

export const mapCommentEntity = ({
    comment_id, product_id, ...rest
}: ICommentEntity): IComment => ({
    id: comment_id,
    productId: product_id,
    ...rest
});

export const mapCommentsEntity = (data: ICommentEntity[]): IComment[] =>
    data.map(mapCommentEntity);

export const mapProductsEntity = (data: IProductEntity[]): IProduct[] =>
    data.map(({ product_id, title, description, price }) => ({
        id: product_id,
        title: title || "",
        description: description || "",
        price: Number(price) || 0
    }));

export const enhanceProductsComments = (
    products: IProduct[],
    commentRows: ICommentEntity[]
): IProduct[] => {
    const commentsByProductId = new Map<string, IComment[]>();

    for (let commentEntity of commentRows) {
        const comment = mapCommentEntity(commentEntity);
        if (!commentsByProductId.has(comment.productId)) {
            commentsByProductId.set(comment.productId, []);
        }
        const list = commentsByProductId.get(comment.productId)!;
        commentsByProductId.set(comment.productId, [...list, comment]);
    }

    for (let product of products) {
        if (commentsByProductId.has(product.id)) {
            product.comments = commentsByProductId.get(product.id);
        }
    }

    return products;
};

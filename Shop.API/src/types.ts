import { RowDataPacket } from "mysql2";
import { IProduct, IComment, IProductImage } from "../../Shared/types";

export interface IProductEntity extends RowDataPacket {
  product_id: string;
  title: string;
  description: string;
  price: number;
}

export interface ICommentEntity extends RowDataPacket {
  comment_id: string;
  name: string;
  email: string;
  body: string;
  product_id: string;
}

export interface IProductSearchFilter {
  title?: string;
  description?: string;
  priceFrom?: number;
  priceTo?: number;
}

export type ProductCreatePayload = Omit<IProduct, "id" | "comments">;
import { Product } from "./product";

export class OrderDetail {
    id?: string;
    product?: Product;
    qty?: number;
    price?: number;
    total?: number | undefined;
    order?: {
        id?: string;
    }
}
import { Product } from "./product";
import { Status } from "../_helpers/enums/status";
import { CutOff } from "@app/_helpers/enums/prod-inv";

export class ProductIn {
    id?: string;
    description?: string;
    status?: Status;
    product?: Product;
    qty?: number;
    transaction_date?: Date;
    cutoff?: CutOff;
}
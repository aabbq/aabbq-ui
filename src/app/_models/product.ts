import { Status } from "../_helpers/enums/status";
import { UOM } from "../_helpers/enums/uom";

export class Product {
    id?: string;
    name?: string;
    description?: string;
    uom?: UOM;
    status?: Status;
    qty?: number;
    category?: string;
}
import { CutOff } from "@app/_helpers/enums/prod-inv";
import { OrderType } from "../_helpers/enums/order-type";
import { PaymentType } from "../_helpers/enums/payment-type";
import { Bank } from "./bank";

export class Order {
    id?: string;
    or_number?: string;
    ordered_to?: string;
    transaction_date?: Date;
    details?: any;
    order?: {
        id?: string;
    };
    total_amount?: number;
    payment_type?: PaymentType;
    order_type?: OrderType;
    cash_amount?: number;
    gcash_amount?: number;
    grab_amount?: number;
    panda_amount?: number;
    credit_card?: boolean;
    credit_card_amount?: number;
    credit_card_bank?: string;
    credit_card_ref_num?: string;
    total_discount?: number;
    cutoff?: CutOff;
}
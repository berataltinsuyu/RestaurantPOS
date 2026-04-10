import {
  BillItemRecord,
  BillRecord,
  PaymentRecord,
  RestaurantTableRecord,
} from "./domain";

export type RealtimeTopic = "restaurantTables" | "bills" | "payments";

export interface Database {
  public: {
    Tables: {
      RestaurantTables: {
        Row: RestaurantTableRecord;
      };
      Bills: {
        Row: BillRecord;
      };
      BillItems: {
        Row: BillItemRecord;
      };
      Payments: {
        Row: PaymentRecord;
      };
    };
  };
}

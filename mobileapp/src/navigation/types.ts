import { ROUTES } from "../constants/routes";

export type RootStackParamList = {
  [ROUTES.LOGIN]: undefined;
  [ROUTES.TABLES_OVERVIEW]: undefined;
  [ROUTES.TABLE_DETAIL]: {
    tableId: string;
  };
  [ROUTES.ORDER_DETAIL]: {
    tableId: string;
  };
  [ROUTES.MENU_SELECTION]: {
    tableId: string;
  };
  [ROUTES.PAYMENT]: {
    tableId: string;
  };
  [ROUTES.SPLIT_PAYMENT]: {
    tableId: string;
  };
  [ROUTES.TABLE_ACTIONS]:
    | {
        tableId?: string;
        initialAction?: "open" | "move" | "merge" | "split";
      }
    | undefined;
  [ROUTES.CARD_POS_REDIRECT]: {
    tableId: string;
    paymentIntentId: string;
  };
  [ROUTES.CONTACTLESS_PROMPT]: {
    tableId: string;
    paymentIntentId: string;
  };
  [ROUTES.PAYMENT_SUCCESS]: {
    tableId: string;
    amount?: number;
    receiptId?: string;
    method?: "card" | "cash" | "split";
  };
};

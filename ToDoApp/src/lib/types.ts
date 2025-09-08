export type ApiStatusResponse = {
  status: number;
  message: string;
};

export type SignInSuccess = {
  status: 200;
  data: {
    id: number;
    fname: string;
    lname: string;
    email: string;
    timemodified: string;
  };
  message: string;
};

export type SignInError = {
  status: 400;
  message: string;
};

export type SignUpBody = {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  confirm_password: string;
};

export type AddItemBody = {
  item_name: string;
  item_description: string;
  user_id: number;
};

export type EditItemBody = {
  item_name: string;
  item_description: string;
  item_id: number;
};

export type ChangeStatusBody = {
  status: "active" | "inactive";
  item_id: number;
};

export type TodoItem = {
  item_id: number;
  item_name: string;
  item_description: string;
  status: "active" | "inactive";
  user_id: number;
  timemodified: string;
};

export type GetItemsSuccess = {
  status: 200;
  data: Record<string, TodoItem>;
  count: string;
};

export type ApiError = {
  status: number;
  message: string;
};



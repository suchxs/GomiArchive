import { apiGet, apiSendJson } from "./api";
import type {
  AddItemBody,
  ChangeStatusBody,
  EditItemBody,
  GetItemsSuccess,
  SignInError,
  SignInSuccess,
  SignUpBody,
  ApiStatusResponse,
} from "./types";

export async function signUp(body: SignUpBody): Promise<ApiStatusResponse> {
  // Send JSON as per the documentation example
  const trimmed = {
    first_name: body.first_name.trim(),
    last_name: body.last_name.trim(),
    email: body.email.trim(),
    password: body.password,
    confirm_password: body.confirm_password,
  } as unknown as Record<string, unknown>;
  return apiSendJson<ApiStatusResponse>("/signup_action.php", "POST", trimmed);
}

export async function signIn(email: string, password: string): Promise<SignInSuccess | SignInError> {
  return apiGet<SignInSuccess | SignInError>("/signin_action.php", { email, password });
}

export async function getItems(status: "active" | "inactive", user_id: number): Promise<GetItemsSuccess | { status: number; message: string }> {
  return apiGet<GetItemsSuccess | { status: number; message: string }>("/getItems_action.php", { status, user_id });
}

export async function addItem(body: AddItemBody) {
  return apiSendJson("/addItem_action.php", "POST", body as unknown as Record<string, unknown>);
}

export async function editItem(body: EditItemBody) {
  return apiSendJson("/editItem_action.php", "PUT", body as unknown as Record<string, unknown>);
}

export async function changeItemStatus(body: ChangeStatusBody) {
  return apiSendJson("/statusItem_action.php", "PUT", body as unknown as Record<string, unknown>);
}

export async function deleteItem(item_id: number) {
  return apiGet("/deleteItem_action.php", { item_id });
}



import { BaseResponse } from "./BaseResponse";

export interface RedeemInterface extends BaseResponse {
  code: string;
  quote: number;
  value: number;
  users: string[];
}

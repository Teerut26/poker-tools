import { BaseResponse } from "./BaseResponse";

export interface RoomInterface extends BaseResponse {
  name: string;
  pot: number;
  users: string[];
  owner: string;
  password: string;
}

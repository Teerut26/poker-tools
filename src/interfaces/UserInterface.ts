import { BaseResponse } from "./BaseResponse";

export interface UserInterface extends BaseResponse {
  id: string;
  collectionId: string;
  collectionName: string;
  created: string;
  updated: string;
  name: string;
  money: number;
}
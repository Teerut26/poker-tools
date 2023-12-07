import { BaseResponse } from "./BaseResponse";
import { UserInterface } from "./UserInterface";

export interface RoomInterface extends BaseResponse {
  name: string;
  pot: number;
  users: string[];
  owner: string;
  password: string;
}

export interface RoomInterfaceExpand extends RoomInterface {
  expand?: {
    users: UserInterface[];
  };
}

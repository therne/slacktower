import { PartialDeep } from "type-fest";

export enum DriverType {
  INMEM = 'in-memory',
}

export type DriverObject = { id: string } & { [key: string]: any };

export interface Driver {
  initialize(): Promise<void>;
  save(value: DriverObject, timeToLiveInMs: number): Promise<void>;
  find(where: PartialDeep<DriverObject>): Promise<DriverObject | undefined>;
  close(): Promise<void>;
}

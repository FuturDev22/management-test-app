import { Module } from "./module.model";

export interface Scenario {
    id?: number;
    name: string;
    description: string;
    module?: Module;
    jobScript?: string;
    jobPath?: string;
  }
  
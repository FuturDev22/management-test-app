import { Scenario } from "./scenario.model";

export interface Module {
    id?: number;
    name: string;
    scenarios?: Scenario[];
  }
  
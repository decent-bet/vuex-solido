import { SolidoProvider, ContractProviderMapping } from "@decent-bet/solido";
import { SolidoContract } from "@decent-bet/solido/lib/core/SolidoContract";
import { SolidoProviderConfig } from "./types";

declare module "vuex/types" {
  export interface ActionContext<S, R> {
    getContract: <T>(
      name: string
    ) => T & SolidoContract & SolidoProvider;

    setup: (
      config: SolidoProviderConfig,
      contractMappings: ContractProviderMapping[]
    ) => void;

    currentConfig: SolidoProviderConfig;
  }
}

export * from "./solidoAction";
export * from "./mutations";
export * from "./types";

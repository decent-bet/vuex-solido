import { ActionContext } from "vuex/types";
import { SolidoProviderConfig } from "./types";
import {
  SolidoProvider,
  ContractProviderMapping,
  SolidoModule,
  ContractCollection,
  SolidoProviderType,
  ThorifySettings,
  ConnexSettings
} from "@decent-bet/solido";
import { SolidoContract } from "@decent-bet/solido";

let MODULE: SolidoModule;
let BINDINGS: ContractCollection;
let MAPPINGS: ContractProviderMapping[];
const CONTRACT_INSTANCES: any = {};
const commitSettings = { root: true };

export const CONFIG: SolidoProviderConfig = {};

export function setup<S, R>(context: ActionContext<S, R>) {
  return (
    config: SolidoProviderConfig,
    contractMappings: ContractProviderMapping[]
  ): void => {
    const { commit } = context;
    const { connex, thorify, web3 } = config;
    CONFIG.connex = connex;
    CONFIG.thorify = thorify;
    CONFIG.web3 = web3;
    MAPPINGS = contractMappings;
    commit("SOLIDO_WALLET_SETUP", { success: true, config: CONFIG }, commitSettings);
  };
}

/**
 *
 * @param {} T The type of the contract
 * @param {S} S The type of the store
 * @param {R} R The type of the root state
 * @param {string} name The name of the contract
 */
function setupContract<T, S, R>(
  { commit }: ActionContext<S, R>,
  name: string
): void {
  try {
    if (!MODULE) {
      MODULE = new SolidoModule(MAPPINGS);
    }

    if (!BINDINGS) {
      BINDINGS = MODULE.bindContracts();
    }

    const contract = BINDINGS.getContract<T>(name);
    const provider = contract.getProviderType();
    
    switch (provider) {
      case SolidoProviderType.Connex:
        const { connex } = CONFIG;
        if (!connex) {
          throw new Error("Connex settings not found.");
        }
        contract.onReady<ConnexSettings>(connex);
        break;

      case SolidoProviderType.Thorify:
        const { thorify } = CONFIG;
        if (!thorify) {
          throw new Error("Thorify settings not found.");
        }
        contract.onReady<ThorifySettings>(thorify);
        break;

      default:
        throw new Error(
          `The Solido provider is not valid: ${provider}.`
        );
    }

    CONTRACT_INSTANCES[name] = contract;
    commit("SOLIDO_ENTITY_LOADED", { success: true, name }, commitSettings);
  } catch (error) {
    const { name, message } = error;
    commit(
      "SOLIDO_ENTITY_LOADED",
      { success: false, name, message },
      commitSettings
    );
    throw error;
  }
}

/**
 *
 * @param {ActionContext<S, R>} context The action context of the store
 */
export function getContract<S, R>(context: ActionContext<S, R>) {
  /**
   * Return a Solido contract instance
   *
   * @param {T extends SolidoContract & SolidoProvider} T the type of the contract
   * @param {ActionContext<S, R>} name The name of the contract
   */
  return <T>(name: string): T & SolidoContract & SolidoProvider => {
    if (!CONTRACT_INSTANCES[name]) {
      setupContract<T, S, R>(context, name);
    }

    return CONTRACT_INSTANCES[name] as T & SolidoContract & SolidoProvider;
  };
}

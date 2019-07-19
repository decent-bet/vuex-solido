import { ActionContext } from "vuex/types";
import { SolidoProviderConfig } from "./types";
import {
  SolidoProvider,
  ContractProviderMapping,
  SolidoModule,
  ContractCollection
} from "@decent-bet/solido";
import { SolidoContract } from "@decent-bet/solido";

let MODULE: SolidoModule;
let BINDINGS: ContractCollection;
const CONTRACT_INSTANCES: any = {};
const commitSettings = { root: true };

class CoreSingleton {
  static module: SolidoModule;
  static providerConfig: SolidoProviderConfig;
}

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
    MODULE = new SolidoModule(contractMappings);

    CoreSingleton.module = new SolidoModule(contractMappings);
    CoreSingleton.providerConfig = config;

    commit("SOLIDO_WALLET_SETUP", { success: true }, commitSettings);
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
      throw new Error('Solido Module not found, please call setup method first.');
    }

    if (!BINDINGS) {
      BINDINGS = MODULE.bindContracts();
    }

    const contract = BINDINGS.getContract<T>(name);
    const providerType = contract.getProviderType();
    const config = CONFIG[providerType];
    if (!config) {
      throw new Error(`Settings for the selected provider not found (provider type: : ${providerType}).`);
    }
    contract.onReady(config);

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

export function bindContracts(name?: string) {

  const { module, providerConfig } = CoreSingleton;
  const { chainTag, defaultAccount, connex } = providerConfig.connex;
  const contracts = module.bindContracts({
    'connex': {
      provider: connex,
      options: {
        defaultAccount,
        from: defaultAccount,
        chainTag
      }
    }
  }).connect();


  if (name) {
    return contracts[name] as SolidoContract & SolidoProvider;
  }
  return contracts;
}

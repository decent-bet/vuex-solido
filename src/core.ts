import { ActionContext } from "vuex/types";
import { SolidoProviderConfig } from "./types";
import {
  SolidoProvider,
  ContractProviderMapping,
  SolidoModule,
  ContractCollection
} from "@decent-bet/solido";
import { SolidoContract } from "@decent-bet/solido";

const COMMIT_SETTINGS = { root: true };
let BINDINGS: ContractCollection = null;
const CONTRACT_INSTANCES: any = {};
let GET_CONFIG: () => Promise<SolidoProviderConfig>;
let MODULE: SolidoModule = null;
let MAPPINGS: ContractProviderMapping[] = null;

export let PROVIDERS_CONFIG: SolidoProviderConfig = null;

export function setup<S, R>(context: ActionContext<S, R>) {
  return (
    contractMappings: ContractProviderMapping[],
    getConfig: () => Promise<SolidoProviderConfig>,
  ): void => {
    const { commit } = context;
    MAPPINGS = [...contractMappings];
    GET_CONFIG = getConfig;
    commit("SOLIDO_WALLET_SETUP", { success: true }, COMMIT_SETTINGS);
  };
}

/**
 *
 * @param {} T The type of the contract
 * @param {S} S The type of the store
 * @param {R} R The type of the root state
 * @param {string} name The name of the contract
 */
async function setupContract<T, S, R>(
  { commit }: ActionContext<S, R>,
  name: string
): Promise<void> {
  try {
    if (!MODULE) {
      if(!MAPPINGS) {
        throw new Error('Contract Mappings not found, please call setup method first.');
      }
      MODULE = new SolidoModule(MAPPINGS);
    }

    if (!BINDINGS) {
      BINDINGS = MODULE.bindContracts();
    }

    const contract = BINDINGS.getContract<T>(name);
    const providerType = contract.getProviderType();

    // lazy load the config
    if(!PROVIDERS_CONFIG) {
      PROVIDERS_CONFIG = await GET_CONFIG();
    }

    const config = PROVIDERS_CONFIG[providerType];
    if (!config) {
      throw new Error(`Settings for the selected provider not found (provider type: : ${providerType}).`);
    }
    contract.onReady(config);

    CONTRACT_INSTANCES[name] = contract;
    commit("SOLIDO_ENTITY_LOADED", { success: true, name }, COMMIT_SETTINGS);
  } catch (error) {
    const { name, message } = error;
    commit(
      "SOLIDO_ENTITY_LOADED",
      { success: false, name, message },
      COMMIT_SETTINGS
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
  return async <T>(name: string): Promise<T & SolidoContract & SolidoProvider> => {
    if (!CONTRACT_INSTANCES[name]) {
      await setupContract<T, S, R>(context, name);
    }

    return CONTRACT_INSTANCES[name] as T & SolidoContract & SolidoProvider;
  };
}

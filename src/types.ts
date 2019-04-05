export interface SolidoLoadedPayload {
    success: boolean;
    name: string;
    error?: string;
}

export interface SolidoSetupPayload {
    success: boolean;
    error?: string;
}

export interface SolidoProviderConfig {
    connex?: ConnexConfig;
    thorify?: ThorifyConfig;
    web3?: any; // TODO: implement
}
/**
 * Configs for thorify 
 */
export interface ThorifyConfig {
    privateKey: string;
    thor: any;    
    chainTag: string;
    defaultAccount: string;
}

/**
 * Configs for connex 
 */
export class ConnexConfig {
    connex: any; // Connex instance from @vechain/connex
    chainTag: string;
    defaultAccount: string;
}
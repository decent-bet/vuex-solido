
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
    connex?: any;
    thorify?: any;
    web3?: any; // TODO: implement
}
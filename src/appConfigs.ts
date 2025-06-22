
export interface AppConfig {
    appName: string
    projectId: string;
    gitHubUser: string;
    region: string;
    gitHubInstallationId: number;
    remoteURI: string;
}

export enum Locations {
    US_WEST_2 = 'us-west2'
}

import { Construct } from "constructs";
import { AppConfig } from "../appConfigs";
import { ComputeStack } from "../stacks/ComputeStack";


export function CreateSyncrStacks(app: Construct) {
    const projectId = 'infinite-pad-463416-d4';
    
    const SyncrConfig: AppConfig = {
        appName: 'Syncr',
        projectId,
        gitHubUser: 'mfvstudio',
        region: 'us-west1',
        gitHubInstallationId: 72256958,
        remoteURI: 'https://github.com/mfvstudio/syncr.git',
    };
    new ComputeStack(app, {
        config: SyncrConfig
    });
}

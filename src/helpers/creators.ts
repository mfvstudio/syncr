import { Construct } from "constructs";
import { AppConfig } from "../appConfigs";
import { ComputeStack } from "../stacks/ComputeStack";
import { StorageStack } from "../stacks/StorageStack";


export function CreateSyncrStacks(app: Construct, config: AppConfig) {
    new ComputeStack(app, {
        config
    });
    new StorageStack(app, {
        config
    })
}

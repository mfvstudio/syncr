import { Construct } from "constructs";
import { AppConfig } from "../appConfigs";
import { ComputeStack } from "../stacks/ComputeStack";


export function CreateSyncrStacks(app: Construct, config: AppConfig) {
    new ComputeStack(app, {
        config
    });
}

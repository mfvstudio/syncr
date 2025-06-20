import { Construct } from "constructs";
import { CloudBuildStack } from "../stacks/CloudBuild";
import { RepositoryStack } from "../stacks/Repository";


export function CreateSyncrStacks(app: Construct) {
    const repoStack = new RepositoryStack(app, {
        name: 'SyncrRepositoryStack'
    });
    const buildStack = new CloudBuildStack(app, {
        name: 'SyncrBuildStack'
    });
    buildStack.dependsOn(repoStack);
}

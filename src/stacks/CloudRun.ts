import { TerraformStack } from "cdktf";
import { Construct } from "constructs";

export interface CloudRunStackProps {
    name: string;
    region: string;
    googleProjectId: string;
}

export class CloudRunStack extends TerraformStack {
    constructor(scope: Construct, props: CloudRunStackProps){
        super(scope, props.name);
        //This will be the docker image of the server
        //const imageName = "someImage";
    };
}

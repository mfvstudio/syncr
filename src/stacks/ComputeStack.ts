import { TerraformStack } from "cdktf"
import { AppConfig } from "../appConfigs";
import { Construct } from "constructs";
import { GoogleProvider } from "@cdktf/provider-google/lib/provider";
import { CloudBuildConstruct } from "../constructs/CloudBuild";
import { DataGoogleProject } from "@cdktf/provider-google/lib/data-google-project";

export interface ComputeStackProps {
    config: AppConfig;
}

export class ComputeStack extends TerraformStack {
    constructor(scope: Construct, props: ComputeStackProps) {
        super(scope, `${props.config.appName}-ComputeStack`);
        const config = props.config;
        const project = new DataGoogleProject(this, 'syncrProject', {
            projectId: config.projectId
        });
        const serviceAccount = `${project.number}@cloudbuild.gserviceaccount.com`
        new GoogleProvider(this, "google", {
            project: config.projectId,
            region: config.region
        });
        new CloudBuildConstruct(this, {
            config,
            project,
            serviceAccount
        })
    }
}

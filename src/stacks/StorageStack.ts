import { TerraformStack } from "cdktf";
import { AppConfig } from "../appConfigs";
import { Construct } from "constructs";
import { DataGoogleProject } from "@cdktf/provider-google/lib/data-google-project";
import { GoogleProvider } from "@cdktf/provider-google/lib/provider";
import { FireStoreConstruct } from "../constructs/FireStore";



export interface StorageStackProps {
    config: AppConfig
}

export class StorageStack extends TerraformStack {
    constructor(scope: Construct, props: StorageStackProps) {
        super(scope, `${props.config.appName}-StorageStack`);
        const config = props.config;
        const project = new DataGoogleProject(this, 'syncrProject', {
            projectId: config.projectId
        });
        const serviceAccount = `${project.number}@cloudbuild.gserviceaccount.com`

        new GoogleProvider(this, 'google', {
            project: config.projectId,
            region: config.region
        });
        new FireStoreConstruct(this, {
            config,
            serviceAccount
        })
    }
}

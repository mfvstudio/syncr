import { CloudbuildTrigger } from "@cdktf/provider-google/lib/cloudbuild-trigger";
import { TerraformStack } from "cdktf";
import { Construct } from "constructs";
import { ProjectIamMember } from "@cdktf/provider-google/lib/project-iam-member";
import { DataGoogleProject } from "@cdktf/provider-google/lib/data-google-project";
import { SyncrConfig } from "../tempVars";
import { GoogleProvider } from "@cdktf/provider-google/lib/provider";
import { EnableGoogleApisConstruct } from "../constructs/enable_apis";

export interface CloudBuildStackProps {
    name: string;
}

export class CloudBuildStack extends TerraformStack {
    constructor(scope: Construct, props: CloudBuildStackProps) {
        super(scope, props.name);
        new GoogleProvider(this, "google", {
            project: SyncrConfig.projectId,
            region: SyncrConfig.region
        });
        const project = new DataGoogleProject(this, 'syncrProject', {
            projectId: SyncrConfig.projectId
        })
        const serviceAcc = `${project.number}@cloudbuild.gserviceaccount.com`;

        new ProjectIamMember(this, 'artifact-registry-acess', {
            project: project.projectId,
            role: 'roles/artifactregistry.writer',
            member: `serviceAccount:${serviceAcc}`
        });

        new ProjectIamMember(this, 'cloudbuild-service-user', {
            project: project.projectId,
            role: 'roles/iam.serviceAccountUser',
            member: `serviceAccount:${serviceAcc}`
        })
        const enableApis = new EnableGoogleApisConstruct(this, `SyncrApiHelper`, [
            'cloudbuild.googleapis.com',
            'artifactregistry.googleapis.com'
        ])
        new CloudbuildTrigger(this, "SyncrBuildTrigger", {
            name: `${props.name}-BuildTrigger`,
            description: 'A trigger for Github repo',
            github: {
                owner: SyncrConfig.gitHubUser,
                name: 'syncr',
                push: {
                    branch: 'main'
                }
            },
            filename: './cloudbuild.yaml'
        })
        this.dependsOn(enableApis as TerraformStack);
    }
}

import { GoogleProvider } from "@cdktf/provider-google/lib/provider";
import { TerraformStack } from "cdktf";
import { Construct } from "constructs";
import { SyncrConfig } from "../tempVars";
import { DataGoogleProject } from "@cdktf/provider-google/lib/data-google-project";
import { EnableGoogleApisConstruct } from "../constructs/enable_apis";
import { SecretManagerSecret } from "@cdktf/provider-google/lib/secret-manager-secret";
import { SecretManagerSecretVersion } from "@cdktf/provider-google/lib/secret-manager-secret-version";
import { GetEnvStringOrFail } from "../helpers/data";
import { Cloudbuildv2Connection } from "@cdktf/provider-google/lib/cloudbuildv2-connection";
import { SecretManagerSecretIamMember } from '@cdktf/provider-google/lib/secret-manager-secret-iam-member';


export interface RepositoryStackProps {
    name: string
}

export class RepositoryStack extends TerraformStack {
    constructor(scope: Construct, props: RepositoryStackProps) {
        super(scope, props.name);
        new GoogleProvider(this, "google", {
            project: SyncrConfig.projectId,
            region: SyncrConfig.region
        });
        const project = new DataGoogleProject(this, 'syncrProject', {
            projectId: SyncrConfig.projectId
        });
        const enableApis = new EnableGoogleApisConstruct(this, 'SyncrApiHelper', [
            'secretmanager.googleapis.com'
        ]);
        const sms = new SecretManagerSecret(this, 'github_super_secret_token', {
            project: project.projectId,
            secretId: 'githubAccessToken',
            replication: {
                auto: {}
            }
        })
        const scrtV = new SecretManagerSecretVersion(this, 'github_super_secret_version', {
            secret: sms.id,
            secretDataWo: GetEnvStringOrFail('GITHUB_ACCESS_TOKEN'),
            dependsOn: [sms]
        })
        const scrtPolicy = new SecretManagerSecretIamMember(this, 'serviceAgent_secretAccessor', {
            secretId: sms.secretId,
            role: 'roles/secretmanager.secretAccessor',
            member: `serviceAccount:service-${project.number}@gcp-sa-cloudbuild.iam.gserviceaccount.com`,
            dependsOn: [sms]
        })
        new Cloudbuildv2Connection(this, 'github-connection', {
            project: project.projectId,
            location: SyncrConfig.region,
            name: 'githubConnection',
            githubConfig: {
                appInstallationId: SyncrConfig.gitHubAppInstallationId,
                authorizerCredential: {
                    oauthTokenSecretVersion: scrtV.id
                }
            },
            dependsOn: [scrtPolicy, scrtV]
        });
        this.dependsOn(enableApis as TerraformStack);   
    }
}

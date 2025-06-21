import { AppConfig } from "../appConfigs";
import { Construct } from "constructs"
import { ProjectIamMember } from "@cdktf/provider-google/lib/project-iam-member";
import { CloudbuildTrigger } from "@cdktf/provider-google/lib/cloudbuild-trigger";
import { ProjectService } from "@cdktf/provider-google/lib/project-service";
import { Cloudbuildv2Connection } from "@cdktf/provider-google/lib/cloudbuildv2-connection";
import { Cloudbuildv2Repository } from "@cdktf/provider-google/lib/cloudbuildv2-repository";
import { SecretManagerSecret } from "@cdktf/provider-google/lib/secret-manager-secret";
import { SecretManagerSecretIamMember } from "@cdktf/provider-google/lib/secret-manager-secret-iam-member";
import { SecretManagerSecretVersion } from "@cdktf/provider-google/lib/secret-manager-secret-version";
import { GetEnvStringOrFail } from "../helpers/data";
import { DataGoogleProject } from "@cdktf/provider-google/lib/data-google-project";

export interface CloudBuildConstructProps {
    config: AppConfig;
    project: DataGoogleProject;
    serviceAccount: string;
}
export class CloudBuildConstruct extends Construct {
    constructor(scope: Construct, props: CloudBuildConstructProps) {
        super(scope, `${props.config.appName}-CloudBuildConstruct`);
        const config = props.config;
        const apisToEnable = [
            'cloudbuild.googleapis.com',
            'artifactregistry.googleapis.com',
            'secretmanager.googleapis.com'
        ]
        for(const api of apisToEnable) {
            new ProjectService(this, `enable-${api}`, {
                service: api,
                disableOnDestroy: false
            })
        }
        new ProjectIamMember(this, 'artifact-registry-acess', {
            project: config.projectId,
            role: 'roles/artifactregistry.writer',
            member: `serviceAccount:${props.serviceAccount}`
        });
        new ProjectIamMember(this, 'cloudbuild-service-user', {
            project: config.projectId,
            role: 'roles/iam.serviceAccountUser',
            member: `serviceAccount:${props.serviceAccount}`
        });
        const sms = new SecretManagerSecret(this, 'github_super_secret_token', {
            project: props.project.projectId,
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
            member: `serviceAccount:service-${props.project.number}@gcp-sa-cloudbuild.iam.gserviceaccount.com`,
            dependsOn: [sms]
        })
        const gitConnection = new Cloudbuildv2Connection(this, 'github-connection', {
            project: props.project.projectId,
            location: config.region,
            name: 'githubConnection',
            githubConfig: {
                appInstallationId: config.gitHubInstallationId,
                authorizerCredential: {
                    oauthTokenSecretVersion: scrtV.id
                }
            },
            dependsOn: [scrtPolicy, scrtV]
        });
        const cbRepo = new Cloudbuildv2Repository(this, 'SyncrRepoConnection', {
            location: config.region,
            name: 'syncr',
            parentConnection: gitConnection.id,
            remoteUri: config.remoteURI,
            dependsOn: [gitConnection]
        })
        // try changing service account
        new CloudbuildTrigger(this, "SyncrBuildTrigger", {
            name: `${config.appName}-BuildTrigger`,
            location: config.region,
            description: 'A trigger for Github repo',
            repositoryEventConfig: {
                repository: cbRepo.id,
                push: {
                    branch: '^main$'
                }
            },
            filename: 'cloudbuild.yaml',
            includeBuildLogs: 'INCLUDE_BUILD_LOGS_WITH_STATUS',
            dependsOn: [cbRepo]
        })
    }
}

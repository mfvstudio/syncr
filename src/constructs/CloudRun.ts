import { DataGoogleProject } from "@cdktf/provider-google/lib/data-google-project";
import { AppConfig } from "../appConfigs";
import { Construct } from "constructs";
import { ProjectService } from "@cdktf/provider-google/lib/project-service";
import { CloudRunV2Service } from "@cdktf/provider-google/lib/cloud-run-v2-service";
import { ComputeNetwork } from "@cdktf/provider-google/lib/compute-network";
import { ComputeSubnetwork } from "@cdktf/provider-google/lib/compute-subnetwork";
import { VpcAccessConnector } from "@cdktf/provider-google/lib/vpc-access-connector";
import { ProjectIamMember } from "@cdktf/provider-google/lib/project-iam-member";

export interface CloudRunConstructProps {
    config: AppConfig;
    project: DataGoogleProject;
    serviceAccount: string
}

export class CloudRunConstruct extends Construct {
    constructor(scope: Construct, props: CloudRunConstructProps) {
        super(scope, `${props.config.appName}-CloudRunConstruct`);
        const config = props.config;
        const computeAccount = `serviceAccount:${props.project.number}-compute@developer.gserviceaccount.com`;
        const apisToEnable = [
            'run.googleapis.com',
            'compute.googleapis.com',
            'vpcaccess.googleapis.com'
        ];
        const apisToDependOn = apisToEnable.map((api) => {
            return new ProjectService(this, `enable-${api}`, {
                service: api,
                disableOnDestroy: false
            })
        })
        new ProjectIamMember(this, 'run-admin', {
            project: config.projectId,
            role: 'roles/run.admin',
            member: `serviceAccount:${props.serviceAccount}`
        });
        new ProjectIamMember(this, 'run-vpc-user', {
            project: config.projectId,
            role: 'roles/vpcaccess.user',
            member: `serviceAccount:${props.serviceAccount}`
        });
        new ProjectIamMember(this, 'run-cloudbuild-viewer', {
            project: config.projectId,
            role: 'roles/cloudbuild.builds.viewer',
            member: `serviceAccount:${props.serviceAccount}`
        })
        new ProjectIamMember(this, 'run-service-account-user', {
            project: config.projectId,
            role: 'roles/iam.serviceAccountUser',
            member: `serviceAccount:${props.serviceAccount}`
        });


        new ProjectIamMember(this, 'run-log-writer', {
            project: config.projectId,
            role: 'roles/logging.logWriter',
            member: `serviceAccount:${props.serviceAccount}`
        });
        new ProjectIamMember(this, 'artifactRegistry-reader', {
            project: config.projectId,
            role: 'roles/artifactregistry.reader',
            member: `serviceAccount:${props.serviceAccount}`
        });

        new ProjectIamMember(this, 'run-log-writer-compute', {
            project: config.projectId,
            role: 'roles/logging.logWriter',
            member: computeAccount
        });
        new ProjectIamMember(this, 'artifactRegistry-reader-compute', {
            project: config.projectId,
            role: 'roles/artifactregistry.reader',
            member: computeAccount
        });
        new ProjectIamMember(this, 'run-vpc-user-compute', {
            project: config.projectId,
            role: 'roles/vpcaccess.user',
            member: computeAccount
        });


        const sourceDev = new ProjectIamMember(this, 'run-source-dev', {
            project: config.projectId,
            role: 'roles/run.sourceDeveloper',
            member: `serviceAccount:${props.serviceAccount}`
        });
        const builder = new ProjectIamMember(this, 'run-builder', {
            project: config.projectId,
            role: 'roles/run.builder',
            member: `serviceAccount:${props.serviceAccount}`
        });
        new ProjectIamMember(this, 'run-service-agent', {
            project: config.projectId,
            role: 'roles/run.serviceAgent',
            member: `serviceAccount:${props.serviceAccount}`
        });
        new ProjectIamMember(this, 'run-iam-user', {
            project: config.projectId,
            role: 'roles/iam.serviceAccountUser',
            member: `serviceAccount:${props.serviceAccount}`
        });
          
        const network = new ComputeNetwork(this, 'CloudRunVPC', {
            name: `${config.appName.toLowerCase()}-cloud-run-vpc`,
            autoCreateSubnetworks: false,
            dependsOn: apisToDependOn
        });

        const subNetwork = new ComputeSubnetwork(this, 'ComputeSubNetwork', {
            name: `${config.appName.toLowerCase()}-cloud-run-sub-network`,
            ipCidrRange: '10.8.0.0/28',
            region: config.region,
            network: network.id,
            dependsOn: [network]
        })

        const connector = new VpcAccessConnector(this, 'cloud-run-connector', {
            name: `${config.appName.toLowerCase()}-vpc-connector`,
            region: config.region,
            network: network.name,
            ipCidrRange: '10.10.0.0/28',
            dependsOn: [subNetwork],
            maxInstances: 3,
            minInstances: 2

        })

        new CloudRunV2Service(this, `CloudRunService`, {
            name: `${config.appName.toLowerCase()}-cloud-run-service`,
            location: config.region,
            deletionProtection: false,
            launchStage: 'ALPHA', //TODO: add logic to deal with stages
            template: {
                containers: [{
                    //TODO: fix hardcoded syncr repo image
                    image: `${config.region}-docker.pkg.dev/${config.projectId}/${config.artifactRepository}/syncr-demo:latest`,
                    ports: {
                        containerPort: 8080
                    }
                }],
                vpcAccess: {
                    connector: connector.id,
                    egress: 'ALL_TRAFFIC'
                }
            },
            dependsOn: [connector, sourceDev, builder]
        })
    }
}

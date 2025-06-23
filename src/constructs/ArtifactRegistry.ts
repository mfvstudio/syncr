import { Construct } from "constructs";
import { ArtifactRegistryRepository } from "@cdktf/provider-google/lib/artifact-registry-repository";
import { ProjectService } from "@cdktf/provider-google/lib/project-service";
import { AppConfig } from "../appConfigs";
import { ProjectIamMember } from "@cdktf/provider-google/lib/project-iam-member";

export interface ArtifactRegistryProps {
    config: AppConfig;
    serviceAccount: string;
}

export class ArtifactRegistry extends Construct {
    constructor(scope: Construct, props: ArtifactRegistryProps) {
        super(scope, `${props.config.appName}-ArtifactRegistryConstruct`);
        const config = props.config;
        const apisToEnable = [
            'artifactregistry.googleapis.com'
        ];
        for(const api of apisToEnable) {
            new ProjectService(this, `enable-${api}`, {
                service: api,
                disableOnDestroy: false
            });
        }
        new ProjectIamMember(this, 'artifactRegistry-writer', {
            project: config.projectId,
            role: 'roles/artifactregistry.writer',
            member: `serviceAccount:${props.serviceAccount}`
        });
        new ProjectIamMember(this, 'artifactRegistry-reader', {
            project: config.projectId,
            role: 'roles/artifactregistry.reader',
            member: `serviceAccount:${props.serviceAccount}`
        });
        new ArtifactRegistryRepository(this, 'ArtifactRegistry', {
            location: config.region,
            repositoryId: config.artifactRepository,
            format: 'DOCKER',
            dockerConfig: {
                immutableTags: true
            }
        })
    }
}

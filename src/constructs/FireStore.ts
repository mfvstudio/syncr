import { Construct } from "constructs";
import { AppConfig } from "../appConfigs";
import { FirestoreDatabase } from "@cdktf/provider-google/lib/firestore-database";
import { ProjectIamMember } from "@cdktf/provider-google/lib/project-iam-member";

export interface FireStoreConstructProps {
    config: AppConfig;
    serviceAccount: string
}

export class FireStoreConstruct extends Construct {
    constructor(scope: Construct, props: FireStoreConstructProps) {
        super(scope, `${props.config.appName}-FireStoreConstruct`);
        const config = props.config;

        new ProjectIamMember(this, 'firebase-dev-admin', {
            project: config.projectId,
            role: 'roles/firebase.developAdmin',
            member: `serviceAccount:${props.serviceAccount}`
        })
        new FirestoreDatabase(this, `${config.appName.toLowerCase()}-firebase-store`, {
            project: config.projectId,
            name: `${config.appName.toLowerCase()}-firebase-database`,
            locationId: config.region,
            type: 'FIRESTORE_NATIVE',
            concurrencyMode: 'OPTIMISTIC',
            appEngineIntegrationMode: 'DISABLED',
            deleteProtectionState: 'DELETE_PROTECTION_ENABLED'
        })
    }
}

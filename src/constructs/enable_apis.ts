import { ProjectService } from "@cdktf/provider-google/lib/project-service";
import { Construct } from "constructs";


export class EnableGoogleApisConstruct extends Construct {
    constructor(scope:Construct, id: string, services: string[]) {
        super(scope, id);
        for(const service of services) {
            new ProjectService(this, `enable-${service}`, {
                service,
                disableOnDestroy: false
            });
        }
    }
}

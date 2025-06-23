import { CreateSyncrStacks } from "./helpers/creators";
import { App } from "cdktf";
import { AppConfig, Locations } from "./appConfigs";
import { } from "@cdktf/provider-google";


function CreateSyncrApp() {
  const app = new App();
  const projectId = 'infinite-pad-463416-d4';
  const SyncrConfig: AppConfig = {
    appName: 'Syncr',
    projectId,
    gitHubUser: 'mfvstudio',
    region: Locations.US_WEST_2,
    gitHubInstallationId: 72256958,
    remoteURI: 'https://github.com/mfvstudio/syncr.git',
    artifactRepository: `syncr-artifact-registry`
 };
  CreateSyncrStacks(app, SyncrConfig);
  app.synth();
}
CreateSyncrApp()

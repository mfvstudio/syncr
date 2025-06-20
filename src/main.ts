import { CreateSyncrStacks } from "./helpers/creators";
import { App } from "cdktf";


function CreateSyncrApp() {
  const app = new App();
  CreateSyncrStacks(app);
  app.synth();
}
CreateSyncrApp()

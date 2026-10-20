import { App } from "aws-cdk-lib";
import { createFoundation } from "./stack";
const app = new App();
createFoundation(app);
app.synth();

import { awscdk } from "projen";
import { NodePackageManager } from "projen/lib/javascript";

const project = new awscdk.AwsCdkTypeScriptApp({
  cdkVersion: "2.1.0",
  defaultReleaseBranch: "main",
  name: "portfoliov3-AWS",
  projenrcTs: true,

  deps: [
    "hono",
    "dynamodb-toolbox",
    "@aws-sdk/lib-dynamodb",
    "@aws-sdk/client-dynamodb",
  ],
  // description: undefined,  /* The description is just a string that helps people understand the purpose of the package. */
  devDeps: [""],
  // packageName: undefined,  /* The "name" in package.json. */
  packageManager: NodePackageManager.NPM,
  context: {
    serviceName: "Portfolio",
  },
});
project.synth();

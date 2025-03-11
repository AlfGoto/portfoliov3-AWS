import * as cdk from "aws-cdk-lib";
import * as ddb from "aws-cdk-lib/aws-dynamodb";
import * as apigw from "aws-cdk-lib/aws-apigatewayv2";
import * as integrations from "aws-cdk-lib/aws-apigatewayv2-integrations";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as ln from "aws-cdk-lib/aws-lambda-nodejs";
import * as logs from "aws-cdk-lib/aws-logs";
import { Construct } from "constructs";

export interface PotfolioProps extends cdk.StackProps {
  stage: string;
  serviceName: string;
}

export class Portfolio extends cdk.Stack {
  constructor(scope: Construct, id: string, props: PotfolioProps) {
    super(scope, id, props);

    const table = new ddb.TableV2(this, "PortfolioTable", {
      partitionKey: { name: "PK", type: ddb.AttributeType.STRING },
      sortKey: { name: "SK", type: ddb.AttributeType.STRING },
      dynamoStream: ddb.StreamViewType.NEW_AND_OLD_IMAGES,
      billing: ddb.Billing.onDemand(),
      removalPolicy:
        props.stage === "prod"
          ? cdk.RemovalPolicy.RETAIN
          : cdk.RemovalPolicy.DESTROY,
      timeToLiveAttribute: "ttl",
    });

    const api = new apigw.HttpApi(this, "PortfolioApi", {
      corsPreflight: {
        allowHeaders: ["Content-Type", "credentials", "Cookie"],
        allowMethods: [apigw.CorsHttpMethod.ANY],
        allowOrigins: ["http://localhost:3000", "https://alfredgauthier.com"],
        allowCredentials: true,
      },
    });
    const apiFunction = new ln.NodejsFunction(this, "ApiFunction", {
      entry: `${__dirname}/functions/apiFunctions.ts`,
      environment: {
        STAGE: props.stage,
        SERVICE: props.serviceName,
        NODE_OPTIONS: "--enable-source-maps",
        TABLE_NAME: table.tableName,
      },
      bundling: { minify: true, sourceMap: true },
      runtime: lambda.Runtime.NODEJS_20_X,
      architecture: lambda.Architecture.ARM_64,
      logRetention: logs.RetentionDays.THREE_DAYS,
      tracing: lambda.Tracing.ACTIVE,
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
    });
    table.grantReadWriteData(apiFunction);

    const apiIntegration = new integrations.HttpLambdaIntegration(
      "ApiIntegration",
      apiFunction
    );
    api.addRoutes({
      path: "/{proxy+}",
      methods: [apigw.HttpMethod.GET, apigw.HttpMethod.POST],
      integration: apiIntegration,
      // authorizer: undefined,
    });
  }
}

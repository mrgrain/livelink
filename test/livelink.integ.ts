import * as cdk from 'aws-cdk-lib';
import { CfnOutput } from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { FunctionUrlAuthType } from 'aws-cdk-lib/aws-lambda';
import { LivelinkFunction } from '../src';

const app = new cdk.App();
const stack = new cdk.Stack(app, 'LivelinkApp', {
  env: {
    region: 'eu-west-2',
  },
});

const backend = new LivelinkFunction(stack, 'Backend', {});

const endpoint = new lambda.FunctionUrl(stack, 'Endpoint', {
  function: backend,
  authType: FunctionUrlAuthType.NONE,
});

new CfnOutput(stack, 'EndpointUrl', {
  value: endpoint.url,
});

app.synth();
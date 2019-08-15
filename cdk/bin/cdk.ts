#!/usr/bin/env node
import 'source-map-support/register';
import cdk = require('@aws-cdk/core');
import { CdkStack } from '../lib/cdk-stack';


const app = new cdk.App();

const env = {
    region: app.node.tryGetContext('region') || process.env['CDK_DEFAULT_REGION'] || process.env['AWS_DEFAULT_REGION'],
    account: app.node.tryGetContext('account') || process.env['CDK_DEFAULT_ACCOUNT'] || process.env['AWS_ACCOUNT'],
}

new CdkStack(app, 'CdkEksStack', {
    env: env
});

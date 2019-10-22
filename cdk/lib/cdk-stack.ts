import cdk = require('@aws-cdk/core');
import eks = require('@aws-cdk/aws-eks');
import iam = require('@aws-cdk/aws-iam');
import { InstanceType, Vpc } from '@aws-cdk/aws-ec2';

const app = new cdk.App();

const env = {
  region: app.node.tryGetContext('region') || process.env['CDK_DEFAULT_REGION'] || process.env['AWS_DEFAULT_REGION'],
  account: app.node.tryGetContext('account') || process.env['CDK_DEFAULT_ACCOUNT'] || process.env['AWS_ACCOUNT'],
}

const stack = new cdk.Stack(app, 'EksStack', { env })

const vpc = Vpc.fromLookup(stack, 'VPC', {
  isDefault: true
})

const clusterAdmin = new iam.Role(stack, 'AdminRole', {
  assumedBy: new iam.AccountRootPrincipal()
});

const cluster = new eks.Cluster(stack, 'Cluster', {
  vpc,
  mastersRole: clusterAdmin,
});

cluster.addCapacity('Spot', {
  maxCapacity: 1,
  spotPrice: '0.04',
  instanceType: new InstanceType('t3.large'),
  bootstrapOptions: {
    kubeletExtraArgs: '--node-labels foo=bar'
  },
})

app.synth()

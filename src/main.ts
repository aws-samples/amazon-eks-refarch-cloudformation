import * as ec2 from '@aws-cdk/aws-ec2';
import * as eks from '@aws-cdk/aws-eks';
import * as cdk from '@aws-cdk/core';
import { Patch } from 'awscdk-81-patch';

Patch.apply();

export class MyStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: cdk.StackProps = {}) {
    super(scope, id, props);

    const vpc = getOrCreateVpc(this);

    // create the cluster and a default maanged nodegroup of 2 x m5.large instances
    const cluster = new eks.Cluster(this, 'Cluster', {
      vpc,
      version: eks.KubernetesVersion.V1_18,
    });

    // conditionally create spot managed nodegroup
    if (this.node.tryGetContext('with_spot_nodegroup') === 'yes') {
      cluster.addNodegroupCapacity('SpotMNG', {
        capacityType: eks.CapacityType.SPOT,
        instanceTypes: [
          new ec2.InstanceType('m5.large'),
          new ec2.InstanceType('c5.large'),
          new ec2.InstanceType('t3.large'),
        ],
        desiredSize: 3,
      });
    };

    // conditionally create service account for a pod
    if (this.node.tryGetContext('with_irsa') === 'yes') {
      const sa = cluster.addServiceAccount('MyServiceAccount', {});

      cluster.addManifest('mypod', {
        apiVersion: 'v1',
        kind: 'Pod',
        metadata: { name: 'mypod' },
        spec: {
          serviceAccountName: sa.serviceAccountName,
          containers: [
            {
              name: 'main',
              image: 'pahud/aws-whoami',
              ports: [{ containerPort: 5000 }],
            },
          ],
        },
      });

      new cdk.CfnOutput(this, 'SARoleArn', { value: sa.role.roleArn });
    };

    // conditionally create a fargate profile
    if (this.node.tryGetContext('with_fargate_profile') === 'yes') {
      const profile = cluster.addFargateProfile('FargateProfile', {
        selectors: [
          { namespace: 'default' },
        ],
      });

      profile.fargateProfileName;

      new cdk.CfnOutput(this, 'FargareProfileName', { value: profile.fargateProfileName });
    };

  }
}

// for development, use account/region from cdk cli
const devEnv = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

const app = new cdk.App();

new MyStack(app, 'my-stack-dev', { env: devEnv });
// new MyStack(app, 'my-stack-prod', { env: prodEnv });

app.synth();


function getOrCreateVpc(scope: cdk.Construct): ec2.IVpc {
  // use an existing vpc or create a new one
  const stack = cdk.Stack.of(scope);
  const vpc = stack.node.tryGetContext('use_default_vpc') === '1' ?
    ec2.Vpc.fromLookup(stack, 'Vpc', { isDefault: true }) :
    stack.node.tryGetContext('use_vpc_id') ?
      ec2.Vpc.fromLookup(stack, 'Vpc', { vpcId: stack.node.tryGetContext('use_vpc_id') }) :
      new ec2.Vpc(stack, 'Vpc', { maxAzs: 3, natGateways: 1 });
  return vpc;
}

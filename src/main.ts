import {
  StackProps, Stack, CfnOutput, App,
  aws_ec2 as ec2,
  aws_eks as eks,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class MyStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps = {}) {
    super(scope, id, props);

    const vpc = getOrCreateVpc(this);

    // create the cluster and a default maanged nodegroup of 2 x m5.large instances
    const cluster = new eks.Cluster(this, 'Cluster', {
      vpc,
      version: eks.KubernetesVersion.V1_19,
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

      new CfnOutput(this, 'SARoleArn', { value: sa.role.roleArn });
    };

    // conditionally create a fargate profile
    if (this.node.tryGetContext('with_fargate_profile') === 'yes') {
      const profile = cluster.addFargateProfile('FargateProfile', {
        selectors: [
          { namespace: 'default' },
        ],
      });

      profile.fargateProfileName;

      new CfnOutput(this, 'FargareProfileName', { value: profile.fargateProfileName });
    };

  }
}

// for development, use account/region from cdk cli
const devEnv = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

const app = new App();

new MyStack(app, 'my-stack-dev', { env: devEnv });
// new MyStack(app, 'my-stack-prod', { env: prodEnv });

app.synth();


function getOrCreateVpc(scope: Construct): ec2.IVpc {
  // use an existing vpc or create a new one
  const stack = Stack.of(scope);
  const vpc = stack.node.tryGetContext('use_default_vpc') === '1' ?
    ec2.Vpc.fromLookup(stack, 'Vpc', { isDefault: true }) :
    stack.node.tryGetContext('use_vpc_id') ?
      ec2.Vpc.fromLookup(stack, 'Vpc', { vpcId: stack.node.tryGetContext('use_vpc_id') }) :
      new ec2.Vpc(stack, 'Vpc', { maxAzs: 3, natGateways: 1 });
  return vpc;
}

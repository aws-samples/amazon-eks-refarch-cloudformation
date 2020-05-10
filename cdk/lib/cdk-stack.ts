import * as cdk from '@aws-cdk/core';
import * as eks from '@aws-cdk/aws-eks';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as iam from '@aws-cdk/aws-iam';
import { InstanceType, Vpc } from '@aws-cdk/aws-ec2';

export class EksStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // use an existing vpc or create a new one
    const vpc = this.node.tryGetContext('use_default_vpc') === '1' ?
      ec2.Vpc.fromLookup(this, 'Vpc', { isDefault: true }) :
      this.node.tryGetContext('use_vpc_id') ?
        ec2.Vpc.fromLookup(this, 'Vpc', { vpcId: this.node.tryGetContext('use_vpc_id') }) :
        new ec2.Vpc(this, 'Vpc', { maxAzs: 3, natGateways: 1 });

    const clusterAdmin = new iam.Role(this, 'AdminRole', {
      assumedBy: new iam.AccountRootPrincipal()
    });

    // create the cluster and a default maanged nodegroup of 2 x m5.large instances
    const cluster = new eks.Cluster(this, 'Cluster', {
      vpc,
      mastersRole: clusterAdmin,
      version: '1.16',
    });

    // create 2 * t3.large spot instances
    cluster.addCapacity('Spot', {
      maxCapacity: 2,
      spotPrice: '0.04',
      instanceType: new InstanceType('t3.large'),
      bootstrapOptions: {
        kubeletExtraArgs: '--node-labels foo=bar'
      },
    })
  }
}

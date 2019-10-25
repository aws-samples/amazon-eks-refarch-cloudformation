import cdk = require('@aws-cdk/core');
import eks = require('@aws-cdk/aws-eks');
import iam = require('@aws-cdk/aws-iam');
import { InstanceType, Vpc } from '@aws-cdk/aws-ec2';

export class EksStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = Vpc.fromLookup(this, 'VPC', {
      isDefault: true
    })

    const clusterAdmin = new iam.Role(this, 'AdminRole', {
      assumedBy: new iam.AccountRootPrincipal()
    });

    const cluster = new eks.Cluster(this, 'Cluster', {
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

  }
}

import * as cdk from '@aws-cdk/core';
import * as eks from '@aws-cdk/aws-eks';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as iam from '@aws-cdk/aws-iam';
import { InstanceType, Vpc } from '@aws-cdk/aws-ec2';

export class EksStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = getOrCreateVpc(this);

    const clusterAdmin = new iam.Role(this, 'AdminRole', {
      assumedBy: new iam.AccountRootPrincipal()
    });

    // create the cluster and a default maanged nodegroup of 2 x m5.large instances
    const cluster = new eks.Cluster(this, 'Cluster', {
      vpc,
      mastersRole: clusterAdmin,
      version: '1.16',
    });
    
    
    // conditionally create spot instances
    if(this.node.tryGetContext('with_spot_instances') === 'yes'){
      // create 2 * t3.large spot instances
      cluster.addCapacity('Spot', {
        maxCapacity: 2,
        spotPrice: '0.04',
        instanceType: new InstanceType('t3.large'),
        bootstrapOptions: {
          kubeletExtraArgs: '--node-labels foo=bar'
        },
      })      
    };
    
    
    // conditionally add the 2nd managed nodegroup
    if(this.node.tryGetContext('with_2nd_nodegroup') === 'yes'){
      // create 2nd nodegroup
      cluster.addNodegroup('NG2', {
        desiredSize: 1,
        nodegroupName: 'NG2',
        instanceType: new InstanceType('t3.large'),
      })      
    };
    
    // conditionally create service account for a pod
    if(this.node.tryGetContext('with_irsa') === 'yes'){
      const sa = cluster.addServiceAccount('MyServiceAccount', {});
  
      cluster.addResource('mypod', {
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
            }
          ]
        }
      });
      
      new cdk.CfnOutput(this, 'SARoleArn', { value: sa.role.roleArn })
    };
    
    // conditionally create a fargate profile
    if(this.node.tryGetContext('with_fargate_profile') === 'yes'){
      const profile = cluster.addFargateProfile('FargateProfile', {
        selectors: [
          { namespace: 'default' }
          ]
      });
      
      profile.fargateProfileName
      
      new cdk.CfnOutput(this, 'FargareProfileName', { value: profile.fargateProfileName })
    };
    
  }
}


function getOrCreateVpc(stack: cdk.Stack): ec2.IVpc {
  // use an existing vpc or create a new one
  const vpc = stack.node.tryGetContext('use_default_vpc') === '1' ?
    ec2.Vpc.fromLookup(stack, 'Vpc', { isDefault: true }) :
    stack.node.tryGetContext('use_vpc_id') ?
      ec2.Vpc.fromLookup(stack, 'Vpc', { vpcId: stack.node.tryGetContext('use_vpc_id') }) :
      new ec2.Vpc(stack, 'Vpc', { maxAzs: 3, natGateways: 1 });  
      
  return vpc
}

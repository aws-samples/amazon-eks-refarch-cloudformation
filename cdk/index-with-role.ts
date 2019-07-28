import cdk = require("@aws-cdk/core");
import ec2 = require("@aws-cdk/aws-ec2");
import eks = require("@aws-cdk/aws-eks");
import sam = require('@aws-cdk/aws-sam');
import cfn = require('@aws-cdk/aws-cloudformation');
import lambda = require('@aws-cdk/aws-lambda');

const app = new cdk.App();

const env = { 
  region:  app.node.tryGetContext("region")  || process.env.CDK_INTEG_REGION  || process.env.CDK_DEFAULT_REGION,
}

const clusterName = app.node.tryGetContext("clusterName") || 'eksdemo-cdk'
const eksVpcStackName = app.node.tryGetContext("eksVpcStackName") || 'EKS-VPC'
const eksMainStackName = app.node.tryGetContext("eksMainStackName") || 'EKS-Main'

class NetworkStack extends cdk.Stack {
  public readonly vpc: ec2.Vpc;
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    // VPC with public subnet in every AZ and private subnet in every AZ
    // each public subnet will privision individual NAT gateway with EIP attached.
    // This is how CDK provision VPC resource for you by default.
    // const vpc = new ec2.Vpc(this, 'cdk-EKS-vpc');
    
    // VPC with only single NAT gateway in one of the public subnets
    this.vpc = new ec2.Vpc(this, 'cdk-EKS-vpc', {
      cidr: '10.0.0.0/16',
      natGateways: 1,
      natGatewaySubnets: {subnetName: 'Public'},
      subnetConfiguration: [
        {
          cidrMask: 22,
          name: 'Public',
          subnetType: ec2.SubnetType.PUBLIC, 
        },
        {
          cidrMask: 22,
          name: 'Private',
          subnetType: ec2.SubnetType.PRIVATE, 
        },
      ],
    });    
  }
}

interface EKSCdkStackProps extends cdk.StackProps {
  vpc: ec2.IVpc;
}

class EKSCdkStack extends cdk.Stack {
    constructor(scope: cdk.App, id: string, props: EKSCdkStackProps) {
        super(scope, id, props);  
        
        // EKS Cluster
        const eksCluster = new eks.Cluster(this, 'eksdemo-cdk', { 
            vpc: props.vpc, 
            clusterName: clusterName, 
            version: this.node.tryGetContext('clusterVersion'),
        });
            
        // NodeGroup
        const asg = eksCluster.addCapacity('Nodes', {
          instanceType: new ec2.InstanceType('t3.large'),
          desiredCapacity: 2, 
        });

        // cfn custom resource to handle aws-auth-cm update
        const eksAuthHook = new sam.CfnApplication(this, 'sam', {
          location: {
            applicationId: 'arn:aws:serverlessrepo:us-east-1:903779448426:applications/eks-auth-update-hook',
            semanticVersion: '1.0.0',
          },
          parameters: {
            ClusterName: 'eksdemo-cdk',
            LambdaRoleArn: 'arn:aws:iam::903779448426:role/AmazonEKSAdminRole',
            LambdaLayerKubectlArn: 'arn:aws:lambda:ap-northeast-1:903779448426:layer:eks-kubectl-layer:30',
            NodeInstanceRoleArn: asg.role.roleArn,
            FunctionName: 'eks-auth-hook'
          }
        })     

        const customResourceAuthHook = new cfn.CustomResource(this, 'CustomResource', {
          provider: cfn.CustomResourceProvider.lambda(lambda.Function.fromFunctionArn(this, 'SamFunc', eksAuthHook.ref)),
          properties: {
            ServiceToken: eksAuthHook.getAtt('Outputs.LambdaFuncArn').toString()
          }
        });

        customResourceAuthHook.node.addDependency(eksCluster)

        new cdk.CfnOutput(this, 'SamFuncArn', {
          value: eksAuthHook.getAtt('Outputs.LambdaFuncArn').toString(),
        })

        new cdk.CfnOutput(this, 'NodeInstanceRole', {
          value: asg.role.roleArn,
        })

    }
}

// create the VPC stack now
const eksVpcStack = new NetworkStack(app, eksVpcStackName, {
  env: env,
});

// create the EKS main stack in ths VPC
const eksMainStack = new EKSCdkStack(app, eksMainStackName, {
  env: env,
  vpc: eksVpcStack.vpc,
});

eksMainStack.addDependency(eksVpcStack)

// exports.EKSVPCStack = NetworkStack;
// exports.EKSMainStack = EKSCdkStack;

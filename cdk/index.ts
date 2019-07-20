import cdk = require("@aws-cdk/core");
import ec2 = require("@aws-cdk/aws-ec2");
import eks = require("@aws-cdk/aws-eks");

class EKSCdkStack extends cdk.Stack {
    constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
        super(scope, id, props);
        
        // VPC with public subnet in every AZ and private subnet in every AZ
        // each public subnet will privision individual NAT gateway with EIP attached.
        // This is how CDK provision VPC resource for you by default.
        // const vpc = new ec2.Vpc(this, 'cdk-EKS-vpc');
        
        // VPC with only single NAT gateway in one of the public subnets
        const vpc = new ec2.Vpc(this, 'cdk-EKS-vpc', {
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
        
        // EKS Cluster
        const eksCluster = new eks.Cluster(this, 'eksdemo-cdk', { 
            vpc, 
            clusterName: 'eksdemo-cdk', 
            version: this.node.tryGetContext('clusterVersion'),
        });
            
        // NodeGroup
        eksCluster.addCapacity('Nodes', {
          instanceType: new ec2.InstanceType('t3.large'),
          desiredCapacity: 2,  // Raise this number to add more nodes 
        });
    }
}

exports.EKSCdkStack = EKSCdkStack;
const app = new cdk.App();

// since the EKS optimized AMI is hard-coded here based on the region,
// we need to actually pass in a specific region.
// allow context variable to override env variables
new EKSCdkStack(app, 'EKS-CDK-demo', { 
    env: { 
        region:  app.node.tryGetContext("region")  || process.env.CDK_INTEG_REGION  || process.env.CDK_DEFAULT_REGION,
        account: app.node.tryGetContext("account") || process.env.CDK_INTEG_ACCOUNT || process.env.CDK_DEFAULT_ACCOUNT,
    }
});

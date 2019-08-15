import cdk = require('@aws-cdk/core');
import eks = require('@aws-cdk/aws-eks');
import iam = require('@aws-cdk/aws-iam');


export class CdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // first define the role
    const clusterAdmin = new iam.Role(this, 'AdminRole', {
      assumedBy: new iam.AccountRootPrincipal()
    });

    // eks cluster with nodegroup of 2x m5.large instances in dedicated vpc with default configuratrion
    const cluster = new eks.Cluster(this, 'hello-eks', {
      clusterName: 'cdk-eks',
      mastersRole: clusterAdmin
    });

    const appLabel = { app: "hello-kubernetes" };

    const deployment = {
      apiVersion: "apps/v1",
      kind: "Deployment",
      metadata: { name: "hello-kubernetes" },
      spec: {
        replicas: 3,
        selector: { matchLabels: appLabel },
        template: {
          metadata: { labels: appLabel },
          spec: {
            containers: [
              {
                name: "hello-kubernetes",
                image: "paulbouwer/hello-kubernetes:1.5",
                ports: [{ containerPort: 8080 }]
              }
            ]
          }
        }
      }
    };

    const service = {
      apiVersion: "v1",
      kind: "Service",
      metadata: { name: "hello-kubernetes" },
      spec: {
        type: "LoadBalancer",
        ports: [{ port: 80, targetPort: 8080 }],
        selector: appLabel
      }
    };

    cluster.addResource('hello-kub', service, deployment);

    // output the clusterAdmin role arn
    new cdk.CfnOutput(this, 'clusterAdminRoleArn', {
      value: clusterAdmin.roleArn
    })
  }
}

import cdk = require('@aws-cdk/core');
import eks = require('@aws-cdk/aws-eks');
import iam = require('@aws-cdk/aws-iam');
import { InstanceType, Vpc } from '@aws-cdk/aws-ec2';

export class EksSampleStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = Vpc.fromLookup(this, 'VPC', {
      isDefault: true
    })

    // create the admin role
    const clusterAdmin = new iam.Role(this, 'AdminRole', {
      assumedBy: new iam.AccountRootPrincipal()
    });

    // eks cluster with ondemand default capacity
    const cluster = new eks.Cluster(this, 'Cluster', {
      vpc: vpc,
      defaultCapacity: 1,
      mastersRole: clusterAdmin,
      outputClusterName: true,
    });

    cluster.addCapacity('Spot', {
      maxCapacity: 1,
      instanceType: new InstanceType('t3.large'),
      bootstrapOptions: {
        kubeletExtraArgs: '--node-labels foo=bar'
      },
    })

    // cluster.addCapacity('OnDemand', {
    //   maxCapacity: 1,
    //   instanceType: new InstanceType('t3.large'),
    //   bootstrapOptions: {
    //     kubeletExtraArgs: '--node-labels myCustomLabel=od'
    //   },
    // })

    // cluster.addCapacity('SpotGPU', {
    //   spotPrice: '12.2400',
    //   maxCapacity: 1,
    //   instanceType: new InstanceType('p3.8xlarge'),
    //   bootstrapOptions: {
    //     kubeletExtraArgs: '--node-labels NVIDIAGPU=1'
    //   },
    // })

    // const appLabel = { app: "hello-kubernetes" };

    // const deployment = {
    //   apiVersion: "apps/v1",
    //   kind: "Deployment",
    //   metadata: { name: "hello-kubernetes" },
    //   spec: {
    //     replicas: 3,
    //     selector: { matchLabels: appLabel },
    //     template: {
    //       metadata: { labels: appLabel },
    //       spec: {
    //         containers: [
    //           {
    //             name: "hello-kubernetes",
    //             image: "paulbouwer/hello-kubernetes:1.5",
    //             ports: [{ containerPort: 8080 }]
    //           }
    //         ]
    //       }
    //     }
    //   }
    // };

    // const service = {
    //   apiVersion: "v1",
    //   kind: "Service",
    //   metadata: { name: "hello-kubernetes" },
    //   spec: {
    //     type: "LoadBalancer",
    //     ports: [{ port: 80, targetPort: 8080 }],
    //     selector: appLabel
    //   }
    // };

    // cluster.addResource('hello-kub', service, deployment);

  }
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cdk = require("@aws-cdk/core");
const eks = require("@aws-cdk/aws-eks");
const iam = require("@aws-cdk/aws-iam");
const aws_ec2_1 = require("@aws-cdk/aws-ec2");
class EksSampleStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        const vpc = aws_ec2_1.Vpc.fromLookup(this, 'VPC', {
            isDefault: true
        });
        // create the admin role
        const clusterAdmin = new iam.Role(this, 'AdminRole', {
            assumedBy: new iam.AccountRootPrincipal()
        });
        // eks cluster 
        const cluster = new eks.Cluster(this, 'Cluster', {
            vpc: vpc,
            defaultCapacity: 0,
            mastersRole: clusterAdmin,
            version: '1.14',
            outputClusterName: true,
        });
        cluster.addCapacity('OnDemand', {
            maxCapacity: 1,
            instanceType: new aws_ec2_1.InstanceType('t3.large'),
            bootstrapOptions: {
                kubeletExtraArgs: '--node-labels myCustomLabel=od'
            },
        });
        cluster.addCapacity('Spot', {
            maxCapacity: 1,
            instanceType: new aws_ec2_1.InstanceType('t3.large'),
            bootstrapOptions: {
                kubeletExtraArgs: '--node-labels myCustomLabel=spot'
            },
        });
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
exports.EksSampleStack = EksSampleStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2RrLXN0YWNrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiY2RrLXN0YWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEscUNBQXNDO0FBQ3RDLHdDQUF5QztBQUN6Qyx3Q0FBeUM7QUFDekMsOENBQXFEO0FBRXJELE1BQWEsY0FBZSxTQUFRLEdBQUcsQ0FBQyxLQUFLO0lBQzNDLFlBQVksS0FBb0IsRUFBRSxFQUFVLEVBQUUsS0FBc0I7UUFDbEUsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFeEIsTUFBTSxHQUFHLEdBQUcsYUFBRyxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFO1lBQ3RDLFNBQVMsRUFBRSxJQUFJO1NBQ2hCLENBQUMsQ0FBQTtRQUVGLHdCQUF3QjtRQUN4QixNQUFNLFlBQVksR0FBRyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLFdBQVcsRUFBRTtZQUNuRCxTQUFTLEVBQUUsSUFBSSxHQUFHLENBQUMsb0JBQW9CLEVBQUU7U0FDMUMsQ0FBQyxDQUFDO1FBRUgsZUFBZTtRQUNmLE1BQU0sT0FBTyxHQUFHLElBQUksR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsU0FBUyxFQUFFO1lBQy9DLEdBQUcsRUFBRSxHQUFHO1lBQ1IsZUFBZSxFQUFFLENBQUM7WUFDbEIsV0FBVyxFQUFFLFlBQVk7WUFDekIsT0FBTyxFQUFFLE1BQU07WUFDZixpQkFBaUIsRUFBRSxJQUFJO1NBQ3hCLENBQUMsQ0FBQztRQUVILE9BQU8sQ0FBQyxXQUFXLENBQUMsVUFBVSxFQUFFO1lBQzlCLFdBQVcsRUFBRSxDQUFDO1lBQ2QsWUFBWSxFQUFFLElBQUksc0JBQVksQ0FBQyxVQUFVLENBQUM7WUFDMUMsZ0JBQWdCLEVBQUU7Z0JBQ2hCLGdCQUFnQixFQUFFLGdDQUFnQzthQUNuRDtTQUNGLENBQUMsQ0FBQTtRQUVGLE9BQU8sQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFO1lBQzFCLFdBQVcsRUFBRSxDQUFDO1lBQ2QsWUFBWSxFQUFFLElBQUksc0JBQVksQ0FBQyxVQUFVLENBQUM7WUFDMUMsZ0JBQWdCLEVBQUU7Z0JBQ2hCLGdCQUFnQixFQUFFLGtDQUFrQzthQUNyRDtTQUNGLENBQUMsQ0FBQTtRQUVGLG1DQUFtQztRQUNuQywwQkFBMEI7UUFDMUIsb0JBQW9CO1FBQ3BCLGtEQUFrRDtRQUNsRCx3QkFBd0I7UUFDeEIsb0RBQW9EO1FBQ3BELE9BQU87UUFDUCxLQUFLO1FBR0wsZ0RBQWdEO1FBRWhELHVCQUF1QjtRQUN2QiwyQkFBMkI7UUFDM0Isd0JBQXdCO1FBQ3hCLDRDQUE0QztRQUM1QyxZQUFZO1FBQ1osbUJBQW1CO1FBQ25CLDJDQUEyQztRQUMzQyxrQkFBa0I7UUFDbEIsd0NBQXdDO1FBQ3hDLGdCQUFnQjtRQUNoQix3QkFBd0I7UUFDeEIsY0FBYztRQUNkLHdDQUF3QztRQUN4Qyx3REFBd0Q7UUFDeEQsK0NBQStDO1FBQy9DLGNBQWM7UUFDZCxZQUFZO1FBQ1osVUFBVTtRQUNWLFFBQVE7UUFDUixNQUFNO1FBQ04sS0FBSztRQUVMLG9CQUFvQjtRQUNwQixzQkFBc0I7UUFDdEIscUJBQXFCO1FBQ3JCLDRDQUE0QztRQUM1QyxZQUFZO1FBQ1osNEJBQTRCO1FBQzVCLCtDQUErQztRQUMvQyx5QkFBeUI7UUFDekIsTUFBTTtRQUNOLEtBQUs7UUFFTCx5REFBeUQ7SUFFM0QsQ0FBQztDQUNGO0FBdEZELHdDQXNGQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBjZGsgPSByZXF1aXJlKCdAYXdzLWNkay9jb3JlJyk7XG5pbXBvcnQgZWtzID0gcmVxdWlyZSgnQGF3cy1jZGsvYXdzLWVrcycpO1xuaW1wb3J0IGlhbSA9IHJlcXVpcmUoJ0Bhd3MtY2RrL2F3cy1pYW0nKTtcbmltcG9ydCB7IEluc3RhbmNlVHlwZSwgVnBjIH0gZnJvbSAnQGF3cy1jZGsvYXdzLWVjMic7XG5cbmV4cG9ydCBjbGFzcyBFa3NTYW1wbGVTdGFjayBleHRlbmRzIGNkay5TdGFjayB7XG4gIGNvbnN0cnVjdG9yKHNjb3BlOiBjZGsuQ29uc3RydWN0LCBpZDogc3RyaW5nLCBwcm9wcz86IGNkay5TdGFja1Byb3BzKSB7XG4gICAgc3VwZXIoc2NvcGUsIGlkLCBwcm9wcyk7XG5cbiAgICBjb25zdCB2cGMgPSBWcGMuZnJvbUxvb2t1cCh0aGlzLCAnVlBDJywge1xuICAgICAgaXNEZWZhdWx0OiB0cnVlXG4gICAgfSlcblxuICAgIC8vIGNyZWF0ZSB0aGUgYWRtaW4gcm9sZVxuICAgIGNvbnN0IGNsdXN0ZXJBZG1pbiA9IG5ldyBpYW0uUm9sZSh0aGlzLCAnQWRtaW5Sb2xlJywge1xuICAgICAgYXNzdW1lZEJ5OiBuZXcgaWFtLkFjY291bnRSb290UHJpbmNpcGFsKClcbiAgICB9KTtcblxuICAgIC8vIGVrcyBjbHVzdGVyIFxuICAgIGNvbnN0IGNsdXN0ZXIgPSBuZXcgZWtzLkNsdXN0ZXIodGhpcywgJ0NsdXN0ZXInLCB7XG4gICAgICB2cGM6IHZwYyxcbiAgICAgIGRlZmF1bHRDYXBhY2l0eTogMCxcbiAgICAgIG1hc3RlcnNSb2xlOiBjbHVzdGVyQWRtaW4sXG4gICAgICB2ZXJzaW9uOiAnMS4xNCcsXG4gICAgICBvdXRwdXRDbHVzdGVyTmFtZTogdHJ1ZSxcbiAgICB9KTtcblxuICAgIGNsdXN0ZXIuYWRkQ2FwYWNpdHkoJ09uRGVtYW5kJywge1xuICAgICAgbWF4Q2FwYWNpdHk6IDEsXG4gICAgICBpbnN0YW5jZVR5cGU6IG5ldyBJbnN0YW5jZVR5cGUoJ3QzLmxhcmdlJyksXG4gICAgICBib290c3RyYXBPcHRpb25zOiB7XG4gICAgICAgIGt1YmVsZXRFeHRyYUFyZ3M6ICctLW5vZGUtbGFiZWxzIG15Q3VzdG9tTGFiZWw9b2QnXG4gICAgICB9LFxuICAgIH0pXG5cbiAgICBjbHVzdGVyLmFkZENhcGFjaXR5KCdTcG90Jywge1xuICAgICAgbWF4Q2FwYWNpdHk6IDEsXG4gICAgICBpbnN0YW5jZVR5cGU6IG5ldyBJbnN0YW5jZVR5cGUoJ3QzLmxhcmdlJyksXG4gICAgICBib290c3RyYXBPcHRpb25zOiB7XG4gICAgICAgIGt1YmVsZXRFeHRyYUFyZ3M6ICctLW5vZGUtbGFiZWxzIG15Q3VzdG9tTGFiZWw9c3BvdCdcbiAgICAgIH0sXG4gICAgfSlcblxuICAgIC8vIGNsdXN0ZXIuYWRkQ2FwYWNpdHkoJ1Nwb3RHUFUnLCB7XG4gICAgLy8gICBzcG90UHJpY2U6ICcxMi4yNDAwJyxcbiAgICAvLyAgIG1heENhcGFjaXR5OiAxLFxuICAgIC8vICAgaW5zdGFuY2VUeXBlOiBuZXcgSW5zdGFuY2VUeXBlKCdwMy44eGxhcmdlJyksXG4gICAgLy8gICBib290c3RyYXBPcHRpb25zOiB7XG4gICAgLy8gICAgIGt1YmVsZXRFeHRyYUFyZ3M6ICctLW5vZGUtbGFiZWxzIE5WSURJQUdQVT0xJ1xuICAgIC8vICAgfSxcbiAgICAvLyB9KVxuXG5cbiAgICAvLyBjb25zdCBhcHBMYWJlbCA9IHsgYXBwOiBcImhlbGxvLWt1YmVybmV0ZXNcIiB9O1xuXG4gICAgLy8gY29uc3QgZGVwbG95bWVudCA9IHtcbiAgICAvLyAgIGFwaVZlcnNpb246IFwiYXBwcy92MVwiLFxuICAgIC8vICAga2luZDogXCJEZXBsb3ltZW50XCIsXG4gICAgLy8gICBtZXRhZGF0YTogeyBuYW1lOiBcImhlbGxvLWt1YmVybmV0ZXNcIiB9LFxuICAgIC8vICAgc3BlYzoge1xuICAgIC8vICAgICByZXBsaWNhczogMyxcbiAgICAvLyAgICAgc2VsZWN0b3I6IHsgbWF0Y2hMYWJlbHM6IGFwcExhYmVsIH0sXG4gICAgLy8gICAgIHRlbXBsYXRlOiB7XG4gICAgLy8gICAgICAgbWV0YWRhdGE6IHsgbGFiZWxzOiBhcHBMYWJlbCB9LFxuICAgIC8vICAgICAgIHNwZWM6IHtcbiAgICAvLyAgICAgICAgIGNvbnRhaW5lcnM6IFtcbiAgICAvLyAgICAgICAgICAge1xuICAgIC8vICAgICAgICAgICAgIG5hbWU6IFwiaGVsbG8ta3ViZXJuZXRlc1wiLFxuICAgIC8vICAgICAgICAgICAgIGltYWdlOiBcInBhdWxib3V3ZXIvaGVsbG8ta3ViZXJuZXRlczoxLjVcIixcbiAgICAvLyAgICAgICAgICAgICBwb3J0czogW3sgY29udGFpbmVyUG9ydDogODA4MCB9XVxuICAgIC8vICAgICAgICAgICB9XG4gICAgLy8gICAgICAgICBdXG4gICAgLy8gICAgICAgfVxuICAgIC8vICAgICB9XG4gICAgLy8gICB9XG4gICAgLy8gfTtcblxuICAgIC8vIGNvbnN0IHNlcnZpY2UgPSB7XG4gICAgLy8gICBhcGlWZXJzaW9uOiBcInYxXCIsXG4gICAgLy8gICBraW5kOiBcIlNlcnZpY2VcIixcbiAgICAvLyAgIG1ldGFkYXRhOiB7IG5hbWU6IFwiaGVsbG8ta3ViZXJuZXRlc1wiIH0sXG4gICAgLy8gICBzcGVjOiB7XG4gICAgLy8gICAgIHR5cGU6IFwiTG9hZEJhbGFuY2VyXCIsXG4gICAgLy8gICAgIHBvcnRzOiBbeyBwb3J0OiA4MCwgdGFyZ2V0UG9ydDogODA4MCB9XSxcbiAgICAvLyAgICAgc2VsZWN0b3I6IGFwcExhYmVsXG4gICAgLy8gICB9XG4gICAgLy8gfTtcblxuICAgIC8vIGNsdXN0ZXIuYWRkUmVzb3VyY2UoJ2hlbGxvLWt1YicsIHNlcnZpY2UsIGRlcGxveW1lbnQpO1xuXG4gIH1cbn1cbiJdfQ==
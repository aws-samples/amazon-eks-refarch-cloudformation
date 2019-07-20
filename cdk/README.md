# Building Amazon EKS cluter and nodegroup with AWS CDK

This sample CDK scripts help you provision your Amaozn EKS cluster and nodegroup.


## Setup



```bash
# install the nvm installer
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash
# nvm install 
nvm install lts/dubnium
nvm alias default lts/dubnium
# install AWS CDK
npm i -g aws-cdk
# check cdk version, make sure your version >=1.0.0
cdk --version
1.0.0 (build d89592e)
# install other required npm modules
npm install
# build the index.ts to index.js with tsc
npm run build
# cdk bootstrapping
cdk bootstrap
# cdk synth
cdk synth
# cdk deploy
cdk deploy
```


CDK will provision Amazon EKS cluster as well as nodegroup in a single stack and generate outputs like this:

```
Outputs:
EKS-CDK-demo.eksdemocdkClusterNameE757A622 = eksdemo-cdk
EKS-CDK-demo.ClusterARN = arn:aws:eks:ap-northeast-1:903779448426:cluster/eksdemo-cdk
EKS-CDK-demo.eksdemocdkNodesInstanceRoleARN7B26F304 = arn:aws:iam::903779448426:role/EKS-CDK-demo-eksdemocdkNodesInstanceRoleAA83309B-BWBA4TG1XLJP
```

## update aws-auth

You need to specify your own NodeInstanceRoleARN above to replace the provided `aws-auth-cm.yaml` and update it with `kubectl apply`.


See [official document](https://docs.aws.amazon.com/en_us/eks/latest/userguide/add-user-role.html) for more details.

```bash
# we specify our NodeInstanceRoleARN generated from CDK, replacing the content of aws-auth-cm.yaml on-the-fly 
# followed by immediate 'kubectl apply -f'
# PLEASE MAKE SURE you specify your own MY_InstanceRole_ARN
MY_InstanceRole_ARN='arn:aws:iam::903779448426:role/EKS-CDK-demo-eksdemocdkNodesInstanceRoleAA83309B-BWBA4TG1XLJP'
curl -sL https://github.com/aws-samples/amazon-eks-refarch-cloudformation/raw/master/files/aws-auth-cm.yaml | \
sed -e "s?<your role arn here>?${MY_InstanceRole_ARN}?g" | kubectl apply -f -                                            
```

And then you'll be able to list the nodes
```
$ kubectl get no
NAME                                             STATUS     ROLES    AGE     VERSION
ip-10-0-17-49.ap-northeast-1.compute.internal    NotReady   <none>   9m50s   v1.13.7-eks-c57ff8
ip-10-0-22-228.ap-northeast-1.compute.internal   NotReady   <none>   9m50s   v1.13.7-eks-c57ff8
```


## Destroy the Stack

```bash
# destroy the stack
cdk destroy
```


## FAQ

1. How to specify different `region`?

You can pass `region` context variable like this:

```bash
# cdk synth
cdk synth -c region=us-west-2
# cdk deploy
cdk deploy -c region=us-west-2
```

2. Can I have different NAT gateway in each public subnet?

By default, this sample will generate only one single NAT gateway for you in one of the public subnets for cost saving and avoid reaching the max EIP number limit(default:5).
If you prefer to have different NAT gateway provisioned for each public subnet, just update the `vpc` constructor in `index.ts`.

```ts
        // VPC with public subnet in every AZ and private subnet in every AZ
        // each public subnet will privision individual NAT gateway with EIP attached.
        // This is how CDK provision VPC resource for you by default.
        const vpc = new ec2.Vpc(this, 'cdk-EKS-vpc');
        
        // VPC with only single NAT gateway in one of the public subnets
        // const vpc = new ec2.Vpc(this, 'TheVPC', {
        //   cidr: '10.0.0.0/16',
        //   natGateways: 1,
        //   natGatewaySubnets: {subnetName: 'Public'},
        //   subnetConfiguration: [
        //     {
        //       cidrMask: 22,
        //       name: 'Public',
        //       subnetType: ec2.SubnetType.PUBLIC, 
        //     },
        //     {
        //       cidrMask: 22,
        //       name: 'Private',
        //       subnetType: ec2.SubnetType.PRIVATE, 
        //     },
        //   ],
        // });   
```
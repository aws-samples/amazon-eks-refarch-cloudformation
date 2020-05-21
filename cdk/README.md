# Amazon EKS cluter with AWS CDK

This sample CDK scripts help you provision your Amaozn EKS cluster, a default nodegroup and kubernetes resources.



OK. Let's deploy our Amazon EKS stack.

## Deploy in a new VPC in default `AWS_REGION`

Make sure you have `nodejs` and `npm` installed.


```bash
# git clone the project
git clone https://github.com/aws-samples/amazon-eks-refarch-cloudformation.git
cd amazon-eks-refarch-cloudformation
# cd to the cdk sub-directory
cd cdk
# install other required npm modules
npm i
# cdk bootstrapping (only required for the 1st time)
npx cdk bootstrap
# cdk diff to see what will be created
npx cdk diff
# cdk deploy
npx cdk deploy
```

## Deploy in another AWS_REGION or existing VPC

Alternatively, to deploy in aother `AWS_REGION`

```bash
# only for the first time in this region
AWS_REGION=ap-northeast-1 npx cdk bootrap
# cdk diff
AWS_REGION=ap-northeast-1 npx cdk diff
AWS_REGION=ap-northeast-1 npx cdk depoy
```

To deploy in any existing VPC

```bash
# To deploy in the default vpc
npx cdk diff -c use_default_vpc=1
# To deploy in a specific VPC ID
npx cdk diff -c use_vpc_id=vpc-123456
```


Outputs

```bash
Outputs:
EksStack.ClusterConfigCommand43AAE40F = aws eks update-kubeconfig --name Cluster9EE0221C-233f6cc1cfd34875a1c0ab20608b7870 --region ap-northeast-1 --role-arn arn:aws:iam::112233445566:role/EksStack-AdminRole38563C57-XU0ZUABAG56M
EksStack.ClusterGetTokenCommand06AE992E = aws eks get-token --cluster-name Cluster9EE0221C-233f6cc1cfd34875a1c0ab20608b7870 --region ap-northeast-1 --role-arn arn:aws:iam::112233445566:role/EksStack-AdminRole38563C57-XU0ZUABAG56M
```

## Generate kubeconfig

Just copy and paste the Outputs and execute it to update your kubeconfig

```bash
aws eks update-kubeconfig --name Cluster9EE0221C-233f6cc1cfd34875a1c0ab20608b7870 --region ap-northeast-1 --role-arn arn:aws:iam::112233445566:role/EksStack-AdminRole38563C57-XU0ZUABAG56M
```

list the nodes

```bash
kubectl get no
```

```
NAME                                               STATUS   ROLES    AGE   VERSION
ip-172-31-50-156.ap-northeast-1.compute.internal   Ready    <none>   1m   v1.16.8-eks-e16311
ip-172-31-65-158.ap-northeast-1.compute.internal   Ready    <none>   1m   v1.16.8-eks-e16311
```



DONE!

This sample gives you:

1) A dedicated VPC with default configuration

2) Amazon EKS cluster in the VPC

3) A default managed nodegroup of **2x** `m5.large` instances

## Spot Instances

OK. Now we have a default cluster with a default managed nodegroup. Let's add spot instances into this cluster.


```bash
npx cdk diff -c with_spot_instances=yes
npx cdk deploy -c with_spot_instances=yes
```

## 2nd Managed Nodegroup


Append `-c with_2nd_nodegroup=yes` to add the 2nd nodegroup into the cluster.

## IAM Role for Service Account(IRSA)


Append `-c with_irsa=yes` to create a service account for a demo pod.


## Fargate Profile


Append `-c with_fargate_profile=yes` to create a fargate profile for this cluster.


## Destroy the stack

```bash
# destroy the stack
npx cdk destroy EksStack
```

## More examples

check the [README](https://github.com/aws/aws-cdk/tree/master/packages/%40aws-cdk/aws-eks) of AWS CDK EKS construct library for detaile useage.


# Amazon EKS cluter with AWS CDK

This sample CDK scripts help you provision your Amaozn EKS cluster, a default nodegroup and kubernetes resources.



## Setup

```bash
# install the nvm installer
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash
# nvm install 
nvm install lts/dubnium
nvm alias default lts/dubnium
# install AWS CDK CLI
npm i -g aws-cdk
# check cdk version
cdk --version
```

OK. Let's deploy our Amazon EKS stack.

## Deploy in a new VPC


```bash
# install other required npm modules
npm i
# cdk bootstrapping (only for the 1st time)
cdk bootstrap
# cdk diff to see what will be created
cdk diff
# cdk deploy
cdk deploy EksStack
```

## Deploy in another AWS_REGION or existing VPC

Alternatively, to deploy in aother `AWS_REGION`

```bash
# only for the first time in this region
AWS_REGION=ap-northeast-1 cdk bootrap
# cdk diff
AWS_REGION=ap-northeast-1 cdk diff
AWS_REGION=ap-northeast-1 cdk depoy
```

To deploy in any existing VPC

```bash
# To deploy in the default vpc
cdk diff -c use_default_vpc=1
# To deploy in a specific VPC ID
cdk diff -c use_vpc_id=vpc-123456
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
ip-172-31-84-250.ap-northeast-1.compute.internal   Ready    <none>   1m   v1.16.8-eks-e16311
```



DONE!

This sample gives you:

1) A dedicated VPC with default configuration

2) Amazon EKS cluster in the VPC

3) A default managed nodegroup of **2x** `m5.large` instances

4) **2x** `t3.large` spot instancs


## Destroy the stack

```bash
# destroy the stack
cdk destroy EksStack
```

## More examples

check the [README](https://github.com/aws/aws-cdk/tree/master/packages/%40aws-cdk/aws-eks) of AWS CDK EKS construct library for detaile useage.


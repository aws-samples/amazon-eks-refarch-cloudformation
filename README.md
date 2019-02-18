# eks-templates


#### Amazon EKS cloudformation templates

**pahud/eks-templates** aims to help you provision a ready-to-use Amazon EKS cluster by simply launching a cloudformation template with nested stacks. Supper easy and hassel-free!

![](images/arch-overview.png)

## Features

- [x] Creates both Amazon EKS `cluster` and `NodeGroup` in a single cloudformatoin template with nested stacks.
- [x] Abstracts away the CLI control in the `Makefile` - simply `make create-eks-cluster`, `make update-eks-cluster` and `make delete-eks-cluster`. That's all.
- [x] Fully support the latest Autoscaling Group features to hybrid on-demand and spot instances with mixed types and purchase options.
- [x] The cloudformation stack will help you automate the configuration on `aws-auth-cm` **ConfigMap** with AWS Lambda-backed `custom resource`.
- [x] No need to provision SpotFleet anymore.
- [x] on-demand instances will have node label **ondemand=yes**
- [x] spot instances will have node label **spotfleet=yes** and a **spotInstance=true:PreferNoSchedule** taint
- [x] support private subnets
- [x] support non-RFC1918 IP/CIDR VPC subnets
- [x] support the latest EKS-optimized AMI auto selection
- [x] support `pahud/eks-lambda-drainer` to help you `drain` the pods on terminating spot instances to protect your online workload.




## HOWTO

Create a `LambdaEKSAdminRole` IAM Role manually and we will use thie role to 
1) deploy the cloudformaiton stacks
2) execute the Lambda function as custom resource to help you configure the `aws-auth` ConfigMap so the nodes in the nodegroup can register themselves to the control plane.
3) `kubecl` will call Amazon EKS control plane as this IAM role for RBAC Auth.


```
$ aws iam create-role --role-name AmazonEKSAdminRole --assume-role-policy-document file://assume-role-policy.json
$ aws iam attach-role-policy --role-name AmazonEKSAdminRole --policy-arn arn:aws:iam::aws:policy/AmazonEC2FullAccess
$ aws iam attach-role-policy --role-name AmazonEKSAdminRole --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
$ aws iam put-role-policy --role-name AmazonEKSAdminRole --policy-name EKSAdminExtraPolicies --policy-document file://eks-admin-iam-polidy.json
```
get the role arn string. We will use the arn later.

```
$ aws iam get-role --role-name AmazonEKSAdminRole --query 'Role.Arn' --output text
arn:aws:iam::903779448426:role/AmazonEKSAdminRole
```

You **MUST** update `Makefile` and configure the following variables:

**CLUSTER_STACK_NAME** - the stack name and cluster name. default: `eksdemo`

**EKS_ADMIN_ROLE** - The `AmazonEKSAdminRole` arn described above.

**REGION** - The region code to deploy your EKS cluster. default: `ap-northeast-1`

**SSH_KEY_NAME** - Your existing SSH keypair name in AWS EC2 console. default: `aws-pahud` (please update this value)

**VPC_ID** - The VPC ID to deploy your nodegroup

**SUBNET1** The 1st subnet ID to deploy your nodegroup

**SUBNET2** The 2nd subnet ID to deploy your nodegroup

**SUBNET3** The 3rd subnet ID to deploy your nodegroup


OK. Let's create the complete Amazon EKS cluster and nodegroup

```
$ make create-eks-cluster
```
You may override the default values like this
```
$ REGION=ap-northeast-1 EKS_ADMIN_ROLE=arn:aws:iam::903779448426:role/AmazonEKSAdminRole CLUSTER_STACK_NAME=eksdemo10 make create-eks-cluster
```
response
```
{
    "StackId": "arn:aws:cloudformation:ap-northeast-1:903779448426:stack/eksdemo10/b3ebf5c0-3395-11e9-bfb3-0a4b1943673a"
}
```

![](images/11.png)

Behind the scene, a cloudformation stack with `4` nested stacks will be created:

1. **eksdemo** - the primary stack containing 4 nested stacks
2. **eksdemo-CL** - the control plane and security group
3. **eksdemo-NG** - the nodegroup
4. **eksdemo-CM** - the custom resource to update the `aws-auth` ConfigMap
5. **eksdemo-CM-xxx** - the custom resource lambda function as `AWS::Serverless::Application` resource from `SAR(Serverless Application Repository)`


# Test and Validate

On cloudformation stack complete

`update-kubeconfig` as the following command

```
$ aws --region ap-northeast-1 eks update-kubeconfig --name eksdemo --role-arn arn:aws:iam::903779448426:role/LambdaEKSAdminRole
```
try list the nodes

```
$ kubectl get no
NAME                                                STATUS    ROLES     AGE       VERSION
ip-100-64-181-184.ap-northeast-1.compute.internal   Ready     <none>    4m        v1.11.5
ip-100-64-211-68.ap-northeast-1.compute.internal    Ready     <none>    4m        v1.11.5
ip-100-64-252-139.ap-northeast-1.compute.internal   Ready     <none>    4m        v1.11.5
ip-100-64-70-247.ap-northeast-1.compute.internal    Ready     <none>    4m        v1.11.5

```

Your cluster is ready now.



## Node Labels, Taints and Tolerations

By default, all the on-demand instances will have **asgnode=yes** label while spot instances will have **spotfleet=yes**. Use the node selector to better schedule your workload



![](images/01.png)

Additionally, all the spot instances have a **spotInstance=true:PreferNoSchedule** taint. To deploy your Pod on spot instances, use the node label selector to specify **spotfleet=yes**, otherwise the pod will not be scheduled on the spot instances unless it has relevant toleration. ([Taint and Toleration in Kubernetes](https://kubernetes.io/docs/concepts/configuration/taint-and-toleration/)).


# Spot Termination Handling

Worried about the spot instance termination? Check [**pahud/eks-lambda-drainer**](https://github.com/pahud/eks-lambda-drainer) to learn how to handle the spot instance termination 120 seconds before the final execution of the termination and get your all running pods re-scheduled onto another node.

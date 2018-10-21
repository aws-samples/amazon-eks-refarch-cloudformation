# eks-templates



#### EKS nodeGroup with SpotFleet or ASG w/ spot instance support

*This is an complementary cloudformation template that help you optionally choose spot fleet or ASG w/ spot instances to provision your Amazon EKS node group.*



![](images/00.png)

## HOWTO

1. Use **eksctl** to provision your Amazon EKS cluster([walkthrough guide](https://github.com/pahud/amazon-eks-workshop/blob/master/00-getting-started/create-eks-with-eksctl.md))
2. Use this alternative cloudformation template to update the nodegroup created by **eksctl** - https://s3-us-west-2.amazonaws.com/pahud-cfn-us-west-2/eks-templates/cloudformation/nodegroup.yaml


This template will generate both ASG and Spot Fleet for you. You can optionally let ASG to provision on-demand instances for you while SpotFleet provision diversified spot instances registering into the same Kubernetes cluster.


## AWS CLI sample

You may use `aws-cli` to deploy the cloudformation stack as below with your own parameter overrides.

```
#!/bin/bash

aws cloudformation deploy --template-file cloudformation/nodegroup.yaml  \
--stack-name eksdemo-ng \
--capabilities CAPABILITY_IAM \
--parameter-overrides \
VpcId=vpc-05ce35780c6cc0d93 \
ClusterControlPlaneSecurityGroup=sg-03cd819b59679a610 \
ClusterName=eksdemo \
KeyName=aws-pahud \
NodeGroupName=default \
OnDemandOrSpotWithASG=Spot \
Subnets=subnet-014a0b4b71d52c131,subnet-0bb8ff0ab066889b3,subnet-0eeb0b7923862c3e3 \
```


## Node Labels, Taints and Tolerations

By default, all the on-demand instances managed by ASG(Autoscaling Group) will have the label **asgnode=true** while the spot instances will have **spotfleet=true**. Use the node selector to better schedule your workload



![](images/01.png)



Additionally, all the spot instances have a **spotInstance=true:PreferNoSchedule** taint. To deploy your Pod on spot instances, use the node label selector to specify **spotfleet=true**, otherwise the pod will not be scheduled on the spot instances unless it has relevant toleration. ([Taint and Toleration in Kubernetes](https://kubernetes.io/docs/concepts/configuration/taint-and-toleration/)).

![](images/02.png)


# Spot Termination Handling

Worried about the spot instance termination? Check [**pahud/eks-lambda-drainer**](https://github.com/pahud/eks-lambda-drainer) to learn how to handle the spot instance termination 120 seconds before the final execution of the termination and get your all running pods re-scheduled onto another node.

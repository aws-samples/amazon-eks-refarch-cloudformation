# eks-templates



#### EKS nodeGroup with SpotFleet or ASG w/ spot instance support

*This is an complementary cloudformation template that help you optionally choose spot fleet or ASG w/ spot instances to provision your Amazon EKS node group.*

#### HOWTO

1. follow the official Amazon EKS document to provision the VPC and create the EKS cluster
2. use this alternative cloudformation template to provision your node group - https://s3-us-west-2.amazonaws.com/pahud-cfn-us-west-2/eks-templates/cloudformation/nodegroup.yaml



This template will generate both ASG and Spot Fleet for you. You can optionally let ASG to provision on-demand instances for you while SpotFleet provision diversified spot instances registering into the same Kubernetes cluster.
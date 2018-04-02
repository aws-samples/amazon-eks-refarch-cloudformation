# eks-templates



#### EKS nodeGroup with SpotFleet or ASG w/ spot instance support

*This is an complementary cloudformation template that help you optionally choose spot fleet or ASG w/ spot instances to provision your Amazon EKS node group.*

#### HOWTO

1. follow the official Amazon EKS document to provision the VPC and create the EKS cluster
2. use this alternative cloudformation template to provision your node group - https://s3-us-west-2.amazonaws.com/pahud-cfn-us-west-2/eks-templates/cloudformation/nodegroup.yaml
3. Select **AutoscalingGroup** in **AsgOrSpotFleet** if you prefer Autoscaling Group to manage your Amazon EKS node group
   1. Select **Spot** in **OnDemandOrSpotWithASG** if you prefer Autoscaling Group to provision spot instances for you, otherwise, select **On Demand**.
4. Select **SpotFleet** in **AsgOrSpotFleet** if you prefer Spot Fleet to manage your Amazon EKS node group
5. Specify **SpotPrice** in *Spot Configuration* if you prefer to set the max price for spot instance/hour, otherwise the default **0** means use default (recommended), which means to provision Spot instances at the current Spot price capped at the On-Demand price.
6. In **SpotFleetAllocationStrategy**, specify **lowestPrice** for the most cost saving, otherwise, **diversified** for  instance spreading across multiple instance families.
ROOT ?= $(shell pwd)
AWS_ACCOUNT_ID := $(shell aws sts get-caller-identity --query 'Account' --output text)
EKS_YAML_URL ?= https://s3-us-west-2.amazonaws.com/pahud-cfn-us-west-2/eks-templates/cloudformation/eks.yaml
#EKS_YAML_URL ?= file://cloudformation/eks.yaml
NODEGROUP_YAML ?= https://s3-us-west-2.amazonaws.com/pahud-cfn-us-west-2/eks-templates/cloudformation/cluster.yaml
CLUSTER_YAML ?= https://s3-us-west-2.amazonaws.com/pahud-cfn-us-west-2/eks-templates/cloudformation/cluster.yaml
CLUSTER_STACK_NAME ?= eksdemo
CLUSTER_NAME ?= eksdemo
CLUSTER_ROLE_ARN ?= arn:aws:iam::$(AWS_ACCOUNT_ID):role/eksServiceRole
REGION ?= ap-northeast-1
SSH_KEY_NAME ?= 'aws-pahud'
VPC_ID ?= vpc-e549a281
# security group IDs
SG_ID ?= sg-064d7e7c3fd058fc0
OnDemandBaseCapacity ?= 0
NodeAutoScalingGroupMinSize ?= 1
NodeAutoScalingGroupDesiredSize ?= 4
NodeAutoScalingGroupMaxSize ?= 5


.PHONY: all deploy clean sync update-ami update-yaml

all: deploy

sync: deploy

update-ami:
	@aws s3 cp files/eks-latest-ami.yaml s3://pahud-eks-templates/eks-latest-ami.yaml --acl public-read


update-yaml:
	#aws --region us-west-2 s3 sync cloudformation s3://pahud-cfn-us-west-2/eks-templates/cloudformation/ --acl public-read
	# @aws --region us-west-2 s3 cp cloudformation/nodegroup-dev.yaml s3://pahud-cfn-us-west-2/eks-templates/cloudformation/nodegroup-dev.yaml --acl public-read
	@aws --region us-west-2 s3 cp cloudformation/nodegroup.yaml s3://pahud-cfn-us-west-2/eks-templates/cloudformation/nodegroup.yaml --acl public-read
	@aws --region us-west-2 s3 cp cloudformation/eks.yaml s3://pahud-cfn-us-west-2/eks-templates/cloudformation/eks.yaml --acl public-read
	@echo https://s3-us-west-2.amazonaws.com/pahud-cfn-us-west-2/eks-templates/cloudformation/eks.yaml

clean:
	echo "done"
	
create-eks-cluster:
	@aws --region $(REGION) cloudformation create-stack --template-url $(EKS_YAML_URL) \
	--stack-name  $(CLUSTER_STACK_NAME) \
	--capabilities CAPABILITY_IAM CAPABILITY_AUTO_EXPAND \
	--parameters \
	ParameterKey=VpcId,ParameterValue=$(VPC_ID) \
	ParameterKey=SecurityGroupIds,ParameterValue=$(SG_ID) \
	ParameterKey=ClusterName,ParameterValue=$(CLUSTER_NAME) \
	ParameterKey=ClusterRoleArn,ParameterValue=$(CLUSTER_ROLE_ARN) \
	ParameterKey=KeyName,ParameterValue=$(SSH_KEY_NAME) \
	ParameterKey=OnDemandBaseCapacity,ParameterValue=$(OnDemandBaseCapacity) \
	ParameterKey=NodeAutoScalingGroupMinSize,ParameterValue=$(NodeAutoScalingGroupMinSize) \
	ParameterKey=NodeAutoScalingGroupDesiredSize,ParameterValue=$(NodeAutoScalingGroupDesiredSize) \
	ParameterKey=NodeAutoScalingGroupMaxSize,ParameterValue=$(NodeAutoScalingGroupMaxSize) \
	ParameterKey=SubnetIds,ParameterValue=subnet-05b643f57a6997deb\\,subnet-09e79eb1dec82b7e2\\,subnet-0c365d97cbc75ceec
	
update-eks-cluster:
	@aws --region $(REGION) cloudformation update-stack --template-url $(EKS_YAML_URL) \
	--stack-name  $(CLUSTER_STACK_NAME) \
	--capabilities CAPABILITY_IAM CAPABILITY_AUTO_EXPAND \
	--parameters \
	ParameterKey=VpcId,ParameterValue=$(VPC_ID) \
	ParameterKey=SecurityGroupIds,ParameterValue=$(SG_ID) \
	ParameterKey=ClusterName,ParameterValue=$(CLUSTER_NAME) \
	ParameterKey=ClusterRoleArn,ParameterValue=$(CLUSTER_ROLE_ARN) \
	ParameterKey=KeyName,ParameterValue=$(SSH_KEY_NAME) \
	ParameterKey=OnDemandBaseCapacity,ParameterValue=$(OnDemandBaseCapacity) \
	ParameterKey=NodeAutoScalingGroupMinSize,ParameterValue=$(NodeAutoScalingGroupMinSize) \
	ParameterKey=NodeAutoScalingGroupDesiredSize,ParameterValue=$(NodeAutoScalingGroupDesiredSize) \
	ParameterKey=NodeAutoScalingGroupMaxSize,ParameterValue=$(NodeAutoScalingGroupMaxSize) \
	ParameterKey=SubnetIds,ParameterValue=subnet-05b643f57a6997deb\\,subnet-09e79eb1dec82b7e2\\,subnet-0c365d97cbc75ceec
	
delete-eks-cluster:
	@aws --region $(REGION) cloudformation delete-stack --stack-name "$(CLUSTER_STACK_NAME)"
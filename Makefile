SECRETS_FILE ?= secrets.mk
ifeq ($(shell test -e $(SECRETS_FILE) && echo -n yes),yes)
    include $(SECRETS_FILE)
endif
CUSTOM_FILE ?= custom.mk
ifeq ($(shell test -e $(CUSTOM_FILE) && echo -n yes),yes)
    include $(CUSTOM_FILE)
endif

ifeq ($(UPDATE_AMI),1)
	ForceUpdateAMI ?= $(shell date +%s)
else
	ForceUpdateAMI ?= placeholder 
endif

ROOT ?= $(shell pwd)
AWS_ACCOUNT_ID := $(shell aws sts get-caller-identity --query 'Account' --output text)
YAML_BRANCH ?= stable
EKS_YAML_URL ?= https://s3-us-west-2.amazonaws.com/pahud-cfn-us-west-2/eks-templates/cloudformation/eks-$(YAML_BRANCH).yaml
# CLUSTER_YAML ?= https://s3-us-west-2.amazonaws.com/pahud-cfn-us-west-2/eks-templates/cloudformation/cluster.yaml
CLUSTER_STACK_NAME ?= eksdemo
CLUSTER_NAME ?= $(CLUSTER_STACK_NAME)
EKS_ADMIN_ROLE ?= arn:aws:iam::903779448426:role/AmazonEKSAdminRole
REGION ?= ap-northeast-1
SSH_KEY_NAME ?= 'aws-pahud'
VPC_ID ?= vpc-e549a281
SUBNET1 ?= subnet-05b643f57a6997deb
SUBNET2 ?= subnet-09e79eb1dec82b7e2
SUBNET3 ?= subnet-0c365d97cbc75ceec
OnDemandBaseCapacity ?= 1
NodeAutoScalingGroupMinSize ?= 0
NodeAutoScalingGroupDesiredSize ?= 4
NodeAutoScalingGroupMaxSize ?= 5
NodeVolumeSize ?= 20
ASGAutoAssignPublicIp ?= yes
ClusterVersion ?= latest
InstanceTypesOverride ?= 't3.medium,t3.large,t3.xlarge'
EnableNodeDrainer ?= no



.PHONY: sam-dev-package
sam-dev-package:
	@docker run -ti \
	-v $(PWD):/home/samcli/workdir \
	-v $(HOME)/.aws:/home/samcli/.aws \
	-w /home/samcli/workdir \
	-e AWS_DEFAULT_REGION=$(REGION) \
	pahud/aws-sam-cli:latest sam package --template-file ./cloudformation/configmap-sar.yaml --s3-bucket $(S3BUCKET) --output-template-file ./cloudformation/configmap-sar-packaged.yaml
	

.PHONY: all
all: deploy

.PHONY: sync
sync: deploy

.PHONY: update-ami
update-ami:
	@aws s3 cp files/eks-latest-ami.yaml s3://pahud-eks-templates/eks-latest-ami.yaml --acl public-read


.PHONY: update-yaml
update-stable-yaml:
	@aws --region us-west-2 s3 cp cloudformation/eks.yaml s3://pahud-cfn-us-west-2/eks-templates/cloudformation/eks-stable.yaml --acl public-read
	@aws --region us-west-2 s3 cp cloudformation/ami.yaml s3://pahud-cfn-us-west-2/eks-templates/cloudformation/ami-stable.yaml --acl public-read
	@aws --region us-west-2 s3 cp cloudformation/cluster.yaml s3://pahud-cfn-us-west-2/eks-templates/cloudformation/cluster-stable.yaml --acl public-read
	@aws --region us-west-2 s3 cp cloudformation/nodegroup.yaml s3://pahud-cfn-us-west-2/eks-templates/cloudformation/nodegroup-stable.yaml --acl public-read
	@aws --region us-west-2 s3 cp cloudformation/configmap.yaml s3://pahud-cfn-us-west-2/eks-templates/cloudformation/configmap-stable.yaml --acl public-read
	@aws --region us-west-2 s3 cp cloudformation/configmap-sar.yaml s3://pahud-cfn-us-west-2/eks-templates/cloudformation/configmap-sar-stable.yaml --acl public-read
	@aws --region us-west-2 s3 cp cloudformation/eks-lambda-drainer.yaml s3://pahud-cfn-us-west-2/eks-templates/cloudformation/eks-lambda-drainer-stable.yaml --acl public-read
	@echo https://s3-us-west-2.amazonaws.com/pahud-cfn-us-west-2/eks-templates/cloudformation/eks-stable.yaml

.PHONY: update-dev-yaml	
update-dev-yaml: 
	@aws --region us-west-2 s3 cp cloudformation/eks.yaml s3://pahud-cfn-us-west-2/eks-templates/cloudformation/eks-dev.yaml --acl public-read
	@aws --region us-west-2 s3 cp cloudformation/ami.yaml s3://pahud-cfn-us-west-2/eks-templates/cloudformation/ami-dev.yaml --acl public-read
	@aws --region us-west-2 s3 cp cloudformation/cluster.yaml s3://pahud-cfn-us-west-2/eks-templates/cloudformation/cluster-dev.yaml --acl public-read
	@aws --region us-west-2 s3 cp cloudformation/nodegroup.yaml s3://pahud-cfn-us-west-2/eks-templates/cloudformation/nodegroup-dev.yaml --acl public-read
	@aws --region us-west-2 s3 cp cloudformation/configmap.yaml s3://pahud-cfn-us-west-2/eks-templates/cloudformation/configmap-dev.yaml --acl public-read
	@aws --region us-west-2 s3 cp cloudformation/configmap-sar.yaml s3://pahud-cfn-us-west-2/eks-templates/cloudformation/configmap-sar-dev.yaml --acl public-read
	@aws --region us-west-2 s3 cp cloudformation/eks-lambda-drainer.yaml s3://pahud-cfn-us-west-2/eks-templates/cloudformation/eks-lambda-drainer-dev.yaml --acl public-read
	@echo https://s3-us-west-2.amazonaws.com/pahud-cfn-us-west-2/eks-templates/cloudformation/eks-dev.yaml

.PHONY: clean
clean:
	echo "done"

.PHONY: create-eks-cluster	
create-eks-cluster:
	@aws --region $(REGION) cloudformation create-stack --template-url $(EKS_YAML_URL) \
	--stack-name  $(CLUSTER_STACK_NAME) \
	--role-arn $(EKS_ADMIN_ROLE) \
	--capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM CAPABILITY_AUTO_EXPAND \
	--parameters \
	ParameterKey=VpcId,ParameterValue="$(VPC_ID)" \
	ParameterKey=ClusterName,ParameterValue="$(CLUSTER_NAME)" \
	ParameterKey=ClusterVersion,ParameterValue="$(ClusterVersion)" \
	ParameterKey=YamlBranch,ParameterValue="$(YAML_BRANCH)" \
	ParameterKey=KeyName,ParameterValue="$(SSH_KEY_NAME)" \
	ParameterKey=LambdaRoleArn,ParameterValue="$(EKS_ADMIN_ROLE)" \
	ParameterKey=OnDemandBaseCapacity,ParameterValue="$(OnDemandBaseCapacity)" \
	ParameterKey=NodeAutoScalingGroupMinSize,ParameterValue="$(NodeAutoScalingGroupMinSize)" \
	ParameterKey=NodeAutoScalingGroupDesiredSize,ParameterValue="$(NodeAutoScalingGroupDesiredSize)" \
	ParameterKey=NodeAutoScalingGroupMaxSize,ParameterValue="$(NodeAutoScalingGroupMaxSize)" \
	ParameterKey=NodeVolumeSize,ParameterValue="$(NodeVolumeSize)" \
	ParameterKey=InstanceTypesOverride,ParameterValue="$(InstanceTypesOverride)" \
	ParameterKey=ASGAutoAssignPublicIp,ParameterValue="$(ASGAutoAssignPublicIp)" \
	ParameterKey=EnableNodeDrainer,ParameterValue="$(EnableNodeDrainer)" \
	ParameterKey=SubnetIds,ParameterValue=$(SUBNET1)\\,$(SUBNET2)\\,$(SUBNET3) \
	ParameterKey=ExtraNodeSecurityGroups,ParameterValue=$(ExtraNodeSecurityGroups) \
	ParameterKey=ExistingNodeSecurityGroups,ParameterValue=$(ExistingNodeSecurityGroups) 
	@echo click "https://console.aws.amazon.com/cloudformation/home?region=$(REGION)#/stacks to see the details"


.PHONY: update-eks-cluster	
update-eks-cluster:
	@aws --region $(REGION) cloudformation update-stack --template-url $(EKS_YAML_URL) \
	--stack-name  $(CLUSTER_STACK_NAME) \
	--role-arn  $(EKS_ADMIN_ROLE) \
	--capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM CAPABILITY_AUTO_EXPAND \
	--parameters \
	ParameterKey=VpcId,ParameterValue="$(VPC_ID)" \
	ParameterKey=ClusterName,ParameterValue="$(CLUSTER_NAME)" \
	ParameterKey=ClusterVersion,ParameterValue="$(ClusterVersion)" \
	ParameterKey=YamlBranch,ParameterValue="$(YAML_BRANCH)" \
	ParameterKey=KeyName,ParameterValue="$(SSH_KEY_NAME)" \
	ParameterKey=LambdaRoleArn,ParameterValue="$(EKS_ADMIN_ROLE)" \
	ParameterKey=OnDemandBaseCapacity,ParameterValue="$(OnDemandBaseCapacity)" \
	ParameterKey=NodeAutoScalingGroupMinSize,ParameterValue="$(NodeAutoScalingGroupMinSize)" \
	ParameterKey=NodeAutoScalingGroupDesiredSize,ParameterValue="$(NodeAutoScalingGroupDesiredSize)" \
	ParameterKey=NodeAutoScalingGroupMaxSize,ParameterValue="$(NodeAutoScalingGroupMaxSize)" \
	ParameterKey=NodeVolumeSize,ParameterValue="$(NodeVolumeSize)" \
	ParameterKey=InstanceTypesOverride,ParameterValue="$(InstanceTypesOverride)" \
	ParameterKey=ASGAutoAssignPublicIp,ParameterValue="$(ASGAutoAssignPublicIp)" \
	ParameterKey=EnableNodeDrainer,ParameterValue="$(EnableNodeDrainer)" \
	ParameterKey=ForceUpdateAMI,ParameterValue="$(ForceUpdateAMI)" \
	ParameterKey=SubnetIds,ParameterValue=$(SUBNET1)\\,$(SUBNET2)\\,$(SUBNET3) \
	ParameterKey=ExtraNodeSecurityGroups,ParameterValue=$(ExtraNodeSecurityGroups) \
	ParameterKey=ExistingNodeSecurityGroups,ParameterValue=$(ExistingNodeSecurityGroups) 
	@echo click "https://console.aws.amazon.com/cloudformation/home?region=$(REGION)#/stacks to see the details"

	
.PHONY: delete-eks-cluster	
delete-eks-cluster:
	@aws --region $(REGION) cloudformation delete-stack --role-arn $(EKS_ADMIN_ROLE) --stack-name "$(CLUSTER_STACK_NAME)"
	@echo click "https://console.aws.amazon.com/cloudformation/home?region=$(REGION)#/stacks to see the details"


.PHONY: deploy-pl
deploy-pl:
	@aws --region us-west-2 cloudformation create-stack --template-body file://cloudformation/codepipeline.yml \
	--stack-name  eksGlobalPL \
	--parameters \
	ParameterKey=GitHubToken,ParameterValue=$(GitHubToken) \
	ParameterKey=CloudFormationExecutionRole,ParameterValue=$(EKS_ADMIN_ROLE) \
	ParameterKey=OnDemandBaseCapacity,ParameterValue=$(OnDemandBaseCapacity) \
	--capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM CAPABILITY_AUTO_EXPAND 

.PHONY: update-pl
update-pl:
	@aws --region us-west-2 cloudformation update-stack --template-body file://cloudformation/codepipeline.yml \
	--stack-name  eksGlobalPL \
	--parameters \
	ParameterKey=GitHubToken,ParameterValue=$(GitHubToken) \
	ParameterKey=CloudFormationExecutionRole,ParameterValue=$(EKS_ADMIN_ROLE) \
	ParameterKey=OnDemandBaseCapacity,ParameterValue=$(OnDemandBaseCapacity) \
	ParameterKey=NodeAutoScalingGroupDesiredSize,ParameterValue=$(NodeAutoScalingGroupDesiredSize) \
	--capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM CAPABILITY_AUTO_EXPAND 
	
.PHONY: delete-pl-stacks
delete-pl-stacks:
	# delete all cfn stacks provisioned from the pipeline
	@aws --region us-west-2 cloudformation update-stack --template-body file://cloudformation/codepipeline.yml \
	--stack-name  eksGlobalPL \
	--parameters \
	ParameterKey=GitHubToken,ParameterValue=$(GitHubToken) \
	ParameterKey=ActionMode,ParameterValue=DELETE_ONLY \
	ParameterKey=CloudFormationExecutionRole,ParameterValue=$(EKS_ADMIN_ROLE) \
	--capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM CAPABILITY_AUTO_EXPAND 	
	
.PHONY: delete-pl
delete-pl:
	@aws --region us-west-2 cloudformation delete-stack --stack-name eksGlobalPL

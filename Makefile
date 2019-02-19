ROOT ?= $(shell pwd)
AWS_ACCOUNT_ID := $(shell aws sts get-caller-identity --query 'Account' --output text)
EKS_YAML_URL ?= https://s3-us-west-2.amazonaws.com/pahud-cfn-us-west-2/eks-templates/cloudformation/eks-dev.yaml
CLUSTER_YAML ?= https://s3-us-west-2.amazonaws.com/pahud-cfn-us-west-2/eks-templates/cloudformation/cluster.yaml
CLUSTER_STACK_NAME ?= eksdemo
CLUSTER_NAME ?= $(CLUSTER_STACK_NAME)
#CLUSTER_NAME ?= eksdemo3
CLUSTER_ROLE_ARN ?= arn:aws:iam::$(AWS_ACCOUNT_ID):role/eksServiceRole
EKS_ADMIN_ROLE ?= arn:aws:iam::903779448426:role/LambdaEKSAdminRole
REGION ?= ap-northeast-1
SSH_KEY_NAME ?= 'aws-pahud'
VPC_ID ?= vpc-e549a281
SUBNET1 ?= subnet-05b643f57a6997deb
SUBNET2 ?= subnet-09e79eb1dec82b7e2
SUBNET3 ?= subnet-0c365d97cbc75ceec
OnDemandBaseCapacity ?= 0
NodeAutoScalingGroupMinSize ?= 1
NodeAutoScalingGroupDesiredSize ?= 4
NodeAutoScalingGroupMaxSize ?= 5


.PHONY: all deploy clean sync update-ami update-yaml


.PHONY: sam-dev-package
sam-dev-package:
	@docker run -ti \
	-v $(PWD):/home/samcli/workdir \
	-v $(HOME)/.aws:/home/samcli/.aws \
	-w /home/samcli/workdir \
	-e AWS_DEFAULT_REGION=$(REGION) \
	pahud/aws-sam-cli:latest sam package --template-file ./cloudformation/configmap-sar.yaml --s3-bucket pahud-nrt --output-template-file ./cloudformation/configmap-sar-packaged.yaml
	
	

all: deploy

sync: deploy

update-ami:
	@aws s3 cp files/eks-latest-ami.yaml s3://pahud-eks-templates/eks-latest-ami.yaml --acl public-read


update-yaml:
	#aws --region us-west-2 s3 sync cloudformation s3://pahud-cfn-us-west-2/eks-templates/cloudformation/ --acl public-read
	@aws --region us-west-2 s3 cp cloudformation/nodegroup.yaml s3://pahud-cfn-us-west-2/eks-templates/cloudformation/nodegroup.yaml --acl public-read
	@aws --region us-west-2 s3 cp cloudformation/eks.yaml s3://pahud-cfn-us-west-2/eks-templates/cloudformation/eks.yaml --acl public-read
	@echo https://s3-us-west-2.amazonaws.com/pahud-cfn-us-west-2/eks-templates/cloudformation/eks.yaml

.PHONY: update-dev-yaml	
update-dev-yaml: update-cm-yaml
	@aws --region us-west-2 s3 cp cloudformation/eks.yaml s3://pahud-cfn-us-west-2/eks-templates/cloudformation/eks-dev.yaml --acl public-read
	@aws --region us-west-2 s3 cp cloudformation/cluster.yaml s3://pahud-cfn-us-west-2/eks-templates/cloudformation/cluster-dev.yaml --acl public-read
	@aws --region us-west-2 s3 cp cloudformation/nodegroup.yaml s3://pahud-cfn-us-west-2/eks-templates/cloudformation/nodegroup-dev.yaml --acl public-read
	@aws --region us-west-2 s3 cp cloudformation/configmap.yaml s3://pahud-cfn-us-west-2/eks-templates/cloudformation/configmap-dev.yaml --acl public-read
	#@aws --region us-west-2 s3 cp cloudformation/configmap-sar.yaml s3://pahud-cfn-us-west-2/eks-templates/cloudformation/configmap-sar-dev.yaml --acl public-read
	@echo https://s3-us-west-2.amazonaws.com/pahud-cfn-us-west-2/eks-templates/cloudformation/eks-dev.yaml


update-cm-yaml: update-cm-yaml-us-west-2 update-cm-yaml-us-east-1 update-cm-yaml-us-east-2 update-cm-yaml-eu-west-1 update-cm-yaml-eu-north-1 update-cm-yaml-eu-central-1 update-cm-yaml-ap-northeast-1 update-cm-yaml-ap-northeast-2 update-cm-yaml-ap-southeast-1 update-cm-yaml-ap-southeast-2

update-cm-yaml-us-west-2:
	@sed 's/ap-northeast-1/us-west-2/g' cloudformation/configmap-sar.yaml > cloudformation/configmap-sar.yaml.tmp
	@aws --region us-west-2 s3 cp cloudformation/configmap-sar.yaml.tmp s3://pahud-cfn-us-west-2/eks-templates/cloudformation/configmap-sar-dev-us-west-2.yaml --acl public-read

update-cm-yaml-us-east-1:
	@sed 's/ap-northeast-1/us-east-1/g' cloudformation/configmap-sar.yaml > cloudformation/configmap-sar.yaml.tmp
	@aws --region us-west-2 s3 cp cloudformation/configmap-sar.yaml.tmp s3://pahud-cfn-us-west-2/eks-templates/cloudformation/configmap-sar-dev-us-east-1.yaml --acl public-read

update-cm-yaml-us-east-2:
	@sed 's/ap-northeast-1/us-east-2/g' cloudformation/configmap-sar.yaml > cloudformation/configmap-sar.yaml.tmp
	@aws --region us-west-2 s3 cp cloudformation/configmap-sar.yaml.tmp s3://pahud-cfn-us-west-2/eks-templates/cloudformation/configmap-sar-dev-us-east-2.yaml --acl public-read

update-cm-yaml-eu-west-1:
	@sed 's/ap-northeast-1/eu-west-1/g' cloudformation/configmap-sar.yaml > cloudformation/configmap-sar.yaml.tmp
	@aws --region us-west-2 s3 cp cloudformation/configmap-sar.yaml.tmp s3://pahud-cfn-us-west-2/eks-templates/cloudformation/configmap-sar-dev-eu-west-1.yaml --acl public-read

update-cm-yaml-eu-north-1:
	@sed 's/ap-northeast-1/eu-north-1/g' cloudformation/configmap-sar.yaml > cloudformation/configmap-sar.yaml.tmp
	@aws --region us-west-2 s3 cp cloudformation/configmap-sar.yaml.tmp s3://pahud-cfn-us-west-2/eks-templates/cloudformation/configmap-sar-dev-eu-north-1.yaml --acl public-read

update-cm-yaml-eu-central-1:
	@sed 's/ap-northeast-1/eu-central-1/g' cloudformation/configmap-sar.yaml > cloudformation/configmap-sar.yaml.tmp
	@aws --region us-west-2 s3 cp cloudformation/configmap-sar.yaml.tmp s3://pahud-cfn-us-west-2/eks-templates/cloudformation/configmap-sar-dev-eu-central-1.yaml --acl public-read

update-cm-yaml-ap-northeast-1:
	@aws --region us-west-2 s3 cp cloudformation/configmap-sar.yaml.tmp s3://pahud-cfn-us-west-2/eks-templates/cloudformation/configmap-sar-dev-ap-northeast-1.yaml --acl public-read

update-cm-yaml-ap-northeast-2:
	@sed 's/ap-northeast-1/ap-northeast-2/g' cloudformation/configmap-sar.yaml > cloudformation/configmap-sar.yaml.tmp
	@aws --region us-west-2 s3 cp cloudformation/configmap-sar.yaml.tmp s3://pahud-cfn-us-west-2/eks-templates/cloudformation/configmap-sar-dev-ap-northeast-2.yaml --acl public-read

update-cm-yaml-ap-southeast-1:
	@sed 's/ap-northeast-1/ap-southeast-1/g' cloudformation/configmap-sar.yaml > cloudformation/configmap-sar.yaml.tmp
	@aws --region us-west-2 s3 cp cloudformation/configmap-sar.yaml.tmp s3://pahud-cfn-us-west-2/eks-templates/cloudformation/configmap-sar-dev-ap-southeast-1.yaml --acl public-read

update-cm-yaml-ap-southeast-2:
	@sed 's/ap-northeast-1/ap-southeast-2/g' cloudformation/configmap-sar.yaml > cloudformation/configmap-sar.yaml.tmp
	@aws --region us-west-2 s3 cp cloudformation/configmap-sar.yaml.tmp s3://pahud-cfn-us-west-2/eks-templates/cloudformation/configmap-sar-dev-ap-southeast-2.yaml --acl public-read

	


clean:
	echo "done"
	
create-eks-cluster:
	@aws --region $(REGION) cloudformation create-stack --template-url $(EKS_YAML_URL) \
	--stack-name  $(CLUSTER_STACK_NAME) \
	--role-arn $(EKS_ADMIN_ROLE) \
	--capabilities CAPABILITY_IAM CAPABILITY_AUTO_EXPAND \
	--parameters \
	ParameterKey=VpcId,ParameterValue=$(VPC_ID) \
	ParameterKey=ClusterName,ParameterValue=$(CLUSTER_NAME) \
	ParameterKey=ClusterRoleArn,ParameterValue=$(CLUSTER_ROLE_ARN) \
	ParameterKey=KeyName,ParameterValue=$(SSH_KEY_NAME) \
	ParameterKey=LambdaRoleArn,ParameterValue=$(EKS_ADMIN_ROLE) \
	ParameterKey=OnDemandBaseCapacity,ParameterValue=$(OnDemandBaseCapacity) \
	ParameterKey=NodeAutoScalingGroupMinSize,ParameterValue=$(NodeAutoScalingGroupMinSize) \
	ParameterKey=NodeAutoScalingGroupDesiredSize,ParameterValue=$(NodeAutoScalingGroupDesiredSize) \
	ParameterKey=NodeAutoScalingGroupMaxSize,ParameterValue=$(NodeAutoScalingGroupMaxSize) \
	ParameterKey=SubnetIds,ParameterValue=$(SUBNET1)\\,$(SUBNET2)\\,$(SUBNET3)
	
update-eks-cluster:
	@aws --region $(REGION) cloudformation update-stack --template-url $(EKS_YAML_URL) \
	--stack-name  $(CLUSTER_STACK_NAME) \
	--role-arn  $(EKS_ADMIN_ROLE) \
	--capabilities CAPABILITY_IAM CAPABILITY_AUTO_EXPAND \
	--parameters \
	ParameterKey=VpcId,ParameterValue=$(VPC_ID) \
	ParameterKey=ClusterName,ParameterValue=$(CLUSTER_NAME) \
	ParameterKey=ClusterRoleArn,ParameterValue=$(CLUSTER_ROLE_ARN) \
	ParameterKey=KeyName,ParameterValue=$(SSH_KEY_NAME) \
	ParameterKey=LambdaRoleArn,ParameterValue=$(EKS_ADMIN_ROLE) \
	ParameterKey=OnDemandBaseCapacity,ParameterValue=$(OnDemandBaseCapacity) \
	ParameterKey=NodeAutoScalingGroupMinSize,ParameterValue=$(NodeAutoScalingGroupMinSize) \
	ParameterKey=NodeAutoScalingGroupDesiredSize,ParameterValue=$(NodeAutoScalingGroupDesiredSize) \
	ParameterKey=NodeAutoScalingGroupMaxSize,ParameterValue=$(NodeAutoScalingGroupMaxSize) \
	ParameterKey=SubnetIds,ParameterValue=$(SUBNET1)\\,$(SUBNET2)\\,$(SUBNET3)
	
delete-eks-cluster:
	@aws --region $(REGION) cloudformation delete-stack --role-arn $(EKS_ADMIN_ROLE) --stack-name "$(CLUSTER_STACK_NAME)"

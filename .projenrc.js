const { AwsCdkTypeScriptApp } = require('projen');
const { Automation } = require('projen-automate-it');

const AUTOMATION_TOKEN = 'PROJEN_GITHUB_TOKEN';

const project = new AwsCdkTypeScriptApp({
  cdkVersion: '1.81.0',
  name: 'amazon-eks-refarch',
  authorName: 'Pahud Hsieh',
  authorEmail: 'pahudnet@gmail.com',
  repository: 'https://github.com/aws-samples/amazon-eks-refarch-cloudformation.git',
  dependabot: false,
  defaultReleaseBranch: 'master',
  antitamper: false,
  cdkDependencies: [
    '@aws-cdk/core',
    '@aws-cdk/aws-ec2',
    '@aws-cdk/aws-eks',
    '@aws-cdk/aws-iam',
  ],
  deps: ['projen-automate-it'],
});

const automation = new Automation(project, { automationToken: AUTOMATION_TOKEN });
automation.autoApprove();
automation.autoMerge();
automation.projenYarnUpgrade();
automation.projenYarnUpgrade('projenYarnUpgradeWithTest', { yarnTest: true });


const common_exclude = ['cdk.out', 'cdk.context.json', 'images', 'yarn-error.log'];
project.npmignore.exclude(...common_exclude);
project.gitignore.exclude(...common_exclude);

project.synth();

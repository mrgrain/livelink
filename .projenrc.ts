import { awscdk, github } from 'projen';

const project = new awscdk.AwsCdkConstructLibrary({
  projenrcTs: true,
  author: 'Momo Kornher',
  authorAddress: 'mail@moritzkornher.de',
  name: 'livelink',
  description: 'IPTV for YT Live Channels',
  repositoryUrl: 'git@github.com:mrgrain/livelink.git',
  cdkVersion: '2.1.0',
  defaultReleaseBranch: 'main',
  release: false,
  prerelease: 'pre',
  license: 'MIT',
  githubOptions: {
    projenCredentials: github.GithubCredentials.fromApp(),
  },
  autoApproveUpgrades: true,
  autoApproveOptions: {
    allowedUsernames: ['projen-builder[bot]'],
  },
  devDeps: [
    '@types/aws-lambda',
    'aws-cdk@^2.42.0',
    'aws-cdk-lib@^2.42.0',
    'constructs@^10.0.5',
    'node-fetch',
  ],
  peerDependencyOptions: {
    pinnedDevDependency: false,
  },
  lambdaOptions: {
    runtime: awscdk.LambdaRuntime.NODEJS_16_X,
    bundlingOptions: {
      sourcemap: false,
    },
    awsSdkConnectionReuse: false,
  },
  excludeTypescript: [
    'src/**/*.lambda.ts',
  ],
});

project.tasks.tryFind('integ:livelink:deploy')?.prependSpawn(project.tasks.tryFind('bundle')!);

project.synth();
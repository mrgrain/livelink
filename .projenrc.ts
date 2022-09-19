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
  devDeps: [
    'aws-cdk@^2.42.0',
    'aws-cdk-lib@^2.42.0',
    'constructs@^10.0.5',
  ],
  peerDependencyOptions: {
    pinnedDevDependency: false,
  },
});
project.synth();
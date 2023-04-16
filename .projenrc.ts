import { Logo, Wordmark } from 'mrpj/lib/logo';
import { awscdk, release } from 'projen';

const project = new awscdk.AwsCdkConstructLibrary({
  projenrcTs: true,
  author: 'Momo Kornher',
  authorAddress: 'mail@moritzkornher.de',
  name: 'livelink',
  description: 'IPTV for YT Live Channels',
  repositoryUrl: 'git@github.com:mrgrain/livelink.git',
  cdkVersion: '2.1.0',
  defaultReleaseBranch: 'main',
  releaseTrigger: release.ReleaseTrigger.scheduled({
    schedule: '0 5 * * 1',
  }),
  releaseToNpm: false,
  prerelease: 'pre',
  license: 'MIT',
  autoApproveUpgrades: true,
  autoApproveOptions: {
    allowedUsernames: [
      'projen-builder[bot]', // Bot account for upgrade PRs
      'mrgrain', // Auto-approve PRs of main maintainer
    ],
  },
  devDeps: [
    '@types/aws-lambda',
    'aws-cdk@^2.42.0',
    'aws-cdk-lib@^2.42.0',
    'constructs@^10.0.5',
    'node-fetch',
    'mrpj',
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


// Logos
const logo = Logo.fromFile('images/logo.svg', {
  width: 145,
  height: 166,
});
logo.synth(project);
new Wordmark(project, {
  logo: logo,
  logoScale: 1.23,
  logoPosition: {
    dx: 3,
  },
  text: 'LiveLink',
  size: {
    width: 600,
    scale: 0.5,
  },
});

// Always bundle
const bundleTask = project.tasks.tryFind('bundle')!;
bundleTask.prependExec('rm -fr assets/**');
project.testTask.prependSpawn(bundleTask);
project.tasks.tryFind('integ:livelink:assert')?.prependSpawn(bundleTask);
project.tasks.tryFind('integ:livelink:deploy')?.prependSpawn(bundleTask);
project.tasks.tryFind('integ:livelink:snapshot')?.prependSpawn(bundleTask);

project.synth();
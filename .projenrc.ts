import { awscdk, JsonPatch, release } from 'projen';
import { LogoSystem } from './projenrc/LogoSystem';

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
  mergify: false,
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
    'lodash.merge',
    '@types/lodash.merge',
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
new LogoSystem(project, {
  logo: {
    width: 145,
    height: 166,
    scale: 1.23,
    dx: 3,
  },
  wordmark: {
    text: 'LiveLink',
    font: { color: '#6F7174' },
    colorScheme: {
      dark: { color: '#f0f6fc' },
      light: { color: '#191919' },
    },
    size: {
      width: 600,
      scale: 0.5,
    },
  },
});

// Always bundle
const bundleTask = project.tasks.tryFind('bundle')!;
bundleTask.prependExec('rm -fr assets/**');
project.testTask.prependSpawn(bundleTask);
project.tasks.tryFind('integ:livelink:assert')?.prependSpawn(bundleTask);
project.tasks.tryFind('integ:livelink:deploy')?.prependSpawn(bundleTask);
project.tasks.tryFind('integ:livelink:snapshot')?.prependSpawn(bundleTask);


project.upgradeWorkflow?.workflows[0].file?.patch(JsonPatch.add('/jobs/pr/steps/-', {
  uses: 'peter-evans/enable-pull-request-automerge@v2',
  with: {
    'token': '${{ secrets.PROJEN_GITHUB_TOKEN }}',
    'pull-request-number': '${{ steps.create-pr.outputs.pull-request-number }}',
    'merge-method': 'squash',
  },
}));

project.synth();
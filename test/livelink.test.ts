import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { LivelinkFunction } from '../src';

describe('Livelink', () => {
  test('creates a Function', () => {
    const stack = new cdk.Stack();
    new LivelinkFunction(stack, 'MyLivelink');

    const template = Template.fromStack(stack);
    expect(template).toMatchSnapshot();
  });
});
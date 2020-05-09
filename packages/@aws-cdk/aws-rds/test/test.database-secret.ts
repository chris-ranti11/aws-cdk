import { expect, haveResource } from '@aws-cdk/assert';
import { Stack } from '@aws-cdk/core';
import { Test } from 'nodeunit';
import { DatabaseSecret } from '../lib';

export = {
  'create a database secret'(test: Test) {
    // GIVEN
    const stack = new Stack();

    // WHEN
    new DatabaseSecret(stack, 'Secret', {
      username: 'admin-username',
    });

    // THEN
    expect(stack).to(haveResource('AWS::SecretsManager::Secret', {
      Description: {
        'Fn::Join': [
          '',
          [
            'Generated by the CDK for stack: ',
            {
              Ref: 'AWS::StackName',
            },
          ],
        ],
      },
      GenerateSecretString: {
        ExcludeCharacters: '"@/\\',
        GenerateStringKey: 'password',
        PasswordLength: 30,
        SecretStringTemplate: '{"username":"admin-username"}',
      },
    }));

    test.done();
  },

  'with master secret'(test: Test) {
    // GIVEN
    const stack = new Stack();
    const masterSecret = new DatabaseSecret(stack, 'MasterSecret', {
      username: 'master-username',
    });

    // WHEN
    new DatabaseSecret(stack, 'UserSecret', {
      username: 'user-username',
      masterSecret,
    });

    // THEN
    expect(stack).to(haveResource('AWS::SecretsManager::Secret', {
      GenerateSecretString: {
        ExcludeCharacters: '"@/\\',
        GenerateStringKey: 'password',
        PasswordLength: 30,
        SecretStringTemplate: {
          'Fn::Join': [
            '',
            [
              '{"username":"user-username","masterarn":"',
              {
                Ref: 'MasterSecretA11BF785',
              },
              '"}',
            ],
          ],
        },
      },
    }));

    test.done();
  },
};

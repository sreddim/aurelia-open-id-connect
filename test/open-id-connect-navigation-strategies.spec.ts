import { NavigationInstruction } from 'aurelia-router';
import { assert } from 'chai';
import { UserManager } from 'oidc-client';
import sinon = require('sinon');
import {
  OpenIdConnectConfigurationManager,
  OpenIdConnectLogger,
  OpenIdConnectNavigationStrategies,
} from '../src/index-internal';

describe('open-id-connect-navigation-strategies', () => {

  const logger = sinon.createStubInstance(OpenIdConnectLogger);
  const configuration = sinon.createStubInstance(OpenIdConnectConfigurationManager);
  const userManager = sinon.createStubInstance(UserManager);
  const instruction = sinon.createStubInstance(NavigationInstruction);

  const loginRedirectRoute = 'login';
  sinon.stub(configuration, 'loginRedirectRoute').get(() => loginRedirectRoute);

  const logoutRedirectRoute = 'logout';
  sinon.stub(configuration, 'logoutRedirectRoute').get(() => logoutRedirectRoute);

  instruction.config = {};

  const strategies = new OpenIdConnectNavigationStrategies(
    logger,
    configuration,
    userManager,
  );

  [
    {
      method: 'signInRedirectCallback',
      delegatesTo: 'signinRedirectCallback',
      redirectsTo: loginRedirectRoute,
    },
    {
      method: 'signOutRedirectCallback',
      delegatesTo: 'signoutRedirectCallback',
      redirectsTo: logoutRedirectRoute,
    },
    {
      method: 'silentSignInCallback',
      delegatesTo: 'signinSilentCallback',
      redirectsTo: loginRedirectRoute,
    },
  ].forEach((o) => {

    context(o.method, () => {

      it(`should forward call to userManager > ${o.delegatesTo}`, async () => {
        // act
        await (strategies as any)[o.method](instruction);
        // assert
        sinon.assert.calledOnce(userManager[o.delegatesTo]);
      });

      it(`should redirect to ${o.redirectsTo} on success`, async () => {
        // act
        await (strategies as any)[o.method](instruction);
        // assert
        assert.equal(instruction.config.redirect, o.redirectsTo);
      });

      it(`should redirect to ${o.redirectsTo} on error`, async () => {
        // arrange
        const stub = userManager[o.delegatesTo] as sinon.SinonStub;
        stub.throwsException();

        let threwError = false;
        try {
          // act
          await (strategies as any)[o.method](instruction);
        } catch (err) {
          threwError = true;
        } finally {
          // assert
          assert.isTrue(threwError);
          assert.equal(instruction.config.redirect, o.redirectsTo);
        }
      });
    });
  });
});

import {
  InvalidCredentialsError,
  InvalidRequestError,
  InvalidStateError,
  NotFoundError,
  ResourceExistsError,
} from '../endpoints/errors.js';
import {kAppMessages} from './messages.js';

export const kReuseableErrors = {
  workspace: {
    notFound(id?: string) {
      return new NotFoundError(kAppMessages.workspace.notFound(id));
    },
    noRootname() {
      return new InvalidRequestError(kAppMessages.workspace.noRootname());
    },
    withRootnameNotFound(rootname: string) {
      return new NotFoundError(
        kAppMessages.workspace.withRootnameNotFound(rootname)
      );
    },
    rootnameDoesNotMatchFolderRootname: (
      rootname: string,
      rootname02: string
    ) =>
      new InvalidRequestError(
        kAppMessages.workspace.rootnameDoesNotMatchFolderRootname(
          rootname,
          rootname02
        )
      ),
  },
  entity: {
    notFound(id: string) {
      return new NotFoundError(kAppMessages.entity.notFound(id));
    },
  },
  permissionGroup: {
    notFound(id?: string) {
      return new NotFoundError(kAppMessages.permissionGroup.notFound(id));
    },
  },
  permissionItem: {
    notFound(id?: string) {
      return new NotFoundError(kAppMessages.permissionItem.notFound(id));
    },
  },
  credentials: {
    invalidCredentials() {
      return new InvalidCredentialsError();
    },
  },
  collaborationRequest: {
    notFound(id?: string) {
      return new NotFoundError(kAppMessages.collaborationRequest.notFound(id));
    },
  },
  appRuntimeState: {
    notFound() {
      return new NotFoundError(kAppMessages.appRuntimeState.notFound());
    },
  },
  agentToken: {
    notFound(id?: string) {
      return new NotFoundError(kAppMessages.agentToken.notFound(id));
    },
    withIdExists(id?: string) {
      return new ResourceExistsError(kAppMessages.agentToken.withIdExists(id));
    },
    withProvidedIdExists(id?: string) {
      return new ResourceExistsError(
        kAppMessages.agentToken.withProvidedIdExists(id)
      );
    },
  },
  job: {
    notFound(id?: string) {
      return new NotFoundError(kAppMessages.job.notFound(id));
    },
  },
  common: {
    notImplemented() {
      return new Error(kAppMessages.common.notImplementedYet());
    },
    notFound(id?: string) {
      return new NotFoundError(kAppMessages.common.notFound(id));
    },
    invalidState(state?: string) {
      return new Error(kAppMessages.common.invalidState(state));
    },
  },
  email: {
    inBlocklist() {
      return new InvalidStateError(kAppMessages.email.emailIsInBlocklist);
    },
  },
};

import { createError } from 'apollo-errors';

export const UnknownError = createError('UnknownError', {
  message: 'An unknown error has occurred.',
});
export const NotAuthorizedError = createError('NotAuthorizedError', {
  message: 'You must be authorized to do that.',
});
export const InsufficientScopeError = createError('InsufficientScopeError', {
  message: 'You need additional priviliges to do that.',
});

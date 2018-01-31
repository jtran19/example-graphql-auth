import {
  GraphQLObjectType,
  GraphQLList,
  GraphQLSchema,
  GraphQLString,
} from 'graphql';
import { forEachField } from 'graphql-tools';
import { createResolver } from 'apollo-resolvers';
import { isInstance } from 'apollo-errors';
import characterData from './CharacterData';
import {
  UnknownError,
  NotAuthorizedError,
  InsufficientScopeError,
} from '../errors';

const CharacterType = new GraphQLObjectType({
  name: 'Character',
  description: 'Character data.',
  fields: () => ({
    name: { type: GraphQLString },
    weakness: { type: GraphQLString, needsScope: 'classified:read' },
  }),
});

const QueryRoot = new GraphQLObjectType({
  name: 'Query',
  description: 'Root Query',
  fields: () => ({
    characters: {
      type: new GraphQLList(CharacterType),
      args: { name: { type: GraphQLString } },
      resolve: (root, args, context, info) => {
        return characterData;
      },
    },
  }),
});

const schema = new GraphQLSchema({
  query: QueryRoot,
});

// A resolver to mask unhandled errors
const baseResolver = createResolver(null, (root, args, context, error) => {
  console.log('Unknown error: ', error);
  return isInstance(error) ? error : new UnknownError();
});

// A resolver that checks for a user in the context
const AuthenticatedResolver = (fieldName) => {
  return baseResolver.createResolver((root, args, context) => {
    if (!context.auth) {
      throw new NotAuthorizedError({ data: { fieldName } });
    }
  });
};

// A resolver that checks for a particular scope
const ScopedResolver = (fieldName) => {
  return AuthenticatedResolver(fieldName).createResolver(
    (root, args, context) => {
      // console.log('context: ', context);
      // console.log('context.auth: ', context.auth);
      if (!context.auth.scopes.includes('classified:read')) {
        throw new InsufficientScopeError({ data: { fieldName } });
      }
    },
  );
};

function attachResolvers(_schema) {
  const defaultResolver = (field) => {
    const oldResolve = field.resolve;
    return (...args) => {
      if (oldResolve) {
        // Field had a resolve function
        return oldResolve(...args);
      }
      // Field did not have a resolve function -- need this to make the field null rather than the whole parent
      const [parent] = [...args];
      return parent[field.name];
    };
  };

  // Replace each field's resolver with an appropriate one based on the field's declared auth requirement
  forEachField(_schema, (field) => {
    if (field.needsAuth) {
      field.resolve = AuthenticatedResolver(field.name).createResolver(
        defaultResolver(field),
      );
    }

    if (field.needsScope) {
      const oldResolve = field.resolve;
      field.resolve = ScopedResolver(field.name).createResolver(
        defaultResolver(field),
      );
    }
  });
}

attachResolvers(schema);
export default schema;

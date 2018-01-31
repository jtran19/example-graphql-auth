# example-graphql-auth

Example GraphQL endpoint showing an implementation of protected fields.

Usage
-----
    yarn start

Point GraphiQL at http://localhost:4009/graphql and set the authorization header to one of the JWT tokens in jwt.txt.

    authorization = bearer <jwt>

Run this query:

    query {
      characters {
        name
        weakness
      }
    }

Result
------
Depending on which JWT token (access level) you are using, either the weakness for each character will be displayed, or "null" and a corresponding error in "errors".

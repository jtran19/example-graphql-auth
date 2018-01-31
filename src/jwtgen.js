import jwt from 'jsonwebtoken';

console.log(
  "Director Fury's JWT token: ",
  jwt.sign(
    { username: 'Director Fury', scopes: ['classified:read'] },
    'jarvis1',
  ),
);
console.log(
  "SHIELD Agent's JWT token: ",
  jwt.sign({ username: 'SHIELD Agent', scopes: [] }, 'jarvis1'),
);

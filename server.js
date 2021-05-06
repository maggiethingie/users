const express = require('express');
const expressGraphQL = require('express-graphql').graphqlHTTP;
const schema = require('./schema/schema');
const PORT = process.env.PORT || 4000;

const app = express();

// app.use is how we wire up middleware to an express application
// middlewares are little functions that are meant to intercept/modify requests as they come into an express server
// we're passing in an options object to the expressGraphQL function
// we are required to pass in a schema as part of the options object
app.use('/graphql', expressGraphQL({
  schema,
  graphiql: true
}));

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
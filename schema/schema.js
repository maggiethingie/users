const graphql = require('graphql');
const axios = require('axios');

const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLSchema, // takes in a root query and returns a graphql schema instance
  GraphQLList,
  GraphQLNonNull
} = graphql;

const CompanyType = new GraphQLObjectType({
  name: 'Company',
  fields: () => ({
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    description: { type: GraphQLString },
    users: {
      type: new GraphQLList(UserType), // multiple users
      resolve(parentValue, args) {
        return axios.get(`http://localhost:3000/companies/${parentValue.id}/users`)
        .then(resp => resp.data)
      }
    }
  })
});

const UserType = new GraphQLObjectType({
  // name property will always be a string that describes the type that we are defining. In practice it will always be whatever type we just declared (UserType --> name: 'User')
  name: 'User',
  // fields property tells GraphQL all the different properties that our type (User) has
  fields: {
    id: { type: GraphQLString },
    firstName: { type: GraphQLString },
    age: { type: GraphQLInt },
    company: {
      type: CompanyType,
      resolve(parentValue, args) {
        return axios.get(`http://localhost:3000/companies/${parentValue.companyId}`)
        .then(resp => resp.data)
      }
    }
  }
});

// root query: used to allow graph ql to enter into our application's data graph
// most important part is the resolve function, which is used to return an actual piece of data from our datastore/database
// "A GraphQL schema provides a root type for each kind of operation."
const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    user: {
      type: UserType,
      args: { id: { type: GraphQLString } },
      // resolve grabs from our database/datastore
      // resolve can be sync or async! can return a result or a promise
      resolve(parentValue, args) {
        return axios.get(`http://localhost:3000/users/${args.id}`)
          .then(resp => resp.data) // because resp === { data: { firstName: 'bill' } }
      }
    },
    company: {
      type: CompanyType,
      args: { id: { type: GraphQLString } },
      resolve(parentValue, args) {
        return axios.get(`http://localhost:3000/companies/${args.id}`)
        .then(resp => resp.data)
      }
    }
  }
});

const mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    addUser: {
      type: UserType,
      args: {
        firstName: { type: new GraphQLNonNull(GraphQLString) },
        age: { type: new GraphQLNonNull(GraphQLInt) },
        companyId: { type: GraphQLString }
      },
      resolve(parentValue, { firstName, age }) {
        return axios.post(`http://localhost:3000/users`, { firstName, age })
        .then(resp => resp.data)
      }
    },
    deleteUser: {
      type: UserType,
      args: { id: { type: new GraphQLNonNull(GraphQLString) } },
      resolve(parentValue, { id }) {
        return axios.delete(`http://localhost:3000/users/${id}`)
        .then(resp => resp.data)
      }
    },
    editUser: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
        firstName: { type: GraphQLString },
        age: { type: GraphQLInt },
        companyId: { type: GraphQLString }
      },
      resolve(parentValue, args) {
        return axios.patch(`http://localhost:3000/users/${args.id}`, args)
        .then(resp => resp.data)
      }
    }
  }
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation
});

// purpose of the schema file is to instruct GraphQL about what data we have/need in our application

// Take our two types, merge them together into a GraphQL Schema object and hand that back to our graphql middleware in server.js
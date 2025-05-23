const typeDefs = `#graphql
type User {
  _id: ID!
    username: String!
    email: String!
    savedBooks: [Book]
    bookCount: Int!
}

type Book {
  bookId: ID!
    authors: [String]
    description: String
    title: String!
    image: String
    link: String
}

 type Auth {
   token: ID!
   user: User
}

input BookInput {
  bookId: ID!
    authors: [String]
    description: String
    title: String!
    image: String
    link: String
}
 
type Query {
   me: User
}

 type Mutation {
   login(email: String!, password: String!): Auth
   addUser(username: String!, email: String!, password: String!): Auth
   saveBook(bookInput: BookInput!): User
   removeBook(bookId: ID!): User
}

 `;

export default typeDefs;
// This file defines the GraphQL schema for the server.
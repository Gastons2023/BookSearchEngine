import User from "../models/User.js";
import { UserDocument } from "../models/User.js";
import { BookDocument } from "../models/Book.js";
import { signToken } from "../services/auth.js";

const resolvers = {
  Query: {
    me: async (_parent: any, _args: any, context: any) => {
      if (!context.user) {
        throw new Error("Not authenticated");
      }
      const user = await User.findById(context.user._id).populate("savedBooks") as UserDocument;
      return user;
    },
  },
  Mutation: {
    login: async (_parent: any, { email, password }: { email: string; password: string }) => {
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error("Invalid credentials");
      }
      const isMatch = await user.isCorrectPassword(password);
      if (!isMatch) {
        throw new Error("Invalid credentials");
      }
      const token = signToken(user.username, user.email, user._id);
      return { token, user };
    },
    addUser: async (_parent: any, { username, email, password }: { username: string; email: string; password: string }) => {
      const foundUser = await User.findOne({ email });
      if (foundUser) {
        throw new Error("User already exists with this email");
      }
      const user = await User.create({ username, email, password });
      const token = signToken(user.username, user.email, user._id);
      return { token, user };
    },
    saveBook: async (_parent: any, { bookInput }: { bookInput: BookDocument }, context: any) => {
      if (!context.user) {
        throw new Error("Not authenticated");
      }
      if (!bookInput) {
        throw new Error("Book input is required");
      }
      if (!bookInput.bookId) {
        throw new Error("Book ID is required");
      }
      const user = await User.findByIdAndUpdate( 
        context.user._id,
        { $addToSet: { savedBooks: bookInput } },
        { new: true, runValidators: true }
      ) as UserDocument;
      return user;
    },
    removeBook: async (_parent: any, { bookId }: { bookId: string }, context: any) => {
      if (!context.user) {
        throw new Error("Not authenticated");
      }
      if (!bookId) {
        throw new Error("Book ID is required");
      }
      const user = await User.findByIdAndUpdate(
        context.user._id,
        { $pull: { savedBooks: { bookId } } },
        { new: true, runValidators: true }
      ) as UserDocument;
      return user;
    },
  },
};

export default resolvers;
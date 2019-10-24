import ApolloClient from "apollo-boost";
import CurrentConfig from "../config";

export const Client = new ApolloClient({ 
  uri: CurrentConfig.apollo.uri,
});
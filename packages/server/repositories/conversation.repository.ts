// Maps conversationId -> lastResponseId
// e.g. conv1 -> 100, conv2 -> 3
// This allows us to keep track of multiple conversations and multiple last response ids
// For this project we are just storing this in memory in this Map data structure. Real world apps store this in a DB.

// This is an IMPLEMENTATION DETAIL (the actual DB implementation we are using. In this case -> an in memory DB)

const conversations = new Map<string, string>();

// Don't export implementation details from your repository. Only export PUBLIC INTERFACES.
// This is essentially the equivalent of our JPA Repositories we use in Java
export const conversationRepository = {
   getLastResponseId(conversationId: string) {
      return conversations.get(conversationId);
   },
   setLastResponseId(conversationId: string, responseId: string) {
      return conversations.set(conversationId, responseId);
   },
};

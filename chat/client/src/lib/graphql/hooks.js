import { useMutation, useQuery, useSubscription } from "@apollo/client";
import {
  addedMessageSubscription,
  addMessageMutation,
  messagesQuery,
} from "./queries";

export function useAddMessage() {
  const [mutate] = useMutation(addMessageMutation);

  const addMessage = async (text) => {
    const {
      data: { message },
    } = await mutate({
      variables: { text },
      // update: (cache, { data }) => {
      //   const newMessage = data.message;
      //   cache.updateQuery({ query: messagesQuery }, ({ messages }) => {
      //     return { messages: [...messages, newMessage] };
      //   });
      // },
    });
    return message;
  };

  return { addMessage };
}

export function useMessages() {
  const { data } = useQuery(messagesQuery);
  useSubscription(addedMessageSubscription, {
    onData: ({ client, data }) => {
      const newMessage = data.data.message;
      client.cache.updateQuery({ query: messagesQuery }, ({ messages }) => {
        return { messages: [...messages, newMessage] };
      });
    },
  });
  return {
    messages: data?.messages ?? [],
  };
}

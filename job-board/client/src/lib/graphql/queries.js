import {
  ApolloClient,
  ApolloLink,
  InMemoryCache,
  createHttpLink,
  concat,
  gql,
} from "@apollo/client";
import { GraphQLClient } from "graphql-request";
import { getAccessToken } from "../auth";

const httpLink = createHttpLink({
  uri: "http://localhost:9000/graphql",
});

const authLink = new ApolloLink((operation, forward) => {
  const accessToken = getAccessToken();
  if (accessToken) {
    operation.setContext({
      headers: {
        authorization: "Bearer " + accessToken,
      },
    });
  }
  return forward(operation);
});

export const apolloClient = new ApolloClient({
  link: concat(authLink, httpLink),
  cache: new InMemoryCache(),
  defaultOptions: {
    query: {
      fetchPolicy: "cache-first",
    },
    watchQuery: {
      fetchPolicy: "cache-first",
    },
  },
});

const jobDetailsFragment = gql`
  fragment jobDetails on Job {
    id
    date
    title
    description
    company {
      id
      name
    }
  }
`;

export const jobByIdQuery = gql`
  query fetchJob($id: ID!) {
    job(id: $id) {
      ...jobDetails
    }
  }

  ${jobDetailsFragment}
`;

export const companyByIdQuery = gql`
  query fetchCompany($id: ID!) {
    company(id: $id) {
      id
      name
      description
      jobs {
        id
        title
        date
      }
    }
  }
`;

export const jobsQuery = gql`
  query jobs($limit: Int, $offset: Int) {
    jobs(limit: $limit, offset: $offset) {
      items {
        id
        date
        title
        company {
          id
          name
        }
      }
      total_count
    }
  }
`;

export const createJobMutation = gql`
  mutation CreateJob($input: CreateJobInput!) {
    job: createJob(input: $input) {
      ...jobDetails
    }
  }

  ${jobDetailsFragment}
`;

// !======================================= old code =======================================
export async function createJob({ title, description }) {
  const mutation = gql`
    mutation CreateJob($input: CreateJobInput!) {
      job: createJob(input: $input) {
        ...jobDetails
      }
    }

    ${jobDetailsFragment}
  `;
  // const { job } = await client.request(mutation, {
  //   input: { title, description },
  // });
  // return job;

  const { data } = await apolloClient.mutate({
    mutation,
    variables: { input: { title, description } },
    update: (cache, { data }) => {
      cache.writeQuery({
        query: jobByIdQuery,
        variables: { id: data.job.id },
        data,
      });
    },
  });
  return data.job;
}

export async function fetchOneJob(id) {
  // const { job } = await client.request(query, { id });
  // return job;

  const { data } = await apolloClient.query({
    query: jobByIdQuery,
    variables: { id },
  });
  return data.job;
}

export async function fetchJobs() {
  const query = gql`
    query {
      jobs {
        id
        date
        title
        company {
          id
          name
        }
      }
    }
  `;

  // const { jobs } = await client.request(query);
  // return jobs;

  const { data } = await apolloClient.query({
    query,
    fetchPolicy: "network-only",
  });
  return data.jobs;
}

// old approach : not using useQuery apollo hook .
export async function fetchCompany(id) {
  const query = gql`
    query fetchCompany($id: ID!) {
      company(id: $id) {
        id
        name
        description
        jobs {
          id
          title
          date
        }
      }
    }
  `;

  // const { company } = await client.request(query, { id });
  // return company;

  const { data } = await apolloClient.query({ query, variables: { id } });
  return data.company;
}

// old approach : native graphql client .
const client = new GraphQLClient("http://localhost:9000/graphql", {
  headers: () => {
    const accessToken = getAccessToken();
    if (accessToken) {
      return { authorization: `Bearer ${accessToken}` };
    }
    return {};
  },
});

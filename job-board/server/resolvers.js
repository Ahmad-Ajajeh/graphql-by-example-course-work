import { GraphQLError } from "graphql";

import {
  getJobs,
  getJob,
  getCompanyJobs,
  createJob,
  deleteJob,
  updateJob,
  countJobs,
} from "./db/jobs.js";
import { getCompany } from "./db/companies.js";

export const resolvers = {
  Query: {
    // getJobs returns a promise , but graphql will wait until it resolves .
    // if the resolver returns extra data that does not exist in the schema
    // the scehma will omit it from the response with no errors .
    company: async (_root, { id }) => {
      const company = await getCompany(id);
      if (!company) {
        throw notFoundError("No Company found with id " + id);
      }
      return company;
    },
    jobs: async (_root, { limit, offset }) => {
      const jobs = await getJobs(limit, offset);
      const total_count = await countJobs();
      console.log(total_count);

      return { items: jobs, total_count };
    },
    job: async (_root, args) => {
      const { id } = args;
      const job = await getJob(id);
      if (!job) {
        throw notFoundError("No Job found with id" + id);
      }
      return job;
    },
  },

  Mutation: {
    createJob: (_root, { input: { title, description } }, context) => {
      const { user } = context;
      if (!user)
        throw unAuthorizedError("You are not authorized to make this action!");
      return createJob({ companyId: user.companyId, title, description });
    },

    deleteJob: async (_root, { id }, { user }) => {
      if (!user)
        throw unAuthorizedError("You are not authorized to make this action");

      const job = await getJob(id, user.companyId);
      if (!job) throw notFoundError("No job was found with this id");

      return deleteJob(id);
    },
    updateJob: async (
      _root,
      { input: { id, title, description } },
      { user }
    ) => {
      if (!user)
        throw unAuthorizedError("You are not authorized to make this action");

      return updateJob({ id, title, description, companyId: user.companyId });
    },
  },

  // we can also have resolver functions to edit data before sending it .
  Job: {
    company: (job, _args, { companyLoader }) =>
      companyLoader.load(job.companyId), // this has precedence
    date: (job) => toIsoDate(job.createdAt),
  },

  Company: {
    jobs: (company) => getCompanyJobs(company.id),
  },
};

const notFoundError = (message) => {
  return new GraphQLError(message, {
    extensions: { code: "NOT_FOUND" },
  });
};

const unAuthorizedError = (message) => {
  return new GraphQLError(message, {
    extensions: { code: "UNAUTHORIZED" },
  });
};

const toIsoDate = (value) => value.slice(0, "yyyy-mm-dd".length);

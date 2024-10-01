import DataLoader from "dataloader";

import { connection } from "./connection.js";

const getCompanyTable = () => connection.table("company");

export async function getCompany(id) {
  return await getCompanyTable().first().where({ id });
}

export const createCompanyLoader = () => {
  return new DataLoader(async (ids) => {
    const copmanies = await getCompanyTable().select().whereIn("id", ids);
    console.log(copmanies);
    return ids.map((id) => copmanies.find((company) => company.id === id));
  });
};

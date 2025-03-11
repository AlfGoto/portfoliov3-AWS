import {
  Entity,
  FormattedItem,
  item,
  string,
} from "dynamodb-toolbox";
import { PortfolioTable } from "../dynamodb";

export const ReviewEntity = new Entity({
  name: "Link",
  schema: item({
    date: string().key(),
    author: string(),
    projectName: string().key(),
    review: string(),
  }),
  computeKey: ({ projectName,date }: { projectName: string,date:string }) => ({
    PK: `PROJECT#${projectName}`,
    SK: `DATE#${date}`,
  }),
  table: PortfolioTable,
});
export type ReviewEntityType = FormattedItem<typeof ReviewEntity>;

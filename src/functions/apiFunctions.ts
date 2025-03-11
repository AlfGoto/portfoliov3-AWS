import { Hono } from "hono";
import { handle } from "hono/aws-lambda";
import { ReviewEntity } from "../core/review/review.entity";
import { ScanCommand, UpdateItemCommand } from "dynamodb-toolbox";
import { PortfolioTable } from "../core/dynamodb";

const app = new Hono();

app.get("/favicon.ico", (c) => {
  return c.notFound();
});

app.post("/", async (c) => {
  const { author, projectName, review } = await c.req.json();

  await ReviewEntity.build(UpdateItemCommand)
    .item({
      date: new Date().toISOString(),
      author,
      projectName,
      review,
    })
    .send();

  return c.json("Review added");
});

app.get("/", async (c) => {
  const scanCommand = PortfolioTable.build(ScanCommand);

  const { Items } = await scanCommand.send();
  return c.json(Items);
});

export const handler = handle(app);

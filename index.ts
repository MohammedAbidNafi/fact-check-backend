import express, { query, response } from "express";
import cors from "cors";
import { runScraper } from "./scraper";
import { getFacts, updateDb } from "./db";

const app = express();
const port = 1234;

app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/factcheck", async (req, res) => {
  if (!req.query.q) {
    res.status(400);
    res.send("Bad Request: Missing query parameter 'q'");
    return;
  }

  if (typeof req.query.q !== "string") {
    res.status(400);
    res.send("Bad Request: wrong data type");
    return;
  }
  const output = await runScraper(req.query.q as string);

  // const id = await updateDb({
  //   fact: req.query.q,
  //   response: output.response,
  // });

  res.status(200);
  res.json({
    response: output.response,
    // id: id ? id[0].id : null,
    status: "Fact check complete!",
  });
  res.send("Fact check complete!");
});

app.get("/facts", async (req, res) => {
  const data = await getFacts();

  res.status(200);
  res.json(data);
});

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});

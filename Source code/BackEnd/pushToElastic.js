const { Client } = require("@elastic/elasticsearch");
const data = require("./Postsdata.json");
const client = new Client({
  node: "http://localhost:9200",
  auth: {
    username: "elastic",
    password: "kiranreus",
  },
});

async function run() {
  const body = data.flatMap((doc) => [{ index: { _index: "posts" } }, doc]);

  const { body: bulkResponse } = await client.bulk({ refresh: true, body });

  if (bulkResponse.errors) {
    console.log(bulkResponse);
  }

  const { body: count } = await client.count({ index: "faculty" });
  console.log(count);
}

run().catch(console.log);

/*
 * Requirements
 */
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const {router,getCMDOut} = require("./api/companies");

/*
 *Express Setup
 */

const port = process.env.PORT || 3000;

let searchCMDValue = "";
for (let j = 0; j < process.argv.length; j++) {
  searchCMDValue = process.argv[2];
}
if (searchCMDValue == "index.js") {
  console.log("Please provide the argument with the search value.");
}
else{
 getCMDOut(searchCMDValue);
}


/*
 * Body Parser
 */
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

/*
 * Public files
 */
app.use(express.static("./public"));

/*
 * use Routes
 */
app.get("/", (request, response) =>
  response.sendFile(`${__dirname}/public/index.html`)
);

app.use("/api", router);

app.listen(port, () => console.log(`Example app listening on port ${port}!`));

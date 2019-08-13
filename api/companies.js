const express = require("express");
const router = express.Router();
const request = require("request-promise");
const cheerio = require("cheerio");
const sleep = require("await-sleep");
const helper = require("./funcHelper");

const error = {
  emptySearch: "Please search a keyword",
  emptyResult: "No results found"
};
/* const classes taken for the website  */
const company_results_cl = "ul.search-results__list li";
const box_results_cl = "div.page__main > div.box-results";
const company_name_tag = "h2 a";
const company_number_cl =
  ".search-results__item__text .search-results__item__details dd";
const revenue_cl =
  "#company-card_overview > div.accountfigures_container > div.company-account-figures > div.table__container > table > tbody > tr:nth-child(1) > td:nth-child(2)";
const register_cl =
  "#company-card_overview > div.cc-flex-grid > div:nth-child(1) > dl > dd";
const telefon_cl = "a.p-tel.btn-link span";
const address_cl = "a.desktop-only.btn-link";
/* End of const classes  */

const baseUrl = "https://www.allabolag.se";
//create an empty array for the data coming from website
let scrapeResults = [];
const getCompanies = async (term, page_index) => {
  //Get html from the page and wait until requiest is done
  const url = `${baseUrl}/what/${term}/page/1?page=${page_index}`;
  try {
    const companiesResults = await request.get(url);

    const $ = cheerio.load(companiesResults);

    const temp = [];
    // *Finding the last page_index
    if (
      $(company_results_cl).length &&
      !($(box_results_cl).length == 1 && page_index > 1)
    ) {
      $(company_results_cl).each(function(index, element) {
        const name = $(element)
          .find(company_name_tag)
          .text();
        const number = $(element)
          .find(company_number_cl)
          .first()
          .text();

        temp.push({ name, number });
      });
    }
    const results = [];
    for (let i in temp) {
      val = temp[i];
      //* The second function is called here
      const comp = await getCompany(
        val.number.replace("-", ""),
        val.name,
        val.number
      );
      results.push(comp);
    }

    return results;
  } catch (error) {
    //*Preventing the limit of responses done
    if (
      error.statusCode == 429 &&
      error.response.headers["x-ratelimit-remaining"] == 0
    ) {
      await sleep(parseInt(error.response.headers["retry-after"]) * 1000);
    }
  }
};

/*
 * @route  Get the Company
 * @desc search done by register number to get the exact company and scraping the data required
 */
const getCompany = async (companyNumber, name, number) => {
  try {
    const url = `${baseUrl}/${companyNumber}`;
    const companyResult = await request.get(url);
    const $ = cheerio.load(companyResult);

    /*
     *collect data for a specific company
     */

    const register = helper.register($, register_cl);
    const address = helper.value($, address_cl);
    const revenue = helper.value($, revenue_cl);
    const telefon = helper.value($, telefon_cl);

    // * Return all the data and call this function in the first one
    return { name, number, revenue, register, address, telefon };
  } catch (error) {
       //*Preventing the limit of responses done
    if (
      error.statusCode == 429 &&
      error.response.headers["x-ratelimit-remaining"] == 0
    ) {
      await sleep(parseInt(error.response.headers["retry-after"]) * 1000);
    }
  }
};

/*
 * @route POST api/companies
 * @desc Handling the request and call the getCompanies function ,and return a response
 * @access  Public
 */
router.post("/companies", async (req, res) => {
  if (req.method === "POST") {
    const postBody = req.body;
    let moreResults = true;
    let allResults = [];
    let i = 1;

    if (postBody.name === "") {
      res.end(JSON.stringify([{ error: error.emptySearch }]));
    } else {
      while (moreResults) {
        scrapeResults = await getCompanies(postBody.name, i);

        if (scrapeResults.length == 0 && i == 1) {
          console.log("no results");
          res.end(JSON.stringify([{ error: error.emptyResult }]));
          moreResults = false;
        } else if (scrapeResults.length == 0) {
          console.log("all results loaded");
          res.end(JSON.stringify(allResults));
          moreResults = false;
        } else {
          // load all the results and them push them in an array
          console.log("loading all results,from this page_index" + i);
          i++;

          allResults = allResults.concat(scrapeResults);
        }
      }
    }
  }
});

/* 
   * console application
   * takes the company’s name
*/
module.exports.getCMDOut = async search => {
  let moreResults = true;
  let allResults = [];
  let i = 1;

  if (search === "") {
    console.log(error.emptySearch);
  } else {
    while (moreResults) {
      scrapeResults = await getCompanies(search, i);

      if (scrapeResults.length == 0 && i == 1) {
        console.log(error.emptyResult);
        moreResults = false;
      } else if (scrapeResults.length == 0) {
        console.log(helper.pad(180, "", "-"));
        console.log(
          helper.pad(70, "name", " ") +
            "|" +
            helper.pad(15, "number", " ") +
            "|" +
            helper.pad(15, "revenue", " ") +
            "|" +
            helper.pad(15, "register", " ") +
            "|" +
            helper.pad(50, "address", " ") +
            "|" +
            helper.pad(15, "telefon", " ") +
            "|"
        );
        console.log(helper.pad(180, "", "-"));
        allResults.forEach(element => {
          if (
            element != undefined &&
            element.name != null &&
            element.name != ""
          ) {
            console.log(
              helper.pad(70, element.name, " ") +
                "|" +
                helper.pad(15, element.number, " ") +
                "|" +
                helper.pad(15, element.revenue, " ") +
                "|" +
                helper.pad(15, element.register, " ") +
                "|" +
                helper.pad(50, element.address, " ") +
                "|" +
                helper.pad(15, element.telefon, " ") +
                "|"
            );
            console.log(helper.pad(180, "", "-"));
          }
        });
        moreResults = false;
      } else {
        // load all the results and them push them in an array
        // console.log("loading all results,from this page_index" + i);
        i++;

        allResults = allResults.concat(scrapeResults);
      }
    }
  }
};

module.exports.router = router;

const { Client } = require("@elastic/elasticsearch");
const express = require("express");
const bodyParser = require("body-parser");
var request = require("request");
var cors = require("cors");
const { OpenAI } = require("openai");
const app = express();
const axios = require("axios");
const nodemailer = require("nodemailer");
const openai = new OpenAI({
  apiKey: "", //Enter your key here
});
const SERPAPI_API_KEY =
  "bb0414e26bbb069854f8dbed7af5603304659662d59e8bee64273e41c4091811";
app.use(cors());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header("Access-Control-Allow-Headers", "http://localhost:3000");
  next();
});
const client = new Client({
  node: "http://localhost:9200",
  auth: {
    username: "elastic",
    password: "kiranreus",
  },
});
async function insertData() {
  try {
    const { body } = await client.index({
      index: "blogdb",
      body: {
        user: "naruto",
        password: "root",
        usertype: "Admin",
      },
    });
  } catch (error) {
    console.error("Error inserting document:", error);
  }
}
async function fetchEventsNearby(city) {
  try {
    const response = await axios.get(
      "https://serpapi.com/search?engine=google_maps",
      {
        params: {
          api_key: SERPAPI_API_KEY,
          engine: "google",
          q: `restaurants in ${city}`,
          google_domain: "google.com",
          location: city,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching events nearby:", error);
    throw new Error("Error fetching events nearby");
  }
}
async function fetchMusicalNearby(city) {
  try {
    const response = await axios.get(
      "https://serpapi.com/search?engine=google_maps",
      {
        params: {
          api_key: SERPAPI_API_KEY,
          engine: "google",
          q: `musical/concert events in ${city}`,
          google_domain: "google.com",
          location: city,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching events nearby:", error);
    throw new Error("Error fetching events nearby");
  }
}
async function fetchSportsNearby(city) {
  try {
    const response = await axios.get(
      "https://serpapi.com/search?engine=google_events",
      {
        params: {
          api_key: SERPAPI_API_KEY,
          engine: "google",
          q: `sports events in ${city}`,
          google_domain: "google.com",
          location: city,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching events nearby:", error);
    throw new Error("Error fetching events nearby");
  }
}
async function geocodeAddress(address) {
  const apiKey = "AIzaSyCn38km6TSvURwOPQD2UGX9rfESSdT8kgY";
  const encodedAddress = encodeURIComponent(address.join(", "));
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`;

  try {
    const response = await axios.get(url);
    const data = response.data; // Accessing the data property directly

    if (data.results && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      return {
        latitude: location.lat,
        longitude: location.lng,
      };
    } else {
      throw new Error("No results found for the address");
    }
  } catch (error) {
    console.error("Error geocoding address:", error);
    throw error;
  }
}
async function emailSubscribed(topic, title, email, content) {
  console.log(email);
  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "robertlewandowski9reus11@gmail.com",
      pass: "dhlj mijo txgh dmcy",
    },
  });

  const htmlTemplate = `
  <style>
    .post-summary {
      margin-bottom: 20px;
      border-bottom: 1px solid #ddd;
      padding: 15px;
    }

    .post-summary h1 {
      font-size: 1.5em;
      margin-bottom: 5px;
    }

    .post-summary p {
      font-size: 0.9em;
      margin-bottom: 10px;
    }

    .post-summary a {
      color: #333;
      text-decoration: none;
    }

    .post-summary a:hover {
      text-decoration: underline;
    }
  </style>
  <div class="post-summary">
    <h1>Check out the new post on "${topic}"</h1>
    <h4>${title}</h4>
    <p>${content}...</p>
    <a href="http://localhost:3000/">Read at the Blog</a>
  </div>`;

  var mailOptions = {
    from: "robertlewandowski9reus11@gmail.com",
    to: email,
    subject: "New post on subscribed topic " + topic,
    html: htmlTemplate,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
}

app.get("/getData", async (req, res) => {
  const body = await client.search({
    index: "posts",
    query: {
      match_all: {},
    },
  });
  const data = body.hits.hits.map((hit) => hit._source);
  //console.log(data);
  res.json(data);
});

app.use(bodyParser.json());
app.post("/newpost", (req, res) => {
  try {
    const postData = req.body;
    const email = postData.email;
    const data = JSON.parse(postData.postData);
    emailSubscribed(data.topic, data.title, email, data.body);
    res.json("Working");
  } catch (error) {
    console.error(`Error performing search: ${error}`);
  }
});

app.post("/search", async (req, res) => {
  try {
    const { searchQuery } = req.body; // Assuming the search query is sent as a query parameter named 'query'
    // console.log(searchQuery);
    const body = await client.search({
      index: "posts",
      query: {
        match: {
          title: searchQuery,
        },
      },
      from: 0,
      size: 1000,
    });
    const data = body.hits.hits.map((hit) => hit._source);
    // console.log(data);
    res.json(data); // Send search results to the frontend
  } catch (error) {
    console.error(`Error performing search: ${error}`);
    res
      .status(500)
      .json({ error: "An error occurred while performing the search." });
  }
});

app.post("/generate-reply", async (req, res) => {
  try {
    const { post } = req.body;
    console.log(post);
    rtitle = post.title;
    rcontent = post.body;
    openai.apiKey = ""; // replace with your actual OpenAI API key
    // Generate completion using OpenAI API
    const messages = [
      { role: "system", content: "You are a reply generator." },
      {
        role: "user",
        content: `generate reply in 10 words for post title: ${rtitle}\n\n and content: ${rcontent}`,
      },
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-16k",
      messages: messages,
      max_tokens: 30,
      temperature: 0.5,
      top_p: 1,
    });
    console.log(response);
    const { finish_reason, message } = response.choices[0];

    // Extract the generated reply content from the response
    const generatedReply = message.content;
    console.log(generatedReply);
    res.json({ generatedReply });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
app.post("/data", async (req, res) => {
  try {
    // Extract location data from request body
    const { location, weather } = req.body;

    // Process location data
    console.log("Location data:", location.city);
    const city = location.city;
    const latitude = location.latitude;
    const longitude = location.longitude;

    console.log(latitude + " " + longitude);
    // Fetch events nearby using SERPAPI
    const serpapiResponse = await fetchEventsNearby(city);
    // console.log(serpapiResponse.local_results[0]);

    const restaurantsDetails = serpapiResponse.local_results.map((rest) => {
      return {
        title: rest.title,
        gps_coordinates: rest.gps_coordinates,
        address: rest.address,
        open_state: rest.open_state,
        operating_hours: rest.operating_hours,
      };
    });
    // console.log(restaurantsDetails);
    let c = 0;
    const completions = [];
    const sr = [];
    for (const r of restaurantsDetails) {
      const message = [
        {
          role: "system",
          content:
            "you have to decide and recommend this restaurant or not based on the given location and weather. give the output has Yes or No",
        },
        {
          role: "user",
          content: `based on weather: ${weather.weather[0].main} and location: ${location.city}, this is the restaurant title: ${r.title}, with address: ${r.address}, and open state: ${r.open_state}?`,
        },
      ];
      try {
        const response = await openai.chat.completions.create({
          model: "gpt-3.5-turbo-16k",
          messages: message,
          max_tokens: 20,
          temperature: 0.5,
          top_p: 1,
        });
        if (c == 3) {
          break;
        }
        if (response.choices[0].message.content == "Yes") {
          c++;
          completions.push(r);
        }
      } catch (error) {
        console.error("Error processing OpenAI completion:", error);
        completions.push(null);
      }
    }
    const serpapiResponsemusic = await fetchMusicalNearby(city);
    // console.log(serpapiResponsemusic.local_results);
    const musiceventDetails = serpapiResponsemusic.local_results.map((muse) => {
      return {
        title: muse.title,
        gps_coordinates: muse.gps_coordinates,
        address: muse.address,
        open_state: muse.open_state,
        description: muse.description,
        operating_hours: muse.operating_hours,
      };
    });
    // console.log(musiceventDetails);
    let c2 = 0;
    const completion2 = [];
    for (const r of musiceventDetails) {
      const message = [
        {
          role: "system",
          content:
            "you have to decide and recommend this musical/concert event or not based on the given location and weather. give the output has Yes or No. If open_state is undefined please say an immediate NO. please be liberal and say yes easily for now",
        },
        {
          role: "user",
          content: `based on weather: ${weather.weather[0].main} and location: ${location.city}, this is the restaurant title: ${r.title}, with address: ${r.address} and open state: ${r.open_state}?`,
        },
      ];
      try {
        const response = await openai.chat.completions.create({
          model: "gpt-3.5-turbo-16k",
          messages: message,
          max_tokens: 20,
          temperature: 0.5,
          top_p: 1,
        });
        console.log(response.choices[0].message.content);
        if (c2 == 3) {
          break;
        }
        if (response.choices[0].message.content.includes("Yes")) {
          c2++;
          completion2.push(r);
        }
      } catch (error) {
        console.error("Error processing OpenAI completion:", error);
        completion2.push(null);
      }
    }
    // console.log(completion2);
    const serpapiResponsesports = await fetchSportsNearby(city);
    // console.log(serpapiResponsesports.events_results[0]);
    const sporteventDetails = serpapiResponsesports.events_results.map(
      (sport) => {
        return {
          title: sport.title,
          date: sport.date,
          address: sport.address,
          link: sport.link,
          description: sport.description,
        };
      }
    );
    // console.log(sporteventDetails);
    const sportsDetailswithLocation = [];
    for (const sport of sporteventDetails) {
      const gps_coordinates = await geocodeAddress(sport.address);
      sportsDetailswithLocation.push({ sport, gps_coordinates });
    }
    console.log(sportsDetailswithLocation);
    let c3 = 0;
    const completion3 = [];
    let notedAddresses = [];
    for (const s of sportsDetailswithLocation) {
      let difference = 0.0;
      if (notedAddresses.includes(s.sport.address[0])) {
        difference = 0.001;
      }
      const message = [
        {
          role: "system",
          content:
            "you have to decide and recommend this sport event or not based on the given location and weather. give the output has Yes or No. Be liberal say Yes easily",
        },
        {
          role: "user",
          content: `based on weather: ${weather.weather[0].main} and location: ${location.city}, this is the sport title: ${s.title}?`,
        },
      ];
      try {
        const response = await openai.chat.completions.create({
          model: "gpt-3.5-turbo-16k",
          messages: message,
          max_tokens: 20,
          temperature: 0.5,
          top_p: 1,
        });
        console.log(response.choices[0].message.content);
        if (c3 == 3) {
          break;
        }
        if (response.choices[0].message.content.includes("Yes")) {
          c3++;
          s.gps_coordinates.latitude += difference;
          notedAddresses.push(s.sport.address[0]);
          completion3.push(s);
        }
      } catch (error) {
        console.error("Error processing OpenAI completion:", error);
        completion3.push(null);
      }
    }
    console.log(completion3);
    res.json({ completions, completion2, sr, completion3 });
  } catch (error) {
    console.error("Error processing data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
app.listen(4000, () => {
  console.log(`Server is listening at http://localhost:4000`);
});

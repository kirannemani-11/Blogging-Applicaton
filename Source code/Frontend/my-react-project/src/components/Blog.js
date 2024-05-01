import * as React from "react";
import CssBaseline from "@mui/material/CssBaseline";
import Grid from "@mui/material/Grid";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Header from "./Header";
import FeaturedPost from "./FeaturedPost";
import Footer from "./Footer";
import { useState, useEffect } from "react";
import Modal from "@mui/material/Modal";

const sections = [
  { title: "Academic Resources" },
  { title: "Career Services" },
  { title: "Campus" },
  { title: "Culture" },
  { title: "Local Community Resources" },
  { title: "Social" },
  { title: "Sports" },
  { title: "Health and Wellness" },
  { title: "Technology" },
  { title: "Travel" },
  { title: "Alumni" },
  { title: "All posts" },
];

const defaultTheme = createTheme();

export default function Blog(props) {
  const [posts, setPosts] = useState([]);
  const [filteredposts, setFilteredPosts] = useState([]);
  const { selectedSection, setSelectedSection, data } = props;
  const [messages, setMessages] = useState([]);
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const posts1 = await data.getPosts();
      setPosts(posts1);
    };

    fetchData();
  }, [data]);

  useEffect(() => {
    const fetchData = async () => {
      const fp = await data.getPostsByTopic(selectedSection, posts);
      setFilteredPosts(fp);
    };

    if (posts.length > 0) {
      fetchData();
    }
  }, [posts, selectedSection]);

  useEffect(() => {
    const fetchData = async () => {
      const fp = await data.getPostsByTopic(selectedSection, posts);
      setFilteredPosts(fp);
    };

    if (filteredposts.length <= 0) {
      fetchData();
    }
  }, [filteredposts, selectedSection]);

  const users = data.getUsers();

  const handleSendMessage = async (message) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { text: message, sender: "user" },
    ]);

    setTimeout(() => {
      setMessages((prevMessages) => [...prevMessages]);
    }, 1000);

    try {
      const { completions, completion2, completion3 } =
        await fetchDataFromBackend();
      const responseMessage = `Restaurants:\n${formatRestaurants(
        completions
      )}\n\nMusical events:\n${formatEvents(
        completion2
      )}\n\nSports events:\n${formatSportsEvents(completion3)}`;
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: responseMessage, sender: "Assistant" },
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchDataFromBackend = async () => {
    try {
      const locationData = {
        latitude: 41.843783178979265,
        longitude: -87.62321154781516,
        city: "Chicago",
      };
      const apiKey = "70e49117b80f210af90236e6189abc4a";
      const weatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${locationData.latitude}&lon=${locationData.longitude}&appid=${apiKey}`
      );
      if (!weatherResponse.ok) {
        throw new Error("Failed to fetch weather information");
      }
      const weatherData = await weatherResponse.json();
      const postData = {
        location: locationData,
        weather: weatherData,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
      };

      const backendResponse = await fetch("http://localhost:4000/data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      });
      if (!backendResponse.ok) {
        throw new Error("Failed to send data to the backend");
      }

      const responseData = await backendResponse.json();
      return {
        completions: responseData.completions,
        completion2: responseData.completion2,
        completion3: responseData.completion3,
      };
    } catch (error) {
      console.error("Error fetching data:", error);
      return {};
    }
  };

  const formatRestaurants = (restaurants) => {
    return restaurants
      .map((restaurant, index) => {
        const { title, address, open_state, operating_hours } = restaurant;
        let hours = "";
        for (let day in operating_hours) {
          hours += `- ${day}: ${operating_hours[day]}\n`;
        }
        return `${
          index + 1
        }. ${title}\n   Address: ${address}\n   Open State: ${open_state}\n   Operating Hours:\n${hours}`;
      })
      .join("\n");
  };

  const formatEvents = (events) => {
    return events
      .map((event, index) => {
        const { title, address, open_state, description, operating_hours } =
          event;
        let hours = "";
        for (let day in operating_hours) {
          hours += `- ${day}: ${operating_hours[day]}\n`;
        }
        return `${
          index + 1
        }. ${title}\n   Address: ${address}\n   Open State: ${open_state}\n   Description: ${description}\n   Operating Hours:\n${hours}`;
      })
      .join("\n");
  };

  const formatSportsEvents = (events) => {
    return events
      .map((event, index) => {
        const { sport, gps_coordinates } = event;
        const { title, date, address, link, description } = sport;
        const eventDate = new Date(date);
        const formattedDate = `${eventDate.toLocaleDateString()} ${eventDate.toLocaleTimeString()}`;
        return `${
          index + 1
        }. ${title}\n   Date: ${formattedDate}\n   Address: ${address.join(
          ", "
        )}\n   Link: ${link}\n   Description: ${description}\n   Coordinates: (${
          gps_coordinates.latitude
        }, ${gps_coordinates.longitude})`;
      })
      .join("\n");
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <CssBaseline />
      <Container maxWidth="lg">
        <Header
          title="Blog"
          users={users}
          setFilteredPosts={setFilteredPosts}
          sections={sections}
          selectedSection={selectedSection}
          setSelectedSection={setSelectedSection}
        />
        <main>
          <Grid container spacing={4}>
            {filteredposts.map((post) => (
              <FeaturedPost key={post.id} post={post} />
            ))}
          </Grid>
        </main>
      </Container>
      <Footer
        title="Footer"
        description="Something here to give the footer a purpose!"
      />
      <button
        onClick={() => setOpenModal(true)}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          zIndex: "1000",
          padding: "10px 20px",
          borderRadius: "4px",
          border: "none",
          backgroundColor: "#007bff",
          color: "#fff",
          cursor: "pointer",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        }}
      >
        Open Chatbot (Assistant)
      </button>
      <Modal
        open={openModal}
        onClose={() => setOpenModal(false)}
        aria-labelledby="chatbot-modal-title"
        aria-describedby="chatbot-modal-description"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Chatbot messages={messages} onSendMessage={handleSendMessage} />
      </Modal>
    </ThemeProvider>
  );
}

function Chatbot({ messages, onSendMessage }) {
  const [inputText, setInputText] = useState("");

  const handleChange = (e) => {
    setInputText(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputText.trim() !== "") {
      onSendMessage(inputText.trim());
      setInputText("");
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#f0f0f0",
        padding: "20px",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
      }}
    >
      {messages.map((message, index) => (
        <div
          key={index}
          style={{
            textAlign: message.sender === "user" ? "right" : "left",
            marginBottom: "10px",
            fontSize: "16px",
          }}
        >
          <span style={{ fontWeight: "bold" }}>
            {message.sender === "user" ? "You: " : "Assistant: "}
          </span>
          {message.text}
        </div>
      ))}
      <form onSubmit={handleSubmit} style={{ marginTop: "20px" }}>
        <input
          type="text"
          value={inputText}
          onChange={handleChange}
          style={{
            width: "calc(100% - 80px)",
            padding: "10px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            marginRight: "10px",
          }}
        />
        <button
          type="submit"
          style={{
            padding: "10px 20px",
            borderRadius: "4px",
            border: "none",
            backgroundColor: "#007bff",
            color: "#fff",
            cursor: "pointer",
            marginTop: "10px",
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
}

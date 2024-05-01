import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Datac from "./Datac";
import { Button, TextField } from "@mui/material";

function PostinDetail(props) {
  const { postId } = useParams();
  const { data } = props;
  const [reload, setReload] = useState(false);
  const [comments, setComments] = useState([]);
  const [posts, setPosts] = useState(null); // Initialize posts state
  const [reply, setReply] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState(""); // State for additional information
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(false); // State to control visibility of additional info text field
  const loggedIn = localStorage.getItem("loggedIn");

  // Function to fetch posts with async/await
  const fetchPosts = async () => {
    try {
      const fetchedPosts = await data.getPosts();
      setPosts(fetchedPosts);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  useEffect(() => {
    fetchPosts(); // Call the async function to fetch posts
  }, [data]); // Include data as a dependency

  const post = posts?.find((e) => e.id == postId);

  // Ensure that post is not undefined before attempting to destructure its properties
  const { body, status, title, topic } = post || {};

  const handleClick = () => {
    const name = localStorage.getItem("userName");
    const comment = {
      postId,
      author: name,
      text: reply,
    };
    data.addComment(comment);
    setReload(!reload);
  };

  const handleFillTextField = async () => {
    // Function to toggle visibility of additional info text field
    setShowAdditionalInfo(!showAdditionalInfo);
    // If the additional info text field is visible, fill the reply text field
    if (!showAdditionalInfo) {
      // setReply(additionalInfo);

      try {
        // Send POST request using fetch
        const response = await fetch("http://localhost:4000/generate-reply", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ post }), // Send post data with the key 'post'
        });

        // Check if request was successful
        if (!response.ok) {
          throw new Error("Failed to send post to the backend");
        }

        // Extract the JSON data from the response
        const responseData = await response.json();

        // Handle the response as needed
        console.log("Post successfully sent to the backend:");
        console.log(responseData); // Log the response data for debugging

        // Set the reply state with the response data
        setReply(responseData.generatedReply);
      } catch (error) {
        // Handle errors
        console.error("Error sending post to the backend:", error);
      }
    } else {
      setReply(""); // Clear the reply text field if additional info text field is hidden
    }
  };

  useEffect(() => {
    const updatedPost = posts?.find((e) => e.id == postId);
    if (updatedPost) {
      const updatedComments = updatedPost.comments;
      setComments(updatedComments);
    }
  }, [reload, postId, posts]); // Include posts as a dependency

  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "0 auto",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {post ? (
        <>
          <h1 style={{ fontSize: "24px", marginBottom: "10px" }}>{title}</h1>
          <h2 style={{ fontSize: "18px", marginBottom: "5px" }}>
            Author: {status}
          </h2>
          <h3
            style={{
              fontSize: "16px",
              fontStyle: "italic",
              marginBottom: "0",
            }}
          >
            Topic: {topic}
          </h3>
          <p
            style={{
              fontSize: "16px",
              lineHeight: "1.6",
              marginBottom: "20px",
            }}
          >
            {body}
          </p>
        </>
      ) : (
        <p>Loading...</p>
      )}
      {loggedIn ? (
        <>
          <TextField
            label="Enter reply"
            variant="outlined"
            fullWidth
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            style={{ marginBottom: "10px" }}
          />
          <Button
            style={{
              backgroundColor: "#4caf50",
              color: "white",
              borderRadius: "5px",
              padding: "10px 20px",
              fontSize: "16px",
              fontWeight: "bold",
              border: "none",
              cursor: "pointer",
              textDecoration: "none",
              marginRight: "10px", // Added margin to separate the buttons
            }}
            onClick={handleClick}
          >
            Add a reply
          </Button>
          {/* Button to fill the text field with additional information */}
          <Button
            style={{
              backgroundColor: "#007bff",
              color: "white",
              borderRadius: "5px",
              padding: "10px 20px",
              fontSize: "16px",
              fontWeight: "bold",
              border: "none",
              cursor: "pointer",
              textDecoration: "none",
            }}
            onClick={handleFillTextField}
          >
            {showAdditionalInfo
              ? "Disable reply by chatgpt"
              : "Generate reply by ChatGPT"}
          </Button>
        </>
      ) : (
        <></>
      )}

      <h2 style={{ fontSize: "20px", marginBottom: "10px" }}>Reply Section</h2>
      <div
        style={{
          backgroundColor: "#f0f0f0",
          padding: "10px",
          marginBottom: "10px",
        }}
      >
        {comments?.map((comment, index) => (
          <div key={index} style={{ marginBottom: "10px" }}>
            <p
              style={{
                margin: "0",
                padding: "5px 0",
                fontWeight: "bold",
              }}
            >
              {comment.text}
            </p>
            <p
              style={{
                margin: "0",
                padding: "5px 0",
                color: "#888",
              }}
            >
              Author: {comment.author}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PostinDetail;

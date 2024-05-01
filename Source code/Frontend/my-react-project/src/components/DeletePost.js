import React from "react";
import { useNavigate } from "react-router-dom";

const DeletePost = ({ data, deletePost }) => {
  const posts = data.getPosts();
  const navigate = useNavigate();

  const handleDelete = (id) => {
    deletePost(id);
    navigate("/");
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>All Posts</h2>
      {posts.map((post) => (
        <div key={post.id} style={{ marginBottom: "20px" }}>
          <h3 style={{ marginBottom: "10px", color: "#333" }}>{post.title}</h3>
          <p style={{ marginBottom: "10px" }}>{post.body}</p>
          <button
            onClick={() => handleDelete(post.id)}
            style={{
              backgroundColor: "#f44336",
              color: "#fff",
              padding: "8px 16px",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
};

export default DeletePost;

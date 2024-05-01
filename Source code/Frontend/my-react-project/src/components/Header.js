import React, { useState, useEffect } from "react";
import { createTheme } from "@mui/material";
import PropTypes from "prop-types";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import { Box, Modal, InputBase, alpha } from "@mui/material";
import Icon from "./Icon";
import Login from "./Login";
import { useNavigate } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import RecommendationModal from "./RecommendationModal";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Header(props) {
  const { sections, title, setSelectedSection, selectedSection } = props;
  const [open, setOpen] = useState(false); // State variable for managing modal open/close
  const [loggedIn, setLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [type, setUserType] = useState("");
  const [status, setStatus] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [topicsub, setTopicSub] = useState([]);
  const [openRecommendationModal, setOpenRecommendationModal] = useState(false);

  useEffect(() => {
    const loggedInState = localStorage.getItem("loggedIn");
    const userNameStored = localStorage.getItem("userName");
    const status1 = localStorage.getItem("status");
    const type2 = localStorage.getItem("type");

    if (loggedInState === "true" && userNameStored) {
      setLoggedIn(true);
      setUserName(userNameStored);
      setUserType(type2);
      setStatus(status1);
    }
  }, [open]);

  const handleLogout = () => {
    setUserName("");
    setLoggedIn(false);
    setUserType("");
    setStatus("");
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("userName");
    localStorage.removeItem("status");
    localStorage.removeItem("type");
    localStorage.removeItem("email");
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSectionClick = (section) => {
    setSelectedSection(section.title);
  };

  const navigate = useNavigate();

  const handlecreatebutton = () => {
    navigate("/logined/createpost");
  };

  const handledeletepost = () => {
    navigate("/deletpost");
  };

  const handledisableuser = () => {
    navigate("/disableuser");
  };

  const handleSearch = async (event) => {
    const searchQuery = event.target.value.toLowerCase();
    console.log(searchQuery);

    try {
      // Stringify the post object
      const searchObject = { searchQuery }; // Assuming searchQuery is a string
      const postData = JSON.stringify(searchObject);
      console.log(postData);
      // Send POST request using fetch
      const response = await fetch("http://localhost:4000/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: postData,
      });

      // Check if request was successful
      if (!response.ok) {
        throw new Error("Failed to send post to the backend");
      }

      // Handle the response as needed
      const responseData = await response.json();
      props.setfilteredposts(responseData);
      console.log(responseData);

      // Navigate to the desired page after successful submission
      navigate("/");
    } catch (error) {
      // Handle errors
      console.error("Error sending post to the backend:", error);
    }
  };

  const handleGetOpenAIRecommendations = async () => {
    try {
      setOpenRecommendationModal(true);
    } catch (error) {
      console.error("Error fetching location and weather information:", error);
    }
  };

  const handleSubscribe = () => {
    // Check if the selected section is already subscribed
    if (topicsub.includes(selectedSection)) {
      // If already subscribed, remove it
      setTopicSub(topicsub.filter((topic) => topic !== selectedSection));
      toast.info(`Topic unsubscribed: ${selectedSection}`);
    } else {
      // If not subscribed, add it
      setTopicSub([...topicsub, selectedSection]);
      toast.success(`Topic subscribed: ${selectedSection}`);
    }
  };

  const handleOpenRecommendationModal = () => {
    setOpenRecommendationModal(true);
  };

  const handleCloseRecommendationModal = () => {
    setOpenRecommendationModal(false);
  };

  return (
    <React.Fragment>
      <ToastContainer />
      <Toolbar sx={{ borderBottom: 1, borderColor: "divider" }}>
        {loggedIn ? (
          <>
            <Button size="small" onClick={handlecreatebutton}>
              Create Post
            </Button>
            <Button onClick={handleSubscribe}>
              {topicsub.includes(selectedSection) ? "Unsubscribe" : "Subscribe"}
            </Button>
          </>
        ) : (
          <></>
        )}
        {type === "Moderator" || type === "Administrator" ? (
          <Button size="small" onClick={handledeletepost}>
            Delete a post
          </Button>
        ) : (
          <></>
        )}
        {type === "Administrator" ? (
          <Button size="small" onClick={handledisableuser}>
            Disable an user
          </Button>
        ) : (
          <></>
        )}
        <Button size="small" onClick={handleGetOpenAIRecommendations}>
          Recommended for you
        </Button>
        <Typography
          component="h2"
          variant="h5"
          color="inherit"
          align="center"
          noWrap
          sx={{ flex: 1 }}
        >
          {title}
        </Typography>
        <IconButton>
          <SearchIcon />
        </IconButton>
        <InputBase
          placeholder="Search..."
          sx={{
            marginLeft: 1,
            flex: 1,
            color: "inherit",
            "& .MuiInputBase-input": {
              color: "inherit",
            },
          }}
          onChange={handleSearch}
        />
        {loggedIn ? (
          <>
            <Icon inputData={userName} />
            <Button onClick={handleLogout}>Logout</Button>
          </>
        ) : (
          <Button onClick={handleOpen}>Sign in</Button>
        )}

        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box
            sx={{
              width: "50%", // Adjust the width as needed
              bgcolor: "background.paper",
              border: "2px solid #000",
              boxShadow: 24,
              p: 4,
            }}
          >
            <Login users={props.users} handleClose={handleClose} />
          </Box>
        </Modal>
      </Toolbar>
      <Toolbar
        component="nav"
        variant="dense"
        sx={{ justifyContent: "space-between", overflowX: "auto" }}
      >
        {sections.map((section) => (
          <Button
            key={section.title}
            onClick={() => setSelectedSection(section.title)}
            color="inherit"
            noWrap
            variant="body2"
            sx={{ p: 1, flexShrink: 0, fontSize: "0.65rem" }}
          >
            {section.title}
          </Button>
        ))}
      </Toolbar>
      {/* RecommendationModal as a Modal */}
      <Modal
        open={openRecommendationModal}
        onClose={handleCloseRecommendationModal}
        aria-labelledby="recommendation-modal-title"
        aria-describedby="recommendation-modal-description"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            width: "70%", // Adjust the width as needed
            bgcolor: "background.paper",
            border: "2px solid #000",
            boxShadow: 24,
            p: 4,
            maxHeight: "85vh", // Set max height to 80% of viewport height
            overflow: "auto", // Enable scrolling if content exceeds maxHeight
          }}
        >
          <RecommendationModal onClose={handleCloseRecommendationModal} />
        </Box>
      </Modal>
    </React.Fragment>
  );
}

Header.propTypes = {
  sections: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      url: PropTypes.string.isRequired,
    })
  ).isRequired,
  title: PropTypes.string.isRequired,
  onSectionSelect: PropTypes.func.isRequired,
};

export default Header;

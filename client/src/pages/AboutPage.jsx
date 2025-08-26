import React from "react";
import { Container, Box, Typography, Paper, List, ListItem, ListItemText, Link, Button } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";

const AboutPage = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button
        variant="outlined"
        startIcon={<ArrowBackIcon />}
        sx={{ mb: 3, textTransform: "none" }}
        onClick={() => navigate(-1)}
      >
        Back
      </Button>

      <Paper elevation={3} sx={{ p: 4, borderRadius: 3, background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)" }}>
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Typography variant="h3" sx={{ fontWeight: "bold", mb: 1 }}>
            🌤️ Smart Weather App
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Built by Mustafa Taha
          </Typography>
        </Box>

        {/* Project Description */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
            Project Description
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            This weather application allows users to get current weather and a 5-day forecast for selected locations or their current location. Users can also view their search history, export it as JSON, and toggle temperature units between Celsius and Fahrenheit.
          </Typography>
        </Box>

        {/* PM Accelerator Info */}
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <img
            src="https://media.licdn.com/dms/image/v2/C560BAQERjWEoRZ15Tg/company-logo_200_200/company-logo_200_200/0/1656545579397/productmanagerinterview_logo?e=1758758400&v=beta&t=BofSlFS-sF3rVGDu1wGRjb6yg7T9V7F7QYZW_zTKvJU"
            alt="PM Accelerator Logo"
            style={{ width: 120, height: 120, marginBottom: 10 }}
          />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Product Manager Accelerator
          </Typography>
          <Typography variant="body1" color="text.secondary">
            From entry-level to VP of Product, we support PM professionals through every stage of their careers.
            <br />
            <Link href="https://www.linkedin.com/school/pmaccelerator/" target="_blank" rel="noopener">
              Learn more on LinkedIn
            </Link>
          </Typography>
        </Box>

        {/* Technologies Used */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            Technologies Used
          </Typography>
          <List>
            <ListItem>
              <ListItemText primary="Frontend: React, Material-UI, Leaflet.js" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Backend: Node.js, Express.js" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Database: MongoDB" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Other: Axios for API calls, OpenWeatherMap API for weather data" />
            </ListItem>
          </List>
        </Box>

        {/* How to Run the Project */}
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            How to Run the Project
          </Typography>
          <Typography variant="body1">
            1. Clone the repository from GitHub.<br />
            2. Install dependencies: <code>npm install</code><br />
            3. Start the backend server: <code>npm run server</code> (or as per your setup)<br />
            4. Start the frontend app: <code>npm start</code><br />
            5. Open <code>http://localhost:3000</code> in your browser.
          </Typography>
        </Box>

        <Box sx={{ mt: 3, textAlign: "center" }}>
          <Typography variant="body1">
            Thank you for reviewing my project!
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default AboutPage;

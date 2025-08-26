import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Tabs,
  Tab,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  IconButton,
  Divider,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Link, useLocation } from "react-router-dom";
import { useTempUnit } from "../context/TempUnitContext";
import { styled } from "@mui/material/styles";
import CustomUnitSwitch from "./CustomUnitSwitch";



const NavigationBar = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.pathname);
  const { unit, toggleUnit } = useTempUnit();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setActiveTab(location.pathname);
  }, [location.pathname]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const navItems = [
    { label: "Home", path: "/" },
    { label: "Smart", path: "/smart" },
    { label: "History", path: "/history" },
    { label: "History-smart", path: "/history-smart" },
    { label: "Locations", path: "/locations" },
    { label: "About", path: "/about" },
    
  ];

  return (
    <AppBar position="sticky" sx={{ background: "white", boxShadow: 3 }}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between", px: { xs: 2, md: 4 } }}>
        {/* Logo */}
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{
            textDecoration: "none",
            fontWeight: "bold",
            fontSize: { xs: 18, md: 22 },
            background: "linear-gradient(45deg, #1A237E 30%, #5C6BC0 90%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            "&:hover": { transform: "scale(1.05)", transition: "transform 0.2s" },
          }}
        >
          MyWeather 🌤️
        </Typography>

        {/* Desktop Tabs */}
        <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", flexGrow: 1, justifyContent: "center" }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            textColor="primary"
            indicatorColor="secondary"
            sx={{ "& .MuiTabs-indicator": { height: 4, borderRadius: 2 } }}
          >
            {navItems.map((item) => (
              <Tab
                key={item.path}
                label={item.label}
                value={item.path}
                component={Link}
                to={item.path}
                sx={{ fontWeight: 600, textTransform: "none" }}
              />
            ))}
          </Tabs>
        </Box>

        {/* Right Side: Unit Switch & Mobile Menu */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <CustomUnitSwitch checked={unit === "F"} onChange={toggleUnit} />

          {/* Desktop Button */}
          <Button
            variant="contained"
            component={Link}
            to="/smart"
            sx={{
              ml: 1,
              display: { xs: "none", md: "inline-flex" },
              textTransform: "none",
              fontWeight: 600,
              borderRadius: 2,
              background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
              "&:hover": { background: "linear-gradient(45deg, #1976D2 30%, #19A3E0 90%)" },
            }}
          >
            Check Weather
          </Button>

          {/* Mobile Hamburger */}
          <IconButton
            edge="end"
            onClick={() => setDrawerOpen(true)}
            sx={{ display: { md: "none" }, color: "#1976D2", ml: 1 }}
          >
            <MenuIcon />
          </IconButton>
        </Box>
      </Toolbar>

      {/* Mobile Drawer */}
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 250 }} role="presentation" onClick={() => setDrawerOpen(false)}>
          <List>
            {navItems.map((item) => (
              <ListItem key={item.path} disablePadding>
                <ListItemButton component={Link} to={item.path}>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Divider />
          <Box sx={{ p: 2 }}>
            <Button
              variant="contained"
              component={Link}
              to="/smart"
              fullWidth
              sx={{ textTransform: "none", fontWeight: 600 }}
            >
              Check Weather
            </Button>
          </Box>
        </Box>
      </Drawer>
    </AppBar>
  );
};

export default NavigationBar;

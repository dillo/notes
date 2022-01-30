import React, { useState, useEffect } from "react";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import { LinkContainer } from "react-router-bootstrap";
import { useHistory } from "react-router-dom";

import { Auth } from "aws-amplify";

import Routes from "./Routes";

import { AppContext } from "./lib/contextLib";
import { onError } from "./lib/errorLib";

import ErrorBoundary from "./components/ErrorBoundary";

import "./App.css";

const App = () => {
  const history = useHistory();
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [isAuthenticated, userHasAuthenticated] = useState(false);

  useEffect(() => {
    const onLoad = async () => {
      try {
        await Auth.currentSession();
        userHasAuthenticated(true);
      }
      catch(e) {
        if (e !== 'No current user') {
          onError(e);
        }
      }
      setIsAuthenticating(false);
    }

    onLoad();
  }, []);

  const handleLogout = async () => {
    await Auth.signOut();
    userHasAuthenticated(false);
    history.push("/login");
  }

  const authenticatedNav = () => {
    return (
      <>
        <LinkContainer to="/settings">
          <Nav.Link>Settings</Nav.Link>
        </LinkContainer>
        <Nav.Link onClick={handleLogout}>Logout</Nav.Link>
      </>
    );
  }

  const unauthenticatedNav = () => {
    return (
      <>
        <LinkContainer to="/signup">
          <Nav.Link>Signup</Nav.Link>
        </LinkContainer>
        <LinkContainer to="/login">
          <Nav.Link>Login</Nav.Link>
        </LinkContainer>
      </>
    );
  }

  const main = () => {
    return (
      <div className="App container py-3">
        <Navbar collapseOnSelect bg="light" expand="md" className="mb-3">
          <LinkContainer to="/">
            <Navbar.Brand className="font-weight-bold text-muted">
              Scratch
            </Navbar.Brand>
          </LinkContainer>
          <Navbar.Toggle />
          <Navbar.Collapse className="justify-content-end">
            <Nav activeKey={window.location.pathname}>
              {isAuthenticated ? authenticatedNav() : unauthenticatedNav()}
            </Nav>
          </Navbar.Collapse>
        </Navbar>
        <ErrorBoundary>
          <AppContext.Provider value={{ isAuthenticated, userHasAuthenticated }}>
            <Routes />
          </AppContext.Provider>
        </ErrorBoundary>
      </div>
    );
  }

  return (!isAuthenticating && main());
}

export default App;

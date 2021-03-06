import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { LinkContainer } from "react-router-bootstrap";

import { API } from "aws-amplify";

import config from "../config";

import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

import { onError } from "../lib/errorLib";

import BillingForm from "../components/BillingForm";
import LoaderButton from "../components/LoaderButton";

import "./css/Settings.css";

const Settings = () => {
  const history = useHistory();
  const [isLoading, setIsLoading] = useState(false);
  const stripePromise = loadStripe(config.STRIPE_KEY);

  function billUser(details) {
    return API.post("notes", "/billing", {
      body: details
    });
  }

  const handleFormSubmit = async (storage, { token, error }) => {
    if (error) {
      onError(error);
      return;
    }
    setIsLoading(true);

    try {
      await billUser({
        storage,
        source: token.id,
      });
      alert("Your card has been charged successfully!");
      history.push("/");
    } catch (e) {
      onError(e);
      setIsLoading(false);
    }
  }

  return (
    <div className="Settings">
      <LinkContainer to="/settings/email">
        <LoaderButton block bssize="large">
          Change Email
        </LoaderButton>
      </LinkContainer>
      <LinkContainer to="/settings/password">
        <LoaderButton block bssize="large">
          Change Password
        </LoaderButton>
      </LinkContainer>
      <hr />
      <Elements
        stripe={stripePromise}
        fonts={[
          {
            cssSrc:
              "https://fonts.googleapis.com/css?family=Open+Sans:300,400,600,700,800",
          },
        ]}
      >
        <BillingForm isLoading={isLoading} onSubmit={handleFormSubmit} />
      </Elements>
    </div>
  );
}

export default Settings;

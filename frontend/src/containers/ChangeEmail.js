import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import {
  FormText,
  FormGroup,
  FormControl,
  FormLabel,
} from "react-bootstrap";

import { useFormFields } from "../lib/hooksLib";
import { onError } from "../lib/errorLib";

import LoaderButton from "../components/LoaderButton";

import { Auth } from "aws-amplify";

import "./css/ChangeEmail.css";

const ChangeEmail = () => {
  const history = useHistory();
  const [codeSent, setCodeSent] = useState(false);
  const [fields, handleFieldChange] = useFormFields({
    code: "",
    email: "",
    confirmEmail: "",
  });
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);

  const validateEmailForm = () => {
    return (
      fields.email.length > 0 &&
      fields.email === fields.confirmEmail
    )
  }

  const validateConfirmForm = () => {
    return fields.code.length > 0;
  }

  const handleUpdateClick = async (event) => {
    event.preventDefault();
    setIsSendingCode(true);

    try {
      const user = await Auth.currentAuthenticatedUser();
      await Auth.updateUserAttributes(user, { email: fields.email });
      setCodeSent(true);
    } catch (error) {
      onError(error);
      setIsSendingCode(false);
    }
  }

  const handleConfirmClick = async (event) => {
    event.preventDefault();
    setIsConfirming(true);

    try {
      await Auth.verifyCurrentUserAttributeSubmit("email", fields.code);
      history.push("/settings");
    } catch (error) {
      onError(error);
      setIsConfirming(false);
    }
  }

  const renderUpdateForm = () => {
    return (
      <form onSubmit={handleUpdateClick}>
        <FormGroup bssize="large" controlId="email">
          <FormLabel>New Email</FormLabel>
          <FormControl
            autoFocus
            type="email"
            value={fields.email}
            onChange={handleFieldChange}
          />
        </FormGroup>
        <FormGroup bssize="large" controlId="confirmEmail">
          <FormLabel>Confirm New Email</FormLabel>
          <FormControl
            type="email"
            value={fields.confirmEmail}
            onChange={handleFieldChange}
          />
        </FormGroup>
        <LoaderButton
          block
          type="submit"
          bssize="large"
          isLoading={isSendingCode}
          disabled={!validateEmailForm()}
        >
          Update Email
        </LoaderButton>
      </form>
    );
  }

  const renderConfirmationForm = () => {
    return (
      <form onSubmit={handleConfirmClick}>
        <FormGroup bssize="large" controlId="code">
          <FormLabel>Confirmation Code</FormLabel>
          <FormControl
            autoFocus
            type="tel"
            value={fields.code}
            onChange={handleFieldChange}
          />
          <FormText>
            Please check your email ({fields.email}) for the confirmation code.
          </FormText>
        </FormGroup>
        <LoaderButton
          block
          type="submit"
          bssize="large"
          isLoading={isConfirming}
          disabled={!validateConfirmForm()}
        >
          Confirm
        </LoaderButton>
      </form>
    );
  }

  return (
    <div className="ChangeEmail">
      {!codeSent ? renderUpdateForm() : renderConfirmationForm()}
    </div>
  );
}

export default ChangeEmail;

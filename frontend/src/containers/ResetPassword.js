import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FormText,
  FormGroup,
  FormControl,
  FormLabel,
} from "react-bootstrap";
import { BsCheck } from "react-icons/bs";

import { Auth } from "aws-amplify";

import { useFormFields } from "../lib/hooksLib";
import { onError } from "../lib/errorLib";

import LoaderButton from "../components/LoaderButton";

import "./css/ResetPassword.css";

const ResetPassword = () => {
  const [fields, handleFieldChange] = useFormFields({
    code: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [codeSent, setCodeSent] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);

  const validateCodeForm = () => {
    return fields.email.length > 0;
  }

  const validateResetForm = () => {
    return (
      fields.code.length > 0 &&
      fields.password.length > 0 &&
      fields.password === fields.confirmPassword
    );
  }

  const handleSendCodeClick = async (event) => {
    event.preventDefault();
    setIsSendingCode(true);

    try {
      await Auth.forgotPassword(fields.email);
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
      await Auth.forgotPasswordSubmit(
        fields.email,
        fields.code,
        fields.password
      );
      setConfirmed(true);
    } catch (error) {
      onError(error);
      setIsConfirming(false);
    }
  }

  const renderRequestCodeForm = () => {
    return (
      <form onSubmit={handleSendCodeClick}>
        <FormGroup bssize="large" controlId="email">
          <FormLabel>Email</FormLabel>
          <FormControl
            autoFocus
            type="email"
            value={fields.email}
            onChange={handleFieldChange}
          />
        </FormGroup>
        <LoaderButton
          block
          type="submit"
          bssize="large"
          isLoading={isSendingCode}
          disabled={!validateCodeForm()}
        >
          Send Confirmation
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
        <hr />
        <FormGroup bssize="large" controlId="password">
          <FormLabel>New Password</FormLabel>
          <FormControl
            type="password"
            value={fields.password}
            onChange={handleFieldChange}
          />
        </FormGroup>
        <FormGroup bssize="large" controlId="confirmPassword">
          <FormLabel>Confirm Password</FormLabel>
          <FormControl
            type="password"
            value={fields.confirmPassword}
            onChange={handleFieldChange}
          />
        </FormGroup>
        <LoaderButton
          block
          type="submit"
          bssize="large"
          isLoading={isConfirming}
          disabled={!validateResetForm()}
        >
          Confirm
        </LoaderButton>
      </form>
    );
  }

  const renderSuccessMessage = () => {
    return (
      <div className="success">
        <p><BsCheck size={16} /> Your password has been reset.</p>
        <p>
          <Link to="/login">
            Click here to login with your new credentials.
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="ResetPassword">
      {!codeSent
        ? renderRequestCodeForm()
        : !confirmed
        ? renderConfirmationForm()
        : renderSuccessMessage()}
    </div>
  );
}

export default ResetPassword;

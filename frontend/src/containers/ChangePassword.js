import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { FormGroup, FormControl, FormLabel } from "react-bootstrap";

import { useFormFields } from "../lib/hooksLib";
import { onError } from "../lib/errorLib";
import LoaderButton from "../components/LoaderButton";

import { Auth } from "aws-amplify";

import "./css/ChangePassword.css";

const ChangePassword = () => {
  const history = useHistory();
  const [fields, handleFieldChange] = useFormFields({
    password: "",
    oldPassword: "",
    confirmPassword: "",
  });
  const [isChanging, setIsChanging] = useState(false);

  const validateForm = () => {
    return (
      fields.oldPassword.length > 0 &&
      fields.password.length > 0 &&
      fields.password === fields.confirmPassword
    );
  }

  const handleChangeClick = async (event) => {
    event.preventDefault();
    setIsChanging(true);

    try {
      const currentUser = await Auth.currentAuthenticatedUser();
      await Auth.changePassword(
        currentUser,
        fields.oldPassword,
        fields.password
      );
      history.push("/settings");
    } catch (error) {
      onError(error);
      setIsChanging(false);
    }
  }

  return (
    <div className="ChangePassword">
      <form onSubmit={handleChangeClick}>
        <FormGroup bssize="large" controlId="oldPassword">
          <FormLabel>Old Password</FormLabel>
          <FormControl
            type="password"
            onChange={handleFieldChange}
            value={fields.oldPassword}
          />
        </FormGroup>
        <hr />
        <FormGroup bssize="large" controlId="password">
          <FormLabel>New Password</FormLabel>
          <FormControl
            type="password"
            onChange={handleFieldChange}
            value={fields.password}
          />
        </FormGroup>
        <FormGroup bssize="large" controlId="confirmPassword">
          <FormLabel>Confirm Password</FormLabel>
          <FormControl
            type="password"
            onChange={handleFieldChange}
            value={fields.confirmPassword}
          />
        </FormGroup>
        <LoaderButton
          block
          type="submit"
          bssize="large"
          disabled={!validateForm()}
          isLoading={isChanging}
        >
          Change Password
        </LoaderButton>
      </form>
    </div>
  );
}

export default ChangePassword;

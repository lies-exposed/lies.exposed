import { type SignUpUserBody } from "@liexp/shared/lib/io/http/User";
import * as React from "react";
import { useRedirect } from "react-admin";
import { authProvider } from "../../../client/api";
import { dataProvider } from "../../../providers/DataProvider";
import { Box, Button, Link, TextField } from "../../mui";

interface SignInProps {
  redirectTo?: string;
}

export const SignIn: React.FC<SignInProps> = ({ redirectTo = "" }) => {
  const redirect = useRedirect();
  const [{ username, email, password, type, firstName, lastName }, setData] =
    React.useState({
      email: "",
      username: "",
      password: "",
      firstName: "",
      lastName: "",
      type: "login",
    });

  const doLogin = (username: string, password: string): void => {
    void authProvider.login({ username, password }).then(() => {
      redirect(redirectTo);
    });
  };

  const doSignUp = (u: SignUpUserBody): void => {
    void dataProvider
      .create("users/signup", {
        data: u,
      })
      .then(() => {
        redirect(window.location.pathname);
      });
  };

  return (
    <Box
      style={{
        display: "flex",
        flexDirection: "column",
        padding: 20,
      }}
    >
      <TextField
        size="small"
        name="username"
        placeholder={type === "signup" ? "username" : "username or email"}
        value={username}
        required
        style={{ marginBottom: 10 }}
        onChange={(e) => {
          setData((d) => ({
            ...d,
            username: e.target.value,
          }));
        }}
      />
      <TextField
        size="small"
        name="password"
        type="password"
        placeholder="****"
        value={password}
        required
        style={{ marginBottom: 20 }}
        onChange={(e) => {
          setData((d) => ({
            ...d,
            password: e.target.value,
          }));
        }}
      />
      {type === "signup" && (
        <TextField
          size="small"
          name="firstName"
          required
          placeholder="John"
          value={firstName}
          style={{ marginBottom: 20 }}
          onChange={(e) => {
            setData((d) => ({
              ...d,
              firstName: e.target.value,
            }));
          }}
        />
      )}
      {type === "signup" && (
        <TextField
          size="small"
          name="lastName"
          placeholder="Doe"
          required
          value={lastName}
          style={{ marginBottom: 20 }}
          onChange={(e) => {
            setData((d) => ({
              ...d,
              lastName: e.target.value,
            }));
          }}
        />
      )}
      {type === "signup" && (
        <TextField
          size="small"
          name="email"
          placeholder="john@doe.com"
          required
          value={email}
          style={{ marginBottom: 20 }}
          onChange={(e) => {
            setData((d) => ({
              ...d,
              email: e.target.value,
            }));
          }}
        />
      )}
      <Button
        variant="contained"
        onClick={() => {
          if (type === "signup") {
            doSignUp({ username, email, password, firstName, lastName });
          } else {
            doLogin(username, password);
          }
        }}
      >
        Sign {type === "signup" ? "Up" : "In"}
      </Button>
      - or -{" "}
      <Link
        display={"inline"}
        href="#"
        onClick={(e) => {
          e.preventDefault();
          setData((d) => ({
            ...d,
            type: "signup",
          }));
        }}
      >
        signup
      </Link>
    </Box>
  );
};

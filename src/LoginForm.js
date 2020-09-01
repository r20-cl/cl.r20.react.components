import React from "react";
function LoginForm(props) {
    var _a = React.useState(""), username = _a[0], setUsername = _a[1];
    var _b = React.useState(""), password = _b[0], setPassword = _b[1];
    var _c = React.useState(props.shouldRemember), remember = _c[0], setRemember = _c[1];
    var handleUsernameChange = function (e) {
        var value = e.target.value;
        setUsername(value);
        props.onUsernameChange(value);
    };
    var handlePasswordChange = function (e) {
        var value = e.target.value;
        setPassword(value);
        props.onPasswordChange(value);
    };
    var handleRememberChange = function (e) {
        var checked = e.target.checked;
        setRemember(checked);
        props.onRememberChange(checked);
    };
    var handleSubmit = function (e) {
        e.preventDefault();
        props.onSubmit(username, password, remember);
    };
    return (React.createElement("form", { "data-testid": "login-form", onSubmit: handleSubmit },
        React.createElement("label", { htmlFor: "username" }, "Username:"),
        React.createElement("input", { "data-testid": "username", type: "text", name: "username", value: username, onChange: handleUsernameChange }),
        React.createElement("label", { htmlFor: "password" }, "Password:"),
        React.createElement("input", { "data-testid": "password", type: "password", name: "password", value: password, onChange: handlePasswordChange }),
        React.createElement("label", null,
            React.createElement("input", { "data-testid": "remember", name: "remember", type: "checkbox", checked: remember, onChange: handleRememberChange }),
            "Remember me?"),
        React.createElement("button", { type: "submit", "data-testid": "submit" }, "Sign in")));
}
export default LoginForm;

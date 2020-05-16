import * as React from "react";
import * as ReactDOM from "react-dom";
import { TSDI } from "tsdi";
import { Router, Route, Switch, Redirect } from "react-router-dom";
import "semantic-ui-css-offline/semantic.min.css";
import "./factories";
import { getRoutes } from "./routing";
import { routeMainMenu } from "./pages";

// Start dependency injection.
const tsdi = new TSDI();
tsdi.enableComponentScanner();

async function main() {
    ReactDOM.render(
        <Router history={tsdi.get("history")}>
            <Switch>
                <Redirect exact from="/" to={routeMainMenu.path()} />
                {getRoutes().map((route, index) => (
                    <Route path={route.pattern} component={route.component} key={index} />
                ))}
            </Switch>
        </Router>,
        document.getElementById("app"),
    );
}

main();


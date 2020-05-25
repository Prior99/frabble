import * as React from "react";
import * as ReactDOM from "react-dom";
import { TSDI } from "tsdi";
import { Router, Route, Switch, Redirect } from "react-router-dom";
import "./factories";
import { getRoutes } from "./routing";
import { routeMainMenu } from "./pages";
import "./app.scss";
import { Background } from "./ui/background/background";

// Start dependency injection.
const tsdi = new TSDI();
tsdi.enableComponentScanner();

ReactDOM.render(
    <div className="App">
        <Background className="App__background" floating={false}/>
        <div className="App__main">
            <Router history={tsdi.get("history")}>
                <Switch>
                    <Redirect exact from="/" to={routeMainMenu.path()} />
                    {getRoutes().map((route, index) => (
                        <Route path={route.pattern} component={route.component} key={index} />
                    ))}
                </Switch>
            </Router>
        </div>
    </div>,
    document.getElementById("app"),
);
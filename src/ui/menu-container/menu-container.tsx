import * as React from "react";
import "./menu-container.scss";

export class MenuContainer extends React.Component {
    public render() {
        return (
            <div className="MenuContainer">
                {this.props.children}
            </div>
        );
    }
}

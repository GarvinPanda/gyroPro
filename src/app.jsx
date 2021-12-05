import React, { Component } from "react";
import ReactDOM from "react-dom";
import "./app.less";

import Index from "@src/pages/Index";
import Brush from "@src/pages/Brush";


class App extends Component {


    render() {
        return (
            // <Index />
            <Brush />
        );
    }
}

ReactDOM.render(<App />, document.getElementById("root"));

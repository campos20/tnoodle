import React, { Component } from "react";
import "bootstrap/dist/css/bootstrap.css";
import "./App.css";
import SideBar from "./main/components/SideBar";
import Main from "./main/components/Main";

class App extends Component {
    render() {
        return (
            <div className="App container-fluid">
                <SideBar />
                <div className="row">
                    <div className="col-12 m-0 p-0">
                        <Main />
                    </div>
                </div>
            </div>
        );
    }
}

export default App;

export const BASE_PATH = process.env.PUBLIC_URL;

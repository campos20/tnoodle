import { Layout } from "antd";
import "antd/dist/antd.css";
import "./App.css";
import Main from "./main/components/Main";
import SideBar from "./main/components/SideBar";

const App = () => {
    return (
        <Layout>
            <SideBar />
            <Main />
        </Layout>
    );
};

export default App;

export const BASE_PATH = process.env.PUBLIC_URL;

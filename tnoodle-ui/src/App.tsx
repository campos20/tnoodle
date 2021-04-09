import { Layout } from "antd";
import "antd/dist/antd.css";
import "./App.css";
import "./index.css";
import Main from "./main/components/Main";
import SideBar from "./main/components/SideBar";

const { Header, Content } = Layout;

const App = () => {
    return (
        <Layout style={{ minHeight: "100vh" }}>
            <SideBar />
            <Layout className="site-layout">
                <Header
                    className="site-layout-background"
                    style={{ padding: 0 }}
                />
                <Content style={{ margin: "0 16px" }}>
                    <div
                        className="site-layout-background"
                        style={{ padding: 24, minHeight: 360 }}
                    >
                        <Main />
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
};

export default App;

export const BASE_PATH = process.env.PUBLIC_URL;

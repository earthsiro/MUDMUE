import "./App.css";
import "./index.css";

import { RouterProvider } from "react-router-dom";
import { routerConfigs } from "./configs/router";

function App() {
    return (
        <>
            <RouterProvider router={routerConfigs}></RouterProvider>
        </>
    );
}

export default App;

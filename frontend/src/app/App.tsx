import {BrowserRouter} from "react-router-dom";
import AppLayout from "@/app/layouts/AppLayout.tsx";


const App = () => {
    return (
        <BrowserRouter>
            <AppLayout/>
        </BrowserRouter>
    );
};

export default App;
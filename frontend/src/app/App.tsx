import {BrowserRouter} from "react-router-dom";
import {AppProviders} from "@/app/providers/AppProviders.tsx";
import AppRouter from "@/app/router/AppRouter.tsx";


const App = () => {
    return (
        <AppProviders>
            <BrowserRouter>
                <AppRouter/>
            </BrowserRouter>
        </AppProviders>
    );
};

export default App;
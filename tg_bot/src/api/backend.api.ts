import 'dotenv/config'

import axios from "axios";
import * as process from "node:process";

const backendApi = axios.create({
    baseURL: process.env.BACKEND_API_URL,
    timeout: 10_000,
})

export default backendApi;
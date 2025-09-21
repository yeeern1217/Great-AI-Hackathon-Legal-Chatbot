import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

import { Amplify } from "aws-amplify";
import awsconfig from "./amplifyConfig";
Amplify.configure(awsconfig);

createRoot(document.getElementById("root")!).render(<App />);

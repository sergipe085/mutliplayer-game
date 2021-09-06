import { serverHTTP } from "./http";
import "./websocket";

serverHTTP.listen(3000, () => console.log("server started on port 3000"));

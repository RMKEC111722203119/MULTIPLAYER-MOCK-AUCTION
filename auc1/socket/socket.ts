import { io ,Socket} from "socket.io-client";



let  socket = io("http://localhost:5000"); // Connect only if socket is not already defined


export default socket;

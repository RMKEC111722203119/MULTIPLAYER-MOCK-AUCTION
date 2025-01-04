import { io ,Socket} from "socket.io-client";



let  socket = io(`${process.env.NEXT_PUBLIC_API_URL}`); // Connect only if socket is not already defined


export default socket;

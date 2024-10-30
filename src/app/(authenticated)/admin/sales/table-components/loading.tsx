import { LoaderCircle } from "lucide-react";

const Loading = () => {
    return ( <div className=" w-full flex p-5 justify-center items-center gap-2 flex-row text-gray-500"><LoaderCircle className=" animate-spin" />Loading...</div> );
}
 
export default Loading;
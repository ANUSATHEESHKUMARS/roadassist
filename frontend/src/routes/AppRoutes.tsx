import Register from "@/pages/auth/Register";
import { Route , Routes } from "react-router-dom";


export const AppRoutes = () =>{
    return(
     <Routes>
        <Route path="/register" element={<Register/>}/>
     </Routes>
    )
}
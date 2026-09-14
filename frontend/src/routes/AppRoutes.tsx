import Register from "@/pages/auth/Register";
import VerifyOtp from "@/pages/auth/VerifyOtp";
import { Route , Routes } from "react-router-dom";


export const AppRoutes = () =>{
    return(
     <Routes>
        <Route path="/register" element={<Register/>}/>
        <Route path="/verify-otp" element={<VerifyOtp/>}/>
     </Routes>
    )
}
import { useAuthStore } from "@/store/authStore"
import { Outlet, useLocation, Navigate } from "react-router-dom"

const ProtectedRoute = () => {

    const user = useAuthStore((state) => state.user)
    const location = useLocation()

    if (!user) {
        return (
            <Navigate
                to='/login'
                replace
                state={{ from: location }}
            />
        )
    }
    return <Outlet />
}

export default ProtectedRoute

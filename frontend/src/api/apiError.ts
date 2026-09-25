import axios from "axios"

export const getApiErrorMessage = (error : unknown): string =>{
    if(axios.isAxiosError(error)){
        return (
            error.response?.data?.message || "something went wrong. Please try again."
        )
    }
    return "Something went wrong. Please try again."
}
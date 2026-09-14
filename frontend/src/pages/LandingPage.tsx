import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function UserLandingPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-6">

            <div className="w-full max-w-md text-center space-y-6">

                <div className="flex justify-center">
                    <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                        <CheckCircle className="h-10 w-10 text-primary" />
                    </div>
                </div>

                <div className="space-y-2">
                    <h1 className="text-3xl font-bold">
                        Welcome to RoadAssist!
                    </h1>

                    <p className="text-sm text-muted-foreground">
                        Your account has been successfully verified.
                    </p>
                </div>

                <div className="pt-4">
                    <Button
                        onClick={() => navigate("/")}
                        className="px-8"
                    >
                        Continue
                    </Button>
                </div>

            </div>

        </div>
    );
}
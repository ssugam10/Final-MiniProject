"use client";
import React, { useEffect, useState } from "react";
import { History } from "lucide-react";

import SpinLoading from "@/components/loading/SpinLoading";

const Page = () => {
    const [user, setUserData] = useState<any | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const getUserData = async () => {
        try {
            const response = await fetch(`/api/auth/profile`);
            const data = await response.json();
            console.log(data);
            setUserData(data);
            setLoading(false);
        } catch (error) {
            setLoading(false);
            console.log(error);
        }
    };

    useEffect(() => {
        getUserData();
    }, []);
    const formatDate = (timestamp: Date) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString(); // Adjust format as needed
    };

    return (
        <div>
            {loading ? (
                <div className="flex justify-center items-center min-h-screen">
                    <SpinLoading />
                </div>
            ) : (
                <>
                    {user && user.userData.wasteDumped.length > 0 ? (
                        <div className=" mt-5">
                            <h1 className="flex gap-3 text-3xl font-bold  items-center">
                                {" "}
                                <History size={26} />
                                History
                            </h1>

                            <div className="grid grid-cols-1 gap-3 mt-5">
                                {user.userData.wasteDumped
                                    .slice()
                                    .reverse()
                                    .map((waste: any, index: number) => (
                                        <div key={index} className="bg-white/90 p-5 rounded-lg shadow-lg">
                                            <div className="flex justify-center">
                                                {/* Render the image from the waste object */}
                                                <img
                                                    src={waste} // Assuming the image URL is stored in the 'imageUrl' property
                                                    alt={`Waste Image ${index}`}
                                                    className="max-w-full h-auto rounded-lg"
                                                />
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    ) : (
                        <h1>No Waste Dumped</h1>
                    )}
                </>
            )}
        </div>
    );
};

export default Page;

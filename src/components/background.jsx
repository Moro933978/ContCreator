import React from "react";

const MainBackground = ({ children }) => {
    return (
        <div className="relative w-full text-white bg-[#030512] flex flex-col justify-start">

            <div
                className="fixed inset-0 z-0 bg-center bg-no-repeat bg-cover"
                style={{
                    backgroundImage: `url('/64d6c1ac-93d1-49f9-a7c5-6b6d37f45819.png')`,
                }}
            />

            <div
                className="fixed inset-0 opacity-[0.12] pointer-events-none z-0"
                style={{
                    backgroundImage: `
                        linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
                    `,
                    backgroundSize: "24px 24px",
                }}
            />

            <div className="relative z-10 grow w-full">
                {children}
            </div>

        </div>
    );
};

export default MainBackground;
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import {
    Calendar,
    PenTool,
    TrendingUp,
    Lightbulb,
    FileText,
} from "lucide-react";
import { db } from "../firebase";

const Features = () => {
    const navigate = useNavigate();
    const [rocketFlying, setRocketFlying] = useState(false);

    const backgroundImage = "/FNext.png";
    const rocketImage = "/Rocket.png";

    useEffect(() => {
        const verifyUserAccess = async () => {
            const userId = localStorage.getItem("userFirebaseId");

            if (!userId) {
                navigate("/Features", { replace: true });
                return;
            }

            try {
                const docRef = doc(db, "test", userId);
                const docSnap = await getDoc(docRef);

                if (!docSnap.exists()) {
                    localStorage.removeItem("userFirebaseId");
                    navigate("/Features", { replace: true });
                }
            } catch (error) {
                console.error("خطأ في التحقق من البيانات:", error);
                navigate("/Features", { replace: true });
            }
        };

        verifyUserAccess();
    }, [navigate]);

    const handleRocketClick = () => {
        if (rocketFlying) return;

        setRocketFlying(true);

        window.setTimeout(() => {
            setRocketFlying(false);
        }, 1500);
    };

    return (
        <div className="features-page">
            {/* Background */}
            <div
                className="features-background"
                style={{ backgroundImage: `url(${backgroundImage})` }}
            />

            {/* Lighter black overlay */}
            <div className="black-overlay" />

            {/* Purple atmosphere */}
            <div className="center-atmosphere" />
            <div className="center-atmosphere-small" />

            {/* Glowing particles */}
            <div className="particles" aria-hidden="true">
                {Array.from({ length: 42 }).map((_, index) => (
                    <span
                        key={index}
                        className={`particle particle-${index + 1}`}
                    />
                ))}
            </div>

            <main className="features-main">
                {/* OVAL ORBITS */}
                <div className="orbit orbit-outer" />
                <div className="orbit orbit-middle" />
                <div className="orbit orbit-inner" />

                {/* CENTRAL CIRCLE */}
                <div
                    className={`central-wrapper ${
                        rocketFlying ? "rocket-is-flying" : ""
                    }`}
                >
                    <div className="central-circle">
                        <div className="central-ring central-ring-1" />
                        <div className="central-ring central-ring-2" />
                        <div className="central-reflection" />

                        <div className="central-text">
                            <span>Start Your</span>
                            <strong>Journey</strong>
                        </div>

                        <button
                            type="button"
                            className={`rocket-container ${
                                rocketFlying ? "rocket-flying" : ""
                            }`}
                            onClick={handleRocketClick}
                            aria-label="Launch rocket"
                        >
                            <div className="rocket-aura" />

                            <img
                                src={rocketImage}
                                alt="Rocket"
                                className="rocket-image"
                            />
                        </button>
                    </div>
                </div>

                {/* FIVE FEATURES ONLY */}
            <div className="planet planet-1">
                <FeatureNode
                    className="feature-planner"
                    icon={<Calendar />}
                    title="Content Planner"
                    desc="Plan, organize & schedule content"
                    onClick={() => navigate("/ContentPlaner")}
                />
            </ div>

            <div className="planet planet-2">
                <FeatureNode
                    className="feature-story"
                    icon={<PenTool />}
                    title="Story Generator"
                    desc="Create engaging stories instantly"
                    onClick={() => navigate("/PostEditor")}
                />
            </div>

            <div className="planet planet-3">
                <FeatureNode
                    className="feature-viral"
                        icon={
                        <>
                            <span className="viral-fire">🔥</span>
                            <TrendingUp />
                        </>
                        }                    
                        color="blue"
                        title="Viral Meter"
                    desc="Measure viral potential"
                    onClick={() => navigate("/ViralMeter")}
                />
            </div >
        
            <div className="planet planet-4">
                <FeatureNode
                    className="feature-idea"
                    icon={<Lightbulb />}
                    color="yellow"
                    title="Idea Generator"
                    desc="Endless creative ideas for you"
                    onClick={() => navigate("/IdeaGenerator")}
                />
            </div>

            <div className="planet planet-5">
                <FeatureNode
                    className="feature-content"
                    icon={<FileText />}
                    color="pink"
                    title="Content Generator"
                    desc="AI-powered content in seconds"
                    onClick={() => navigate("/ContentGenerator")}
                />
            </div>

                {/* SOCIAL SATELLITES */}

                <SocialNode
                    className="social-tiktok"
                    image="/TikTok.png"
                    alt="TikTok"
                    rotate="-8deg"
                />

                <SocialNode
                    className="social-youtube"
                    image="/Youtube.png"
                    alt="YouTube"
                    rotate="8deg"
                />

                <SocialNode
                    className="social-x"
                    image="/X.png"
                    alt="X"
                    rotate="-10deg"
                />

                <SocialNode
                    className="social-facebook"
                    image="/Facebook.png"
                    alt="Facebook"
                    rotate="10deg"
                />

                <SocialNode
                    className="social-instagram"
                    image="/Instegram.png"
                    alt="Instagram"
                    rotate="-7deg"
                />

                <SocialNode
                    className="social-linkedin"
                    image="/Lkin.png"
                    alt="LinkedIn"
                    rotate="7deg"
                />
            </main>

            <style>{`
                * {
                    box-sizing: border-box;
                }

                :root {
                    --page-bg: #03000d;

                    --outer-orbit-width: 1240px;
                    --outer-orbit-height: 670px;

                    --middle-orbit-width: 980px;
                    --middle-orbit-height: 520px;

                    --inner-orbit-width: 740px;
                    --inner-orbit-height: 390px;
                }

                html,
                body,
                #root {
                    width: 100%;
                    min-height: 100%;
                    margin: 0;
                    overflow: none;
                }

                .features-page {
                    position: relative;
                    width: 100%;
                    min-height: 100vh;
                    overflow: hidden;

                    display: flex;
                    align-items: center;
                    padding-top:  50px; 
                    

                    background: var(--page-bg);
                    color: #fff;

                    font-family:
                        Inter,
                        ui-sans-serif,
                        system-ui,
                        -apple-system,
                        BlinkMacSystemFont,
                        "Segoe UI",
                        sans-serif;
                }

                /* ==============================
                   BACKGROUND
                ============================== */

                .features-background {
                    position: absolute;
                    inset: 0;
                    z-index: 0;

                    background-size: cover;
                    background-position: center center;
                    background-repeat: no-repeat;      
                }

                /* Slightly lighter than before */
                .black-overlay {
                    position: absolute;
                    inset: 0;
                    z-index: 1;

                    pointer-events: none;

                    background:
                        radial-gradient(
                            ellipse at 50% 45%,
                            rgba(48, 4, 90, 0.06) 0%,
                            rgba(0, 0, 0, 0.13) 42%,
                            rgba(0, 0, 0, 0.64) 100%
                        ),
                        linear-gradient(
                            180deg,
                            rgba(0, 0, 0, 0.42) 0%,
                            rgba(4, 0, 15, 0.27) 45%,
                            rgba(1, 0, 8, 0.63) 100%
                        );
                }

                /* ==============================
                   ATMOSPHERE
                ============================== */

                .center-atmosphere {
                    position: absolute;
                    z-index: 2;

                    width: 900px;
                    height: 620px;

                    left: 50%;
                    top: 52%;

                    transform: translate(-50%, -50%);

                    border-radius: 50%;

                    background:
                        radial-gradient(
                            ellipse,
                            rgba(126, 34, 206, 0.23) 0%,
                            rgba(109, 40, 217, 0.12) 34%,
                            rgba(67, 20, 120, 0.06) 55%,
                            transparent 74%
                        );

                    filter: blur(30px);
                    pointer-events: none;
                }

                .center-atmosphere-small {
                    position: absolute;
                    z-index: 2;

                    width: 430px;
                    height: 430px;

                    left: 50%;
                    top: 52%;

                    transform: translate(-50%, -50%);

                    border-radius: 50%;

                    background:
                        radial-gradient(
                            circle,
                            rgba(217, 70, 239, 0.16),
                            rgba(99, 102, 241, 0.07) 40%,
                            transparent 70%
                        );

                    filter: blur(40px);
                    pointer-events: none;
                }

                /* ==============================
                   GLOWING PARTICLES
                ============================== */

                .particles {
                    position: absolute;
                    inset: 0;
                    z-index: 4;

                    pointer-events: none;
                    overflow: hidden;
                }

                .particle {
                    position: absolute;

                    left: 0;
                    top: 0;

                    width: 3px;
                    height: 3px;

                    border-radius: 50%;

                    background: #b56cff;

                    box-shadow:
                        0 0 5px rgba(168, 85, 247, 1),
                        0 0 14px rgba(168, 85, 247, .85),
                        0 0 28px rgba(147, 51, 234, .50);

                    animation:
                        particlePulse 2.8s ease-in-out infinite;
                }

                .particle:nth-child(3n) {
                    width: 2px;
                    height: 2px;
                }

                .particle:nth-child(5n) {
                    width: 4px;
                    height: 4px;
                }

                /* ==============================
                   ORBITING STARS
                ============================== */

                .particle-1,
                .particle-2,
                .particle-3,
                .particle-4,
                .particle-5,
                .particle-6,
                .particle-7,
                .particle-8 {
                    left: 50%;
                    top: 50%;

                    offset-path: ellipse(
                        calc(var(--outer-orbit-width) / 2)
                        calc(var(--outer-orbit-height) / 2)
                        at 50% 50%
                    );

                    offset-rotate: 0deg;

                    animation-name: orbitOuterTravel, particlePulse;
                    animation-duration: 22s, 2.8s;
                    animation-timing-function: linear, ease-in-out;
                    animation-iteration-count: infinite, infinite;
                }

                .particle-1 {
                    animation-delay: 0s, -.2s;
                }

                .particle-2 {
                    animation-delay: -2.7s, -1.1s;
                }

                .particle-3 {
                    animation-delay: -5.4s, -1.8s;
                }

                .particle-4 {
                    animation-delay: -8.1s, -.7s;
                }

                .particle-5 {
                    animation-delay: -10.8s, -2.2s;
                }

                .particle-6 {
                    animation-delay: -13.5s, -1.4s;
                }

                .particle-7 {
                    animation-delay: -16.2s, -.5s;
                }

                .particle-8 {
                    animation-delay: -18.9s, -2.5s;
                }

                .particle-9,
                .particle-10,
                .particle-11,
                .particle-12,
                .particle-13,
                .particle-14,
                .particle-15,
                .particle-16 {
                    left: 50%;
                    top: 50%;

                    offset-path: ellipse(
                        calc(var(--middle-orbit-width) / 2)
                        calc(var(--middle-orbit-height) / 2)
                        at 50% 50%
                    );

                    offset-rotate: 0deg;

                    animation-name: orbitMiddleTravel, particlePulse;
                    animation-duration: 18s, 2.65s;
                    animation-timing-function: linear, ease-in-out;
                    animation-iteration-count: infinite, infinite;
                }

                .particle-9 {
                    animation-delay: 0s, -1.2s;
                }

                .particle-10 {
                    animation-delay: -2.25s, -.9s;
                }

                .particle-11 {
                    animation-delay: -4.5s, -2.1s;
                }

                .particle-12 {
                    animation-delay: -6.75s, -.2s;
                }

                .particle-13 {
                    animation-delay: -9s, -1.6s;
                }

                .particle-14 {
                    animation-delay: -11.25s, -2.4s;
                }

                .particle-15 {
                    animation-delay: -13.5s, -.8s;
                }

                .particle-16 {
                    animation-delay: -15.75s, -1.9s;
                }

                .particle-17,
                .particle-18,
                .particle-19,
                .particle-20,
                .particle-21,
                .particle-22,
                .particle-23,
                .particle-24 {
                    left: 50%;
                    top: 50%;

                    offset-path: ellipse(
                        calc(var(--inner-orbit-width) / 2)
                        calc(var(--inner-orbit-height) / 2)
                        at 50% 50%
                    );

                    offset-rotate: 0deg;

                    animation-name: orbitInnerTravel, particlePulse;
                    animation-duration: 14s, 2.45s;
                    animation-timing-function: linear, ease-in-out;
                    animation-iteration-count: infinite, infinite;
                }

                .particle-17 {
                    animation-delay: 0s, -.4s;
                }

                .particle-18 {
                    animation-delay: -1.75s, -2.6s;
                }

                .particle-19 {
                    animation-delay: -3.5s, -1.3s;
                }

                .particle-20 {
                    animation-delay: -5.25s, -.6s;
                }

                .particle-21 {
                    animation-delay: -7s, -2s;
                }

                .particle-22 {
                    animation-delay: -8.75s, -1s;
                }

                .particle-23 {
                    animation-delay: -10.5s, -2.7s;
                }

                .particle-24 {
                    animation-delay: -12.25s, -.1s;
                }

                /* ==============================
                   AMBIENT STARS
                ============================== */

                .particle-25 {
                    left: 57%;
                    top: 76%;
                    animation-delay: -1.7s;
                }

                .particle-26 {
                    left: 51%;
                    top: 88%;
                    animation-delay: -.9s;
                }

                .particle-27 {
                    left: 45%;
                    top: 80%;
                    animation-delay: -2.3s;
                }

                .particle-28 {
                    left: 39%;
                    top: 89%;
                    animation-delay: -1.5s;
                }

                .particle-29 {
                    left: 33%;
                    top: 75%;
                    animation-delay: -.3s;
                }

                .particle-30 {
                    left: 27%;
                    top: 83%;
                    animation-delay: -2.5s;
                }

                .particle-31 {
                    left: 21%;
                    top: 70%;
                    animation-delay: -1.2s;
                }

                .particle-32 {
                    left: 15%;
                    top: 78%;
                    animation-delay: -.7s;
                }

                .particle-33 {
                    left: 9%;
                    top: 64%;
                    animation-delay: -1.8s;
                }

                .particle-34 {
                    left: 18%;
                    top: 55%;
                    animation-delay: -2.2s;
                }

                .particle-35 {
                    left: 28%;
                    top: 48%;
                    animation-delay: -.4s;
                }

                .particle-36 {
                    left: 38%;
                    top: 57%;
                    animation-delay: -1.1s;
                }

                .particle-37 {
                    left: 62%;
                    top: 54%;
                    animation-delay: -2s;
                }

                .particle-38 {
                    left: 72%;
                    top: 48%;
                    animation-delay: -.6s;
                }

                .particle-39 {
                    left: 80%;
                    top: 55%;
                    animation-delay: -1.4s;
                }

                .particle-40 {
                    left: 73%;
                    top: 40%;
                    animation-delay: -2.8s;
                }

                .particle-41 {
                    left: 25%;
                    top: 60%;
                    animation-delay: -.8s;
                }

                .particle-42 {
                    left: 57%;
                    top: 36%;
                    animation-delay: -1.9s;
                }

                @keyframes particlePulse {
                    0%,
                    100% {
                        opacity: .20;
                        transform: scale(.68);
                    }

                    50% {
                        opacity: 1;
                        transform: scale(1.75);
                    }
                }

                @keyframes orbitOuterTravel {
                    from {
                        offset-distance: 0%;
                    }

                    to {
                        offset-distance: 100%;
                    }
                }

                @keyframes orbitMiddleTravel {
                    from {
                        offset-distance: 0%;
                    }

                    to {
                        offset-distance: 100%;
                    }
                }

                @keyframes orbitInnerTravel {
                    from {
                        offset-distance: 0%;
                    }

                    to {
                        offset-distance: 100%;
                    }
                }

                /* ==============================
                   MAIN CANVAS
                ============================== */

                .features-main {
                    position: relative;
                    z-index: 10;

                    width: min(1500px, 100%);
                    height: 900px;

                    margin: 0 auto;
                }

                /* ==============================
                   OVAL ORBITS
                ============================== */

                .orbit {
                    position: absolute;

                    left: 50%;
                    top: 50%;

                    transform: translate(-50%, -50%);

                    border-radius: 50%;

                    pointer-events: none;

                    background: transparent;
                }

                .orbit-outer {
                    width: var(--outer-orbit-width);
                    height: var(--outer-orbit-height);

                    border: 1px dashed rgba(168, 85, 247, .40);

                    box-shadow:
                        0 0 20px rgba(147, 51, 234, .07),
                        0 0 45px rgba(147, 51, 234, .04),
                        inset 0 0 24px rgba(147, 51, 234, .025);
                }

                .orbit-middle {
                    width: var(--middle-orbit-width);
                    height: var(--middle-orbit-height);

                    border: 1px dashed rgba(168, 85, 247, .32);

                    box-shadow:
                        0 0 18px rgba(147, 51, 234, .055),
                        inset 0 0 20px rgba(147, 51, 234, .025);
                }

                .orbit-inner {
                    width: var(--inner-orbit-width);
                    height: var(--inner-orbit-height);

                    border: 1px dashed rgba(168, 85, 247, .24);

                    box-shadow:
                        0 0 16px rgba(147, 51, 234, .045);
                }

                /* ==============================
                   CENTER
                ============================== */

                .central-wrapper {
                    position: absolute;

                    left: 50%;
                    top: 50%;

                    width: 345px;
                    height: 345px;

                    transform: translate(-50%, -50%);

                    z-index: 30;
                }

                .central-wrapper::before {
                    content: "";

                    position: absolute;
                    inset: 0;

                    border-radius: 50%;

                    background:
                        conic-gradient(
                            from 205deg,
                            #7136ff,
                            #e040fb,
                            #a855f7,
                            #38bdf8,
                            #7136ff
                        );

                    box-shadow:
                        0 0 32px rgba(168, 85, 247, .78),
                        0 0 72px rgba(99, 102, 241, .32),
                        0 0 120px rgba(147, 51, 234, .15);

                    animation: centerPulse 4s ease-in-out infinite;
                }

                .central-circle {
                    position: absolute;
                    inset: 5px;

                    border-radius: 50%;
                    overflow: hidden;

                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;

                    background:
                        radial-gradient(
                            circle at 50% 25%,
                            rgba(91, 35, 140, .40),
                            rgba(12, 3, 24, .97) 52%,
                            #020108 100%
                        );

                    border: 1px solid rgba(255,255,255,.13);

                    box-shadow:
                        inset 0 0 70px rgba(147,51,234,.44),
                        inset 0 -35px 70px rgba(0,0,0,.72);
                }

                .central-ring {
                    position: absolute;
                    border-radius: 50%;
                    pointer-events: none;
                }

                .central-ring-1 {
                    inset: 9px;
                    border: 1px solid rgba(255,255,255,.11);
                }

                .central-ring-2 {
                    inset: 17px;
                    border: 1px solid rgba(168,85,247,.15);
                }

                .central-reflection {
                    position: absolute;

                    top: -15%;
                    left: 8%;

                    width: 84%;
                    height: 42%;

                    border-radius: 50%;

                    background: rgba(255,255,255,.10);

                    filter: blur(32px);

                    pointer-events: none;
                }

                .central-text {
                    position: relative;
                    z-index: 10;

                    display: flex;
                    flex-direction: column;
                    align-items: center;

                    text-align: center;

                    pointer-events: none;
                }

                .central-text span {
                    font-size: 35px;
                    line-height: 1;
                    font-weight: 500;

                    color: #e5e7eb;

                    letter-spacing: -.02em;
                }

                .central-text strong {
                    margin-top: 10px;

                    font-size: 58px;
                    line-height: .92;
                    font-weight: 800;

                    letter-spacing: -.055em;

                    background:
                        linear-gradient(
                            90deg,
                            #ffffff 0%,
                            #e9d5ff 48%,
                            #bfdbfe 100%
                        );

                    -webkit-background-clip: text;
                    background-clip: text;

                    color: transparent;
                }

                /* ==============================
                   ROCKET
                ============================== */

                .rocket-container {
                    position: relative;
                    z-index: 20;

                    width: 86px;
                    height: 86px;

                    margin-top: 24px;
                    padding: 0;

                    border: 1px solid rgba(255,255,255,.16);
                    border-radius: 50%;

                    display: flex;
                    align-items: center;
                    justify-content: center;

                    background:
                        radial-gradient(
                            circle at 35% 25%,
                            rgba(255,255,255,.10),
                            rgba(168,85,247,.08) 38%,
                            rgba(3,1,10,.15) 72%
                        );

                    box-shadow:
                        inset 0 1px 0 rgba(255,255,255,.12),
                        0 0 24px rgba(56,189,248,.10),
                        0 0 42px rgba(168,85,247,.14);

                    cursor: pointer;

                    animation: rocketIdle 3s ease-in-out infinite;
                }

                .rocket-container::before {
                    content: "";

                    position: absolute;
                    inset: 5px;

                    border-radius: 50%;

                    border: 1px solid rgba(255,255,255,.08);

                    pointer-events: none;
                }

                .rocket-container:hover {
                    background:
                        radial-gradient(
                            circle,
                            rgba(168,85,247,.16),
                            rgba(255,255,255,.06) 55%,
                            rgba(3,1,10,.10)
                        );

                    box-shadow:
                        inset 0 1px 0 rgba(255,255,255,.14),
                        0 0 32px rgba(56,189,248,.18),
                        0 0 58px rgba(168,85,247,.28);
                }

                .rocket-aura {
                    position: absolute;
                    inset: -16px;

                    border-radius: 50%;

                    background:
                        radial-gradient(
                            circle,
                            rgba(56,189,248,.34),
                            rgba(168,85,247,.24) 36%,
                            rgba(168,85,247,.08) 56%,
                            transparent 72%
                        );

                    filter: blur(8px);

                    animation: rocketAura 2.5s ease-in-out infinite;

                    pointer-events: none;
                }

                .rocket-image {
                    position: relative;
                    z-index: 5;

                    width: 70px;
                    height: 70px;

                    object-fit: contain;

                    pointer-events: none;
                    user-select: none;

                    opacity: 1;

                    filter:
                        brightness(1.24)
                        saturate(1.25)
                        contrast(1.08)
                        drop-shadow(0 0 7px rgba(255,255,255,.44))
                        drop-shadow(0 0 12px rgba(56,189,248,1))
                        drop-shadow(0 0 24px rgba(168,85,247,.88))
                        drop-shadow(0 0 36px rgba(168,85,247,.42));
                }

                .rocket-flying {
                    animation:
                        rocketLaunch 1.5s cubic-bezier(.22,.61,.36,1)
                        forwards !important;
                }

                .rocket-flying .rocket-image {
                    animation: rocketSpin 1.5s ease-in-out forwards;
                }

                .rocket-flying .rocket-aura {
                    animation: rocketLaunchGlow 1.5s ease-out forwards;
                }

                /* ==============================
                   FEATURE NODES
                ============================== */

                .feature-node {
                    position: absolute;

                    width: 235px;

                    z-index: 25;

                    display: flex;
                    flex-direction: column;
                    align-items: center;

                    text-align: center;

                    cursor: pointer;
                    user-select: none;

                    transform: translate(-50%, -50%);
                }

                .feature-planner {
                    left: 50%;
                    top: 18%;
                }

                .feature-story {
                    left: 74%;
                    top: 34%;
                }

                .feature-viral {
                    left: 69%;
                    top: 67%;
                }

                .feature-idea {
                    left: 31%;
                    top: 67%;
                }

                .feature-content {
                    left: 26%;
                    top: 34%;
                }

                /* ==============================
                   FEATURE ICON
                ============================== */

                .feature-icon-wrapper {
                    position: relative;

                    width: 82px;
                    height: 82px;

                    min-width: 82px;
                    min-height: 82px;

                    border-radius: 50%;

                    display: flex;
                    align-items: center;
                    justify-content: center;

                    background:
                        radial-gradient(
                            circle at 35% 25%,
                            rgba(168,85,247,.34),
                            rgba(14,4,31,.97) 58%,
                            #03010b 100%
                        );

                    border: 1px solid rgba(196,181,253,.34);

                    box-shadow:
                        0 0 25px rgba(147,51,234,.36),
                        0 0 50px rgba(147,51,234,.10),
                        inset 0 0 28px rgba(147,51,234,.25);

                    transition:
                        transform .45s cubic-bezier(.16,1,.3,1),
                        border-color .4s ease,
                        box-shadow .4s ease;
                }

                .feature-icon-wrapper::before {
                    content: "";

                    position: absolute;
                    inset: 6px;

                    border-radius: 50%;

                    border: 1px solid rgba(255,255,255,.12);
                }

                .feature-icon-wrapper::after {
                    content: "";

                    position: absolute;
                    inset: 13px;

                    border-radius: 50%;

                    border: 1px solid rgba(168,85,247,.13);
                }

                .feature-node:hover .feature-icon-wrapper {
                    transform: scale(1.10);

                    border-color: rgba(216,180,254,.75);

                    box-shadow:
                        0 0 38px rgba(168,85,247,.70),
                        0 0 80px rgba(147,51,234,.22),
                        inset 0 0 32px rgba(147,51,234,.32);
                }

                .feature-icon-wrapper svg {
                    position: relative;
                    z-index: 5;

                    width: 34px;
                    height: 34px;

                    stroke-width: 1.8;

                    color: #c084fc;

                    filter:
                        drop-shadow(0 0 9px rgba(192,132,252,.80));

                    transition: transform .45s ease;
                }

                .feature-node:hover .feature-icon-wrapper svg {
                    transform: scale(1.08) rotate(4deg);
                }

                .feature-viral .feature-icon-wrapper svg {
                    color: #60a5fa;
                    filter: drop-shadow(0 0 9px rgba(96,165,250,.8));
                }

                .feature-idea .feature-icon-wrapper svg {
                    color: #fbbf24;
                    filter: drop-shadow(0 0 9px rgba(251,191,36,.7));
                }

                .feature-content .feature-icon-wrapper svg {
                    color: #f472b6;
                    filter: drop-shadow(0 0 9px rgba(244,114,182,.78));
                }
                
                .feature-title {
                    margin: 12px 0 0;

                    font-size: 16px;
                    line-height: 1.2;
                    font-weight: 650;

                    color: #f1f5f9;

                    letter-spacing: -.01em;
                }

                .feature-description {
                    width: 210px;

                    margin: 5px 0 0;

                    font-size: 12px;
                    line-height: 1.45;

                    color: #94a3b8;
                }

                .feature-node:hover .feature-description {
                    color: #cbd5e1;
                }

                /* ==============================
                SOCIAL NODE
                DARK PURPLE GLASS - TIKTOK STYLE
                ============================== */

                .social-node {
                    position: absolute;

                    width: 72px;
                    height: 72px;

                    z-index: 24;

                    display: flex;
                    align-items: center;
                    justify-content: center;

                    border-radius: 17px;

                    overflow: hidden;
                    isolation: isolate;

                    /* Dark purple glass */
                    background:
                        linear-gradient(
                            145deg,
                            rgba(30, 12, 52, 0.88) 0%,
                            rgba(20, 8, 39, 0.94) 48%,
                            rgba(7, 3, 18, 0.98) 100%
                        );

                    /* Thin purple edge */
                    border: 1px solid rgba(134, 67, 220, 0.32);

                    backdrop-filter: blur(10px);
                    -webkit-backdrop-filter: blur(10px);

                    /* Soft depth */
                    box-shadow:
                        inset 0 1px 0 rgba(255, 255, 255, 0.06),
                        inset 0 0 14px rgba(116, 47, 190, 0.08),
                        0 6px 18px rgba(0, 0, 0, 0.45),
                        0 0 16px rgba(91, 33, 182, 0.10);

                    transform:
                        translate(-50%, -50%)
                        rotate(var(--card-rotation))
                        rotateX(4deg)
                        rotateY(-4deg);

                    transition:
                        transform 0.45s cubic-bezier(.16,1,.3,1),
                        border-color 0.35s ease,
                        box-shadow 0.35s ease,
                        background 0.35s ease;
                }


                /* ==============================
                INNER BORDER
                ============================== */

                .social-node::before {
                    content: "";

                    position: absolute;
                    inset: 4px;

                    border-radius: 13px;

                    border: 1px solid rgba(173, 108, 255, 0.08);

                    box-shadow:
                        inset 0 0 10px rgba(130, 55, 210, 0.07),
                        inset 0 1px 0 rgba(255, 255, 255, 0.035);

                    pointer-events: none;

                    z-index: 1;
                }


                /* ==============================
                SOFT GLASS HIGHLIGHT
                ============================== */

                .social-node::after {
                    content: "";

                    position: absolute;

                    width: 75%;
                    height: 38%;

                    left: 7%;
                    top: -12%;

                    border-radius: 50%;

                    background:
                        linear-gradient(
                            115deg,
                            rgba(255,255,255,0.10),
                            rgba(255,255,255,0.025) 55%,
                            transparent 80%
                        );

                    filter: blur(7px);

                    transform: rotate(-10deg);

                    pointer-events: none;

                    z-index: 2;
                }


                /* ==============================
                HOVER
                ============================== */

                .social-node:hover {
                    transform:
                        translate(-50%, -50%)
                        rotate(var(--card-rotation))
                        rotateX(-4deg)
                        rotateY(7deg)
                        translateY(-5px)
                        scale(1.07);

                    background:
                        linear-gradient(
                            145deg,
                            rgba(42, 17, 70, 0.94) 0%,
                            rgba(27, 10, 48, 0.96) 50%,
                            rgba(8, 3, 20, 0.98) 100%
                        );

                    border-color: rgba(168, 91, 255, 0.48);

                    box-shadow:
                        inset 0 1px 0 rgba(255,255,255,0.08),
                        inset 0 0 16px rgba(168,85,247,0.10),
                        0 10px 25px rgba(0,0,0,0.50),
                        0 0 24px rgba(126, 34, 206, 0.20),
                        0 0 40px rgba(126, 34, 206, 0.07);
                }


                /* ==============================
                SOCIAL IMAGE
                ============================== */

                .social-image {
                    position: relative;
                    z-index: 10;

                    width: 100%;
                    height: 100%;

                    object-fit: contain;

                    filter:
                        drop-shadow(0 0 5px rgba(255,255,255,0.16))
                        drop-shadow(0 0 8px rgba(168,85,247,0.10));

                    transition:
                        transform 0.4s cubic-bezier(.16,1,.3,1),
                        filter 0.4s ease;
                }


                .social-node:hover .social-image {
                    transform: scale(1.08);

                    filter:
                        drop-shadow(0 0 7px rgba(255,255,255,0.24))
                        drop-shadow(0 0 12px rgba(168,85,247,0.20));
                }


                /* ==============================
                SOCIAL POSITIONS
                ============================== */

                .social-tiktok {
                    left: 12%;
                    top: 28%;
                }

                .social-youtube {
                    left: 88%;
                    top: 28%;
                }

                .social-x {
                    left: 7%;
                    top: 54%;
                }

                .social-facebook {
                    left: 93%;
                    top: 54%;
                }

                .social-instagram {
                    left: 12%;
                    top: 79%;
                }

                .social-linkedin {
                    left: 88%;
                    top: 79%;
                }

                /* ==============================
                   ANIMATIONS
                ============================== */

                @keyframes centerPulse {
                    0%,
                    100% {
                        filter: brightness(.95);
                    }

                    50% {
                        filter: brightness(1.13);
                    }
                }

                @keyframes rocketIdle {
                    0%,
                    100% {
                        transform: translateY(0) rotate(-3deg);
                    }

                    50% {
                        transform: translateY(-8px) rotate(3deg);
                    }
                }

                @keyframes rocketAura {
                    0%,
                    100% {
                        opacity: .45;
                        transform: scale(.88);
                    }

                    50% {
                        opacity: 1;
                        transform: scale(1.12);
                    }
                }

                @keyframes rocketLaunch {
                    0% {
                        transform: translate(0,0) scale(1) rotate(-3deg);
                        opacity: 1;
                    }

                    18% {
                        transform: translate(3px,-15px) scale(1.05) rotate(0deg);
                        opacity: 1;
                    }

                    55% {
                        transform: translate(65px,-115px) scale(.88) rotate(15deg);
                        opacity: .95;
                    }

                    100% {
                        transform: translate(190px,-300px) scale(.45) rotate(30deg);
                        opacity: 0;
                    }
                }

                @keyframes rocketSpin {
                    0% {
                        transform: rotate(0deg);
                    }

                    50% {
                        transform: rotate(12deg);
                    }

                    100% {
                        transform: rotate(25deg);
                    }
                }

                @keyframes rocketLaunchGlow {
                    0% {
                        opacity: .8;
                        transform: scale(1);
                    }

                    50% {
                        opacity: 1;
                        transform: scale(1.6);
                    }

                    100% {
                        opacity: 0;
                        transform: scale(2.5);
                    }
                }

                /* ==============================
                   TABLET
                ============================== */

                @media (max-width: 1050px) {
                    :root {
                        --outer-orbit-width: 940px;
                        --outer-orbit-height: 540px;

                        --middle-orbit-width: 750px;
                        --middle-orbit-height: 430px;

                        --inner-orbit-width: 585px;
                        --inner-orbit-height: 330px;
                    }

                    .features-main {
                        height: 820px;
                    }

                    .central-wrapper {
                        width: 310px;
                        height: 310px;
                    }

                    .central-text span {
                        font-size: 31px;
                    }

                    .central-text strong {
                        font-size: 51px;
                    }

                    .feature-node {
                        width: 190px;
                    }

                    .feature-icon-wrapper {
                        width: 72px;
                        height: 72px;

                        min-width: 72px;
                        min-height: 72px;
                    }

                    .feature-icon-wrapper svg {
                        width: 30px;
                        height: 30px;
                    }

                    .feature-title {
                        font-size: 14px;
                    }

                    .feature-description {
                        width: 175px;
                        font-size: 11px;
                    }

                    .social-node {
                        width: 64px;
                        height: 64px;
                        border-radius: 16px;
                    }

                    .rocket-container {
                        width: 78px;
                        height: 78px;
                    }

                    .rocket-image {
                        width: 64px;
                        height: 64px;
                    }
                }

                /* ==============================
                   MOBILE
                ============================== */

                @media (max-width: 700px) {
                    :root {
                        --outer-orbit-width: 640px;
                        --outer-orbit-height: 510px;

                        --middle-orbit-width: 510px;
                        --middle-orbit-height: 400px;

                        --inner-orbit-width: 390px;
                        --inner-orbit-height: 300px;
                    }

                    .features-page {
                        min-height: 100svh;

                        overflow-x: hidden;
                        overflow-y: auto;
                    }

                    .features-background {
                        background-position: center center;
                    }

                    .features-main {
                        width: 100%;

                        height: 760px;
                        min-height: 760px;
                    }

                    .center-atmosphere {
                        width: 620px;
                        height: 500px;

                        top: 47%;
                    }

                    .center-atmosphere-small {
                        width: 300px;
                        height: 300px;

                        top: 47%;
                    }

                    .orbit-outer,
                    .orbit-middle,
                    .orbit-inner {
                        top: 47%;
                    }

                    .central-wrapper {
                        width: 215px;
                        height: 215px;

                        top: 47%;
                    }

                    .central-text span {
                        font-size: 20px;
                    }

                    .central-text strong {
                        margin-top: 7px;
                        font-size: 34px;
                    }

                    .rocket-container {
                        width: 60px;
                        height: 60px;

                        margin-top: 16px;
                    }

                    .rocket-image {
                        width: 48px;
                        height: 48px;

                        filter:
                            brightness(1.25)
                            saturate(1.25)
                            contrast(1.08)
                            drop-shadow(0 0 6px rgba(255,255,255,.40))
                            drop-shadow(0 0 11px rgba(56,189,248,1))
                            drop-shadow(0 0 20px rgba(168,85,247,.88));
                    }

                    /* ==============================
                       MOBILE FEATURES
                    ============================== */

                    .feature-node {
                        width: 125px;
                    }

                    .feature-icon-wrapper {
                        width: 56px;
                        height: 56px;

                        min-width: 56px;
                        min-height: 56px;
                    }

                    .feature-icon-wrapper svg {
                        width: 24px;
                        height: 24px;
                    }

                    .feature-title {
                        margin-top: 8px;
                        font-size: 10px;
                    }

                    .feature-description {
                        width: 120px;

                        margin-top: 3px;

                        font-size: 8px;
                        line-height: 1.35;
                    }

                    .feature-planner {
                        left: 50%;
                        top: 13%;
                    }

                    .feature-content {
                        left: 20%;
                        top: 31%;
                    }

                    .feature-story {
                        left: 80%;
                        top: 31%;
                    }

                    .feature-idea {
                        left: 25%;
                        top: 68%;
                    }

                    .feature-viral {
                        left: 75%;
                        top: 68%;
                    }

                    /* ==============================
                       MOBILE SOCIAL GLASS CARDS
                    ============================== */

                    .social-node {
                        width: 48px;
                        height: 48px;

                        border-radius: 13px;

                        /*
                         * Same visual style as desktop,
                         * slightly tighter for mobile
                         */
                        background:
                            linear-gradient(
                                145deg,
                                rgba(255,255,255,.13) 0%,
                                rgba(255,255,255,.045) 22%,
                                rgba(31,11,55,.58) 55%,
                                rgba(4,1,13,.88) 100%
                            );

                        border-color: rgba(169, 125, 255, .24);

                        backdrop-filter:
                            blur(11px)
                            saturate(120%);

                        -webkit-backdrop-filter:
                            blur(11px)
                            saturate(120%);

                        box-shadow:
                            inset 0 1px 0 rgba(255,255,255,.14),
                            inset 0 0 12px rgba(116,47,190,.10),
                            0 7px 18px rgba(0,0,0,.42),
                            0 0 17px rgba(96,35,180,.10);
                    }

                    .social-node::before {
                        inset: 4px;
                        border-radius: 9px;
                    }

                    .social-node::after {
                        width: 82%;
                        height: 38%;

                        left: 7%;
                        top: -12%;

                        filter: blur(7px);
                    }

                    .social-image {
                        width: 27px;
                        height: 27px;
                    }

                    /* Mobile positions */

                    .social-tiktok {
                        left: 10%;
                        top: 17%;
                    }

                    .social-youtube {
                        left: 90%;
                        top: 17%;
                    }

                    .social-x {
                        left: 5%;
                        top: 48%;
                    }

                    .social-facebook {
                        left: 95%;
                        top: 48%;
                    }

                    .social-instagram {
                        left: 10%;
                        top: 79%;
                    }

                    .social-linkedin {
                        left: 90%;
                        top: 79%;
                    }

                    /*
                     * Keep orbit stars active,
                     * hide only distant ambient stars.
                     */
                    .particle:nth-child(n + 31) {
                        display: none;
                    }
                }

                /* ==============================
                   SMALL MOBILE
                ============================== */

                @media (max-width: 430px) {
                    :root {
                        --outer-orbit-width: 520px;
                        --outer-orbit-height: 430px;

                        --middle-orbit-width: 410px;
                        --middle-orbit-height: 340px;

                        --inner-orbit-width: 320px;
                        --inner-orbit-height: 250px;
                    }

                    .features-main {
                        height: 700px;
                        min-height: 700px;
                    }

                    .central-wrapper {
                        width: 185px;
                        height: 185px;
                    }

                    .central-text span {
                        font-size: 18px;
                    }

                    .central-text strong {
                        font-size: 30px;
                    }

                    .rocket-container {
                        width: 54px;
                        height: 54px;

                        margin-top: 13px;
                    }

                    .rocket-image {
                        width: 42px;
                        height: 42px;
                    }

                    .feature-node {
                        width: 105px;
                    }

                    .feature-icon-wrapper {
                        width: 50px;
                        height: 50px;

                        min-width: 50px;
                        min-height: 50px;
                    }

                    .feature-icon-wrapper svg {
                        width: 21px;
                        height: 21px;
                    }

                    .feature-title {
                        font-size: 9px;
                    }

                    .feature-description {
                        width: 100px;
                        font-size: 7px;
                    }

                    .feature-planner {
                        top: 13%;
                    }

                    .feature-content {
                        left: 19%;
                        top: 31%;
                    }

                    .feature-story {
                        left: 81%;
                        top: 31%;
                    }

                    .feature-idea {
                        left: 23%;
                        top: 68%;
                    }

                    .feature-viral {
                        left: 77%;
                        top: 68%;
                    }

                    /*
                     * Small mobile cards:
                     * compact glass cards, still recognizable
                     */
                    .social-node {
                        width: 42px;
                        height: 42px;

                        border-radius: 11px;

                        background:
                            linear-gradient(
                                145deg,
                                rgba(255,255,255,.12),
                                rgba(255,255,255,.035) 25%,
                                rgba(30,10,54,.60) 56%,
                                rgba(3,1,12,.90)
                            );

                        backdrop-filter:
                            blur(10px)
                            saturate(118%);

                        -webkit-backdrop-filter:
                            blur(10px)
                            saturate(118%);

                        box-shadow:
                            inset 0 1px 0 rgba(255,255,255,.13),
                            inset 0 0 10px rgba(116,47,190,.09),
                            0 6px 15px rgba(0,0,0,.42),
                            0 0 14px rgba(96,35,180,.10);
                    }

                    .social-node::before {
                        inset: 3px;
                        border-radius: 8px;
                    }

                    .social-image {
                        width: 23px;
                        height: 23px;
                    }

                    .particle {
                        box-shadow:
                            0 0 4px rgba(168, 85, 247, 1),
                            0 0 10px rgba(168, 85, 247, .78),
                            0 0 18px rgba(147, 51, 234, .42);
                    }
                }

                /* ==============================
                   VERY SMALL SCREENS
                ============================== */

                @media (max-width: 360px) {
                    .features-main {
                        height: 680px;
                        min-height: 680px;
                    }

                    .social-node {
                        width: 38px;
                        height: 38px;
                        border-radius: 10px;
                    }

                    .social-image {
                        width: 21px;
                        height: 21px;
                    }

                    .social-tiktok {
                        left: 9%;
                    }

                    .social-youtube {
                        left: 91%;
                    }

                    .social-x {
                        left: 4%;
                    }

                    .social-facebook {
                        left: 96%;
                    }

                    .social-instagram {
                        left: 9%;
                    }

                    .social-linkedin {
                        left: 91%;
                    }
                }

                /* ==============================
                   REDUCED MOTION
                ============================== */

                @media (prefers-reduced-motion: reduce) {
                    .rocket-container,
                    .rocket-aura,
                    .central-wrapper::before,
                    .particle,
                    .social-node,
                    .feature-icon-wrapper {
                        animation: none !important;
                        transition: none !important;
                    }

                    * {
                        scroll-behavior: auto !important;
                    }
                }

            .feature-viral {
                left: 69%;
                top: 67%;
                z-index: 20;
            }

            .feature-viral .feature-icon-wrapper {
                background: radial-gradient(
                    circle,
                    #a855f7 0%,
                    #9333ea 45%,
                    #7e22ce 100%
                );

                box-shadow:
                    0 0 20px rgba(168, 85, 247, .9),
                    0 0 45px rgba(168, 85, 247, .8),
                    0 0 90px rgba(147, 51, 234, .7),
                    0 0 160px rgba(126, 34, 206, .5);
            }

            .viral-fire {
                position: absolute;
                top: -18px;
                right: -10px;
                font-size: 24px;
                animation: fireFloat 1.4s ease-in-out infinite;
            }

            @keyframes fireFloat {
                0%,100% { transform: translateY(0); }
                50% { transform: translateY(-6px) scale(1.15); }
            }



        .planet {
            position: absolute;
            left: 50%;
            top: 50%;
            transform-origin: center;
            animation: orbitRotate 30s linear infinite;
        }

        /* توزيعهم على المدار */
        .planet-1 {
            animation-delay: 0s;
        }

        .planet-2 {
            animation-delay: -6s;
        }

        .planet-3 {
            animation-delay: -12s;
        }

        .planet-4 {
            animation-delay: -18s;
        }

        .planet-5 {
            animation-delay: -24s;
        }

        @keyframes orbitRotate {
            from {
                transform: rotate(0deg) translateX(400px) rotate(0deg);
            }

            to {
                transform: rotate(360deg) translateX(400px) rotate(-360deg);
            }
        }

            @media (max-width: 768px) {

            .orbit,
            .social-node,
            .central-wrapper {
                display: none;
            }

            .features-main {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 18px;
                padding: 24px;
            }

            .feature-node {
                position: relative !important;
                left: auto !important;
                top: auto !important;
                width: 100%;
                transform: none !important;
            }

            .planet {
                position: static;
                animation: none;
            }
        }
            `}</style>
        </div>
    );
};

/* =====================================================
   FEATURE NODE
===================================================== */

const FeatureNode = ({
    className = "",
    icon,
    title,
    desc,
    onClick,
}) => {
    return (
        <div
            className={`feature-node ${className}`}
            onClick={onClick}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onClick?.();
                }
            }}
        >
            <div className="feature-icon-wrapper">
                <span
                    style={{
                        position: "absolute",
                        top: "6px",
                        left: "18%",
                        width: "64%",
                        height: "16px",
                        borderRadius: "50%",
                        background: "rgba(255,255,255,.10)",
                        filter: "blur(9px)",
                        pointerEvents: "none",
                    }}
                />

                {icon}
            </div>

            <h3 className="feature-title">
                {title}
            </h3>

            <p className="feature-description">
                {desc}
            </p>
        </div>
    );
};
const SocialNode = ({
    className = "",
    image,
    alt,
    rotate = "0deg",
}) => {
    return (
        <div
            className={`social-node ${className}`}
            style={{ "--card-rotation": rotate }}
            aria-hidden="true"
        >
            <img
                src={image}
                alt={alt}
                className="social-image"
            />
        </div>
    );
};

export default Features;
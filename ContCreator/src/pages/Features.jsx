import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";

import { collection, addDoc } from "firebase/firestore";

import { db } from "../firebase.js";
import {
    doc,
    setDoc,
    serverTimestamp,
} from "firebase/firestore";

const ProfileSetup = () => {
    const [data, setData] = useState({
        fullName: '', username: '', email: '', country: '', language: '',
        mainNiche: '', subNiche: '', targetAudience: '',
        contentStyle: '', mainGoal: '', platforms: []
    });

    const navigate = useNavigate();
    const [progress, setProgress] = useState(0);
    const [activeStepIndex, setActiveStepIndex] = useState(0);

    const [filledSteps, setFilledSteps] = useState(0);

    const allSteps = [
        'Basic Information', 'Content Identity', 'Platforms'
    ];

    useEffect(() => {
        let filled = 0;
        const totalFields = 11;

        const basicFields = [data.fullName, data.username, data.email, data.country, data.language];
        basicFields.forEach(f => { if (f.trim() !== '') filled++; });

        const contentFields = [data.mainNiche, data.subNiche, data.targetAudience, data.contentStyle, data.mainGoal];
        contentFields.forEach(f => { if (f.trim() !== '') filled++; });

        if (data.platforms.length > 0) filled++;

        setFilledSteps(filled);

        const calcProgress = Math.round((filled / totalFields) * 100);
        setProgress(calcProgress > 100 ? 100 : calcProgress);

        const isBasicDone = basicFields.every(f => f.trim() !== '');
        const isContentDone = contentFields.every(f => f.trim() !== '');

        if (!isBasicDone) setActiveStepIndex(0);
        else if (!isContentDone) setActiveStepIndex(1);
        else setActiveStepIndex(2);

    }, [data]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData(prev => ({ ...prev, [name]: value }));
    };

    const togglePlatform = (platform) => {
        setData(prev => {
            const arr = prev.platforms;
            return {
                ...prev,
                platforms: arr.includes(platform)
                    ? arr.filter(item => item !== platform)
                    : [...arr, platform]
            };
        });
    };
    const handleNext = async () => {
        // 1. شرط الحماية
        if (data.fullName.trim() === '' || data.email.trim() === '') {
            alert("يرجى ملء البيانات الأساسية أولاً قبل المتابعة!");
            return;
        }

        try {
            const col = collection(db, "test");

            // رفع البيانات للفايربيز
            const docRef = await addDoc(col, {
                ...data,
                createdAt: serverTimestamp()
            });

            localStorage.setItem("userFirebaseId", docRef.id);

            navigate("/FeaturesNext");

        } catch (e) {
            console.error("ERROR:", e);
            alert("حدث خطأ أثناء حفظ البيانات، حاول مرة أخرى.");
        }
    };
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const safeProgress = Math.min(Math.max(progress, 0), 100);
    const offset = circumference - (safeProgress / 100) * circumference;

    return (
        <div className="min-h-screen w-full overflow-x-hidden bg-[#010010] text-white p-[clamp(1rem,4vw,2.5rem)] font-sans">
            <div className="mx-auto w-full max-w-[1700px] px-[clamp(1rem,2vw,2rem)] flex flex-col xl:flex-row gap-[clamp(1rem,2vw,2rem)]">

                {/* MAIN CONTENT (Left Side) */}
                <div className="flex-1 min-w-0 space-y-6">

                    {/* Header Card (Clipboard + Linear Progress) */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 md:gap-10 w-full mb-8">

                        <div className="flex items-center gap-5 md:gap-6">

                            {/* Profile Icon Image with Neon Glow */}
                            <div className="relative flex-shrink-0 w-16 h-16 md:w-20 md:h-20 flex items-center justify-center drop-shadow-[0_0_30px_rgba(192,38,211,0.6)]">
                                <img
                                    src="/FormChekImg.png"
                                    alt="Creator Profile Icon"
                                    className="w-full h-full object-contain scale-140"
                                />
                            </div>

                            <div>
                                {/* Gradient Title */}
                                <h1 className="text-[clamp(1.2rem,1vw+1rem,1.5rem)] font-bold mb-2 tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-pink-200 via-purple-300 to-indigo-300">
                                    Complete Your Creator Profile
                                </h1>
                                <p className="text-gray-400 text-sm md:text-base leading-relaxed">
                                    Tell us about your channels and content so we can generate
                                    better ideas, hashtags, and strategies for you ✨
                                </p>
                            </div>
                        </div>

                        {/* الجانب الأيمن: شريط التقدم */}
                        <div className="w-full md:w-72 flex flex-col gap-2">

                            {/* Texts Above Progress Bar */}
                            <div className="flex justify-between items-center text-sm">
                                <div className="text-gray-200 font-medium">Step {filledSteps} of 11</div>
                                <div className="text-gray-200 font-medium">{progress}%</div>
                            </div>

                            {/* Neon Linear Progress Bar */}
                            <div className="w-full bg-[#1b152b] rounded-full h-2 overflow-hidden shadow-inner">
                                <div
                                    className="bg-gradient-to-r from-fuchsia-500 to-purple-600 h-full rounded-full transition-all duration-[1500ms] ease-out shadow-[0_0_15px_rgba(217,70,239,0.8)]"
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>

                            {/* Text Below Progress Bar */}
                            <div className="text-gray-500 text-xs mt-1">
                                Takes ~5 minutes to complete
                            </div>

                        </div>
                    </div>

                    {/* SECTION 1: Basic Information */}
                    <div className="relative overflow-hidden p-6 md:p-8 rounded-2xl bg-gradient-to-b from-[#0c061b] to-[#070412] border border-[#1e1330] border-t-[#2d1b4e] shadow-[inset_0_1px_0px_rgba(255,255,255,0.03),0_12px_40px_rgba(0,0,0,0.5)] transition-all duration-300 hover:shadow-[0_15px_50px_rgba(0,0,0,0.6)]">

                        {/* Top Purple Glow */}
                        <div className="absolute top-0 left-1/4 h-32 w-1/2 -translate-y-1/2 rounded-full bg-purple-600/10 blur-[50px] pointer-events-none" />

                        <div className="relative z-10 flex items-center gap-4 mb-10">
                            {/* Glowing Purple Icon */}
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#20103c] border border-[#3c1e6d]/60 shadow-[0_0_20px_rgba(192,132,252,0.25)] text-[#c084fc]">
                                <svg className="w-6 h-6 drop-shadow-[0_0_8px_rgba(192,132,252,0.8)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                </svg>
                            </div>

                            <div>
                                {/* Gradient Title */}
                                <h2 className="text-[22px] font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-100 to-[#c084fc]">
                                    1. Basic Information
                                </h2>
                                <p className="text-sm text-[#9ca3af] mt-1 font-medium">Tell us who you are</p>
                            </div>
                        </div>

                        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

                            {/* Input: Full Name */}
                            <div className="space-y-2.5">
                                <label className="text-[13px] font-medium text-[#a1a1aa] ml-1">Full Name</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={data.fullName}
                                    onChange={handleChange}
                                    placeholder="Enter your full name"
                                    className="w-full bg-[#0d0718]/80 border border-[#2a1b44] rounded-xl px-4 py-3.5 text-white placeholder-[#6b7280] outline-none transition-all duration-300 focus:bg-[#150a28] focus:border-[#a855f7]/70 focus:shadow-[0_0_20px_rgba(168,85,247,0.15),inset_0_1px_0_rgba(255,255,255,0.02)] hover:border-[#422675]"
                                />
                            </div>

                            {/* Input: Username */}
                            <div className="space-y-2.5">
                                <label className="text-[13px] font-medium text-[#a1a1aa] ml-1">Username / Brand Name</label>
                                <input
                                    type="text"
                                    name="username"
                                    value={data.username}
                                    onChange={handleChange}
                                    placeholder="Enter your username or brand"
                                    className="w-full bg-[#0d0718]/80 border border-[#2a1b44] rounded-xl px-4 py-3.5 text-white placeholder-[#6b7280] outline-none transition-all duration-300 focus:bg-[#150a28] focus:border-[#a855f7]/70 focus:shadow-[0_0_20px_rgba(168,85,247,0.15),inset_0_1px_0_rgba(255,255,255,0.02)] hover:border-[#422675]"
                                />
                            </div>

                            {/* Input: Email */}
                            <div className="space-y-2.5 lg:col-span-1 md:col-span-2">
                                <label className="text-[13px] font-medium text-[#a1a1aa] ml-1">Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    onChange={handleChange}
                                    placeholder="Enter your email address"
                                    className="w-full bg-[#0d0718]/80 border border-[#2a1b44] rounded-xl px-4 py-3.5 text-white placeholder-[#6b7280] outline-none transition-all duration-300 focus:bg-[#150a28] focus:border-[#a855f7]/70 focus:shadow-[0_0_20px_rgba(168,85,247,0.15),inset_0_1px_0_rgba(255,255,255,0.02)] hover:border-[#422675]"
                                />
                            </div>

                            {/* Select: Country */}
                            <div className="space-y-2.5 relative">
                                <label className="text-[13px] font-medium text-[#a1a1aa] ml-1">Country</label>
                                <div className="relative">
                                    <select
                                        name="country"
                                        value={data.country}
                                        onChange={handleChange}
                                        className="w-full bg-[#0d0718]/80 border border-[#2a1b44] rounded-xl px-4 py-3.5 text-white outline-none transition-all duration-300 focus:bg-[#150a28] focus:border-[#a855f7]/70 focus:shadow-[0_0_20px_rgba(168,85,247,0.15),inset_0_1px_0_rgba(255,255,255,0.02)] hover:border-[#422675] appearance-none cursor-pointer"
                                    >
                                        <option value="" className="bg-[#0c061b]">Select your country</option>
                                        <option value="EG" className="bg-[#0c061b]">Egypt</option>
                                        <option value="SA" className="bg-[#0c061b]">Saudi Arabia</option>
                                        <option value="AE" className="bg-[#0c061b]">UAE</option>
                                    </select>
                                    {/* Custom Dropdown Arrow */}
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#a1a1aa]">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M6 9l6 6 6-6" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Select: Content Language */}
                            <div className="space-y-2.5 relative">
                                <label className="text-[13px] font-medium text-[#a1a1aa] ml-1">Content Language</label>
                                <div className="relative">
                                    <select
                                        name="language"
                                        value={data.language}
                                        onChange={handleChange}
                                        className="w-full bg-[#0d0718]/80 border border-[#2a1b44] rounded-xl px-4 py-3.5 text-white outline-none transition-all duration-300 focus:bg-[#150a28] focus:border-[#a855f7]/70 focus:shadow-[0_0_20px_rgba(168,85,247,0.15),inset_0_1px_0_rgba(255,255,255,0.02)] hover:border-[#422675] appearance-none cursor-pointer"
                                    >
                                        <option value="" className="bg-[#0c061b]">Select language</option>
                                        <option value="AR" className="bg-[#0c061b]">Arabic</option>
                                        <option value="EN" className="bg-[#0c061b]">English</option>
                                    </select>
                                    {/* Custom Dropdown Arrow */}
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#a1a1aa]">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M6 9l6 6 6-6" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* SECTION 2: Content Identity */}
                    <div className={`relative overflow-hidden p-6 md:p-8 rounded-2xl bg-gradient-to-b from-[#0c061b] to-[#070412] border border-[#1e1330] border-t-[#2d1b4e] shadow-[inset_0_1px_0px_rgba(255,255,255,0.03),0_12px_40px_rgba(0,0,0,0.5)] transition-all duration-700 ${activeStepIndex >= 1 ? 'opacity-100 hover:shadow-[0_15px_50px_rgba(0,0,0,0.6)]' : 'opacity-40 grayscale-[50%] pointer-events-none'}`}>

                        {/* Top Purple Glow */}
                        <div className="absolute top-0 left-1/4 h-32 w-1/2 -translate-y-1/2 rounded-full bg-purple-600/10 blur-[50px] pointer-events-none" />

                        <div className="relative z-10 flex items-center gap-4 mb-10">
                            {/* Glowing Purple Icon */}
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#20103c] border border-[#3c1e6d]/60 shadow-[0_0_20px_rgba(192,132,252,0.25)] text-[#c084fc]">
                                <svg className="w-6 h-6 drop-shadow-[0_0_8px_rgba(192,132,252,0.8)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                                </svg>
                            </div>
                            <div>
                                {/* Gradient Title */}
                                <h2 className="text-[22px] font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-100 to-[#c084fc]">
                                    2. Content Identity
                                </h2>
                                <p className="text-sm text-[#9ca3af] mt-1 font-medium">Help us understand your content</p>
                            </div>
                        </div>

                        {/* Select Inputs Grid */}
                        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">

                            {/* Main Niche */}
                            <div className="space-y-2.5 relative">
                                <label className="text-[13px] font-medium text-[#a1a1aa] ml-1">Main Niche</label>
                                <div className="relative">
                                    <select name="mainNiche" value={data.mainNiche} onChange={handleChange} className="w-full bg-[#0d0718]/80 border border-[#2a1b44] rounded-xl px-4 py-3.5 text-white outline-none transition-all duration-300 focus:bg-[#150a28] focus:border-[#a855f7]/70 focus:shadow-[0_0_20px_rgba(168,85,247,0.15),inset_0_1px_0_rgba(255,255,255,0.02)] hover:border-[#422675] appearance-none cursor-pointer">
                                        <option value="" className="bg-[#0c061b]">Select your main niche</option>
                                        <option value="tech" className="bg-[#0c061b]">Technology</option>
                                        <option value="gaming" className="bg-[#0c061b]">Gaming</option>
                                        <option value="education" className="bg-[#0c061b]">Education</option>
                                    </select>
                                    {/* Custom Arrow */}
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#a1a1aa]">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
                                    </div>
                                </div>
                            </div>

                            {/* Sub Niche */}
                            <div className="space-y-2.5 relative">
                                <label className="text-[13px] font-medium text-[#a1a1aa] ml-1">Sub Niche (Optional)</label>
                                <div className="relative">
                                    <select name="subNiche" value={data.subNiche} onChange={handleChange} className="w-full bg-[#0d0718]/80 border border-[#2a1b44] rounded-xl px-4 py-3.5 text-white outline-none transition-all duration-300 focus:bg-[#150a28] focus:border-[#a855f7]/70 focus:shadow-[0_0_20px_rgba(168,85,247,0.15),inset_0_1px_0_rgba(255,255,255,0.02)] hover:border-[#422675] appearance-none cursor-pointer">
                                        <option value="" className="bg-[#0c061b]">Select your sub niche</option>
                                        <option value="coding" className="bg-[#0c061b]">Web Development</option>
                                        <option value="ai" className="bg-[#0c061b]">Artificial Intelligence</option>
                                    </select>
                                    {/* Custom Arrow */}
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#a1a1aa]">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
                                    </div>
                                </div>
                            </div>

                            {/* Target Audience */}
                            <div className="space-y-2.5 relative">
                                <label className="text-[13px] font-medium text-[#a1a1aa] ml-1">Target Audience</label>
                                <div className="relative">
                                    <select name="targetAudience" value={data.targetAudience} onChange={handleChange} className="w-full bg-[#0d0718]/80 border border-[#2a1b44] rounded-xl px-4 py-3.5 text-white outline-none transition-all duration-300 focus:bg-[#150a28] focus:border-[#a855f7]/70 focus:shadow-[0_0_20px_rgba(168,85,247,0.15),inset_0_1px_0_rgba(255,255,255,0.02)] hover:border-[#422675] appearance-none cursor-pointer">
                                        <option value="" className="bg-[#0c061b]">Select your audience</option>
                                        <option value="beginners" className="bg-[#0c061b]">Beginners</option>
                                        <option value="professionals" className="bg-[#0c061b]">Professionals</option>
                                    </select>
                                    {/* Custom Arrow */}
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#a1a1aa]">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Single Selection - Content Style */}
                        <div className="relative z-10 mb-8">
                            <label className="text-[13px] font-medium text-[#a1a1aa] ml-1 block mb-3">Content Style (Select one)</label>
                            <div className="flex flex-wrap gap-3">
                                {['Educational', 'Entertainment', 'Storytelling', 'Motivational', 'News / Updates', 'Other'].map(style => {
                                    const isActive = data.contentStyle === style;
                                    return (
                                        <button
                                            key={style}
                                            onClick={() => setData({ ...data, contentStyle: style })}
                                            className={`px-5 py-2.5 rounded-xl border text-[13px] font-medium transition-all duration-300 flex items-center gap-2.5 
                        ${isActive
                                                    ? 'bg-[#20103c]/80 border-[#a855f7]/70 text-white shadow-[0_0_15px_rgba(168,85,247,0.2),inset_0_1px_0_rgba(255,255,255,0.05)]'
                                                    : 'bg-[#0d0718]/80 border-[#2a1b44] text-[#a1a1aa] hover:border-[#422675] hover:text-gray-200 hover:bg-[#150a28]'
                                                }`}
                                        >
                                            {/* Square Indicator (Checkbox Style) */}
                                            <div className={`w-4 h-4 rounded-[4px] border flex items-center justify-center transition-colors
                            ${isActive ? 'border-[#c084fc] bg-[#c084fc]/20' : 'border-[#4b5563]'}`}>
                                                {isActive && <div className="w-2 h-2 bg-[#c084fc] rounded-[2px]"></div>}
                                            </div>
                                            {style}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Single Selection - Main Goal */}
                        <div className="relative z-10">
                            <label className="text-[13px] font-medium text-[#a1a1aa] ml-1 block mb-3">Main Goal</label>
                            <div className="flex flex-wrap gap-3">
                                {['Grow My Audience', 'Increase Engagement', 'Sell Products / Services', 'Build Brand', 'Other'].map(goal => {
                                    const isActive = data.mainGoal === goal;
                                    return (
                                        <button
                                            key={goal}
                                            onClick={() => setData({ ...data, mainGoal: goal })}
                                            className={`px-5 py-2.5 rounded-xl border text-[13px] font-medium transition-all duration-300 flex items-center gap-2.5 
                        ${isActive
                                                    ? 'bg-gradient-to-r from-[#2a124c] to-[#1d0e36] border-[#a855f7]/70 text-white shadow-[0_0_20px_rgba(168,85,247,0.25),inset_0_1px_0_rgba(255,255,255,0.05)]'
                                                    : 'bg-[#0d0718]/80 border-[#2a1b44] text-[#a1a1aa] hover:border-[#422675] hover:text-gray-200 hover:bg-[#150a28]'
                                                }`}
                                        >
                                            {/* Round Indicator (Radio Style) */}
                                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors
                            ${isActive ? 'border-[#c084fc]' : 'border-[#4b5563]'}`}>
                                                {isActive && <div className="w-2 h-2 bg-[#c084fc] rounded-full drop-shadow-[0_0_3px_rgba(192,132,252,0.8)]"></div>}
                                            </div>
                                            {goal}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                    </div>
                    {/* SECTION 3: Platforms */}
                    <div className={`bg-[#040218] p-6 md:p-8 rounded-2xl shadow-xl border border-[#251b3a] transition-all duration-700 ${activeStepIndex >= 2 ? 'opacity-100' : 'opacity-40 grayscale-[50%]'}`}>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="bg-[#1a1429] border border-[#2d2146] p-3 rounded-full text-pink-400 shadow-[0_0_15px_rgba(244,114,182,0.15)]">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold tracking-wide">3 Platforms</h2>
                                <p className="text-sm text-gray-400 mt-1">Choose the platforms you create content on</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                            {/* قائمة المنصات */}
                            {[
                                { id: 'YouTube', color: 'text-red-500', icon: '▶️' },
                                { id: 'Instagram', color: 'text-pink-500', icon: '📸' },
                                { id: 'TikTok', color: 'text-white', icon: '🎵' },
                                { id: 'Facebook', color: 'text-blue-500', icon: 'f' },
                                { id: 'LinkedIn', color: 'text-blue-400', icon: 'in' },
                                { id: 'WhatsApp', color: 'text-green-500', icon: '💬' }
                            ].map(platform => {
                                const isSelected = data.platforms.includes(platform.id);
                                return (
                                    <div
                                        key={platform.id}
                                        onClick={() => togglePlatform(platform.id)}
                                        className={`relative p-5 rounded-2xl border flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-300 
                      ${isSelected
                                                ? 'bg-gradient-to-b from-[#1a1029] to-[#100c19] border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.15)]'
                                                : 'bg-[#0a0710] border-[#251b3a] hover:border-[#382a55]'}`}
                                    >
                                        {/* Checkbox صغير في الزاوية */}
                                        <div className={`absolute top-2 right-2 w-4 h-4 rounded-[4px] border flex items-center justify-center transition-colors
                      ${isSelected ? 'bg-purple-500 border-purple-500' : 'border-gray-600'}`}>
                                            {isSelected && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
                                        </div>
                                        {/* Placeholder Icon (يمكنك استبدالها بأيقونات SVG حقيقية لاحقاً) */}
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold bg-[#151020] ${platform.color}`}>
                                            {platform.icon}
                                        </div>
                                        <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-400'}`}>{platform.id}</span>
                                    </div>
                                );
                            })}
                        </div>
                        <p className="text-xs text-gray-500 mt-4">You can add more details about each platform in the next step.</p>
                    </div>

                    {/* Bottom Actions */}
                    <div className="flex flex-col-reverse md:flex-row justify-between items-center pt-4 gap-4">
                        <button className="cursor-pointer group relative overflow-hidden w-full md:w-auto px-7 py-3 rounded-xl border border-purple-500/25 bg-gradient-to-b from-[#1b1030] via-[#120a22] to-[#090512] text-gray-200 font-medium transition-all duration-500 hover:border-purple-400/60 hover:-translate-y-0.5 hover:shadow-[0_0_25px_rgba(168,85,247,.25)] active:scale-[0.98]">
                            {/* Glow */}
                            <span className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                                <span className="absolute -top-10 left-1/2 h-20 w-32 -translate-x-1/2 rounded-full bg-purple-500/20 blur-3xl"></span>
                            </span>

                            {/* Shine */}
                            <span className="absolute inset-y-0 -left-24 w-16 rotate-12 bg-white/10 blur-md transition-all duration-700 group-hover:left-[120%]"></span>

                            {/* Content */}
                            <span className="relative flex items-center justify-center gap-2">
                                <svg
                                    className="w-4 h-4 text-purple-300 transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>

                                <span>Save Draft</span>
                            </span>
                        </button>
                        <div className="flex w-full md:w-auto gap-4">
                            <button className="px-6 py-3 flex-1 md:flex-none rounded-xl bg-transparent text-gray-400 hover:text-white transition-colors text-center">
                                Back
                            </button>
                            <button
                                type='submit'
                                onClick={handleNext}
                                className="group cursor-pointer relative overflow-hidden px-8 py-3 flex-1 md:flex-none rounded-xl border border-purple-400/20 bg-gradient-to-r from-[#8b5cf6] via-[#7c3aed] to-[#4f46e5] text-white font-semibold shadow-[0_10px_30px_rgba(139,92,246,.25)] transition-all duration-500 hover:-translate-y-0.5 hover:border-purple-300/40 hover:shadow-[0_0_35px_rgba(168,85,247,.5)] active:scale-[0.98]"
                            >
                                {/* Glow */}
                                <span className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                                    <span className="absolute -top-10 left-1/2 h-24 w-40 -translate-x-1/2 rounded-full bg-white/15 blur-3xl"></span>
                                </span>

                                {/* Shine */}
                                <span className="absolute inset-y-0 -left-24 w-16 rotate-12 bg-white/20 blur-md transition-all duration-700 group-hover:left-[120%]"></span>

                                {/* Content */}
                                <span className="relative flex items-center justify-center gap-2">
                                    <span>Next Step</span>

                                    <svg
                                        className="w-4 h-4 transition-all duration-300 group-hover:translate-x-1"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2.5"
                                            d="M9 5l7 7-7 7"
                                        />
                                    </svg>
                                </span>
                            </button>
                        </div>
                    </div>

                </div>

                {/* ================= RIGHT SIDEBAR ================= */}
                <div className="w-full xl:w-[22%] xl:min-w-[320px] xl:max-w-[380px] space-y-6 shrink-0">

                    {/* Circular Progress Card */}
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#0c061b] to-[#070412] p-7 border border-[#1e1330] border-t-[#2d1b4e] shadow-[inset_0_1px_0px_rgba(255,255,255,0.03),0_12px_40px_rgba(0,0,0,0.5)]">

                        {/* Top Purple Glow (Unified Theme) */}
                        <div className="absolute -top-12 left-1/2 h-28 w-40 -translate-x-1/2 rounded-full bg-purple-600/15 blur-[40px] pointer-events-none" />

                        {/* Title with Gradient */}
                        <h3 className="relative z-10 text-[19px] font-bold tracking-wide drop-shadow-sm text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-100 to-[#c084fc] mb-8 text-center">
                            Profile Completion
                        </h3>

                        {/* Progress */}
                        <div className="relative z-10 mx-auto mb-7 flex h-40 w-40 items-center justify-center">

                            <svg
                                className="absolute inset-0 -rotate-90 drop-shadow-[0_0_18px_rgba(168,85,247,.35)]"
                                viewBox="0 0 160 160"
                            >
                                <defs>
                                    <linearGradient id="premiumProgress" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#d946ef" />
                                        <stop offset="45%" stopColor="#a855f7" />
                                        <stop offset="100%" stopColor="#c084fc" />
                                    </linearGradient>
                                </defs>

                                {/* Background Circle */}
                                <circle
                                    cx="80"
                                    cy="80"
                                    r={radius}
                                    stroke="#1e1330" // تحديث لون الخلفية ليطابق الكروت الأخرى
                                    strokeWidth="9"
                                    fill="none"
                                />

                                {/* Progress Circle */}
                                <circle
                                    cx="80"
                                    cy="80"
                                    r={radius}
                                    stroke="url(#premiumProgress)"
                                    strokeWidth="9"
                                    fill="none"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={offset}
                                    strokeLinecap="round"
                                    style={{
                                        transition: "stroke-dashoffset 1.2s ease",
                                        filter: "drop-shadow(0 0 12px rgba(192,132,252,.5))"
                                    }}
                                />
                            </svg>

                            <div className="absolute flex flex-col items-center">
                                <span className="text-2xl font-bold leading-none text-white drop-shadow-sm">
                                    {progress}
                                    <span className="text-lg text-purple-300">%</span>
                                </span>

                                <span className="mt-2 text-[11px] font-medium text-[#9ca3af]">
                                    Complete
                                </span>
                            </div>
                        </div>

                        <p className="relative z-10 mb-7 text-center text-[13px] leading-6 text-[#9ca3af]">
                            Complete all steps to get
                            <br />
                            personalized results
                        </p>

                        {/* Steps */}
                        <div className="relative z-10 space-y-3">
                            {allSteps.map((step, idx) => {

                                const isActive = idx === activeStepIndex;
                                const isCompleted = idx < activeStepIndex;

                                return (
                                    <div
                                        key={step}
                                        className={`flex items-center gap-3 rounded-xl px-4 py-2.5 transition-all duration-300 ${isActive
                                            ? "bg-[#20103c] border border-[#3c1e6d]/60 shadow-[0_0_15px_rgba(192,132,252,0.15)]"
                                            : ""
                                            }`}
                                    >

                                        {/* Status Dot */}
                                        <div className="relative flex h-4 w-4 shrink-0 items-center justify-center">

                                            {isCompleted ? (
                                                <div className="flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-br from-[#a855f7] to-[#d946ef] text-[10px] text-white shadow-[0_0_12px_rgba(192,132,252,.6)]">
                                                    ✓
                                                </div>
                                            ) : isActive ? (
                                                <>
                                                    {/* Outer Ring (Changed from sky blue to purple for theme consistency) */}
                                                    <span className="absolute inset-0 rounded-full border border-purple-400/70 shadow-[0_0_10px_rgba(192,132,252,.45)]" />

                                                    {/* Purple Glow */}
                                                    <span className="absolute h-3.5 w-3.5 rounded-full bg-purple-400/30 blur-[2px]" />

                                                    {/* White Center */}
                                                    <span className="relative h-2 w-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,.9)]" />
                                                </>
                                            ) : (
                                                <div className="h-4 w-4 rounded-full border border-[#3c1e6d]/50 bg-[#1e1330]/50" />
                                            )}

                                        </div>

                                        <span
                                            className={`text-[13px] transition-colors ${isActive
                                                ? "font-semibold text-white"
                                                : isCompleted
                                                    ? "text-[#e5e7eb]"
                                                    : "text-[#6b7280]"
                                                }`}
                                        >
                                            {step}
                                        </span>

                                    </div>
                                );
                            })}
                        </div>

                    </div>

                    {/* Tips Card */}
                    <div className="relative overflow-hidden h-68 rounded-2xl bg-gradient-to-b from-[#0c061b] to-[#070412] p-10 border border-[#1e1330] border-t-[#2d1b4e] shadow-[inset_0_1px_0px_rgba(255,255,255,0.03),0_12px_40px_rgba(0,0,0,0.5)]">

                        {/* Top Purple Glow (Subtle & cohesive) */}
                        <div className="absolute -top-12 left-10 h-28 w-40 rounded-full bg-purple-600/15 blur-[40px] pointer-events-none" />

                        {/* Content */}
                        <div className="relative z-10 flex flex-col gap-12">

                            {/* Header and Text Group */}
                            <div className="flex flex-col gap-6">

                                {/* Header */}
                                <div className="flex items-center gap-4">

                                    {/* Glowing Lightbulb Icon Container (Matched theme) */}
                                    <div className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-[#20103c] border border-[#3c1e6d]/60 shadow-[0_0_20px_rgba(192,132,252,0.35)]">
                                        <svg
                                            width="20"
                                            height="20"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="#c084fc"
                                            strokeWidth="1.8"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="animate-pulse-subtle"
                                        >
                                            {/* Neon lines */}
                                            <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1.3.5 2.6 1.5 3.5.8.8 1.3 1.5 1.5 2.5" />
                                            <path d="M9 18h6" />
                                            <path d="M10 22h4" />
                                            {/* Ray lines */}
                                            <line x1="12" y1="2" x2="12" y2="2" />
                                            <line x1="22" y1="8" x2="22" y2="8" />
                                            <line x1="2" y1="8" x2="2" y2="8" />
                                            <line x1="18.1" y1="13" x2="18.1" y2="13" />
                                            <line x1="5.9" y1="13" x2="5.9" y2="13" />
                                        </svg>
                                    </div>

                                    {/* Gradient Title */}
                                    <h3 className="text-[22px] font-bold tracking-wide drop-shadow-sm text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-100 to-[#c084fc]">
                                        Tips
                                    </h3>
                                </div>

                                {/* Text */}
                                <p className="text-[15px] leading-[1.7] text-[#9ca3af]">
                                    The more details you provide,
                                    the better our AI can help
                                    you grow!
                                </p>

                            </div>

                        </div>

                        {/* Giant Glowing Rocket Image */}
                        <img
                            src="/download (2).png"
                            alt="Rocket"
                            className="absolute -bottom-10 -right-10 w-[260px] max-w-[260px] select-none pointer-events-none drop-shadow-[0_0_40px_rgba(168,85,247,.7)]"
                        />

                    </div>
                    {/* What you'll get Card */}
                    <div className="relative overflow-hidden bg-gradient-to-b from-[#0c061b] to-[#070412] p-8 py-10 rounded-2xl border border-[#1e1330] border-t-[#2d1b4e] shadow-[inset_0_1px_0px_rgba(255,255,255,0.03),0_12px_40px_rgba(0,0,0,0.5)] w-full">

                        {/* Subtle Top Glow */}
                        <div className="absolute -top-12 left-1/2 h-24 w-40 -translate-x-1/2 rounded-full bg-purple-600/10 blur-[30px] pointer-events-none" />

                        {/* Content Container */}
                        <div className="relative z-10">

                            {/* Title with Gradient */}
                            <h3 className="font-bold text-[19px] mb-10 tracking-wide drop-shadow-sm text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-100 to-[#c084fc]">
                                What you'll get
                            </h3>

                            {/* Items List (Increased Spacing) */}
                            <div className="space-y-8">

                                {/* Item 1 */}
                                <div className="flex gap-4 items-center group">
                                    {/* Purple Icon Box */}
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#20103c] border border-[#3c1e6d]/40 shadow-[0_0_10px_rgba(192,132,252,0.15)] transition-all group-hover:shadow-[0_0_15px_rgba(192,132,252,0.3)]">
                                        <svg className="w-4 h-4 text-[#c084fc]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="text-[15px] font-semibold text-[#f3f4f6]">Personalized Ideas</h4>
                                        <p className="text-[12px] text-[#9ca3af] mt-1">Tailored to your niche and audience</p>
                                    </div>
                                </div>

                                {/* Item 2 */}
                                <div className="flex gap-4 items-center group">
                                    {/* Purple Icon Box */}
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#20103c] border border-[#3c1e6d]/40 shadow-[0_0_10px_rgba(192,132,252,0.15)] transition-all group-hover:shadow-[0_0_15px_rgba(192,132,252,0.3)]">
                                        <svg className="w-4 h-4 text-[#c084fc]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"></path>
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="text-[15px] font-semibold text-[#f3f4f6]">Better Hashtags</h4>
                                        <p className="text-[12px] text-[#9ca3af] mt-1">High-performing hashtags for your content</p>
                                    </div>
                                </div>

                                {/* Item 3 */}
                                <div className="flex gap-4 items-center group">
                                    {/* Purple Icon Box */}
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#20103c] border border-[#3c1e6d]/40 shadow-[0_0_10px_rgba(192,132,252,0.15)] transition-all group-hover:shadow-[0_0_15px_rgba(192,132,252,0.3)]">
                                        <svg className="w-4 h-4 text-[#c084fc]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="text-[15px] font-semibold text-[#f3f4f6]">Growth Strategies</h4>
                                        <p className="text-[12px] text-[#9ca3af] mt-1">Actionable tips to grow faster</p>
                                    </div>
                                </div>

                                {/* Item 4 */}
                                <div className="flex gap-4 items-center group">
                                    {/* Purple Icon Box */}
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#20103c] border border-[#3c1e6d]/40 shadow-[0_0_10px_rgba(192,132,252,0.15)] transition-all group-hover:shadow-[0_0_15px_rgba(192,132,252,0.3)]">
                                        <svg className="w-4 h-4 text-[#c084fc]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="text-[15px] font-semibold text-[#f3f4f6]">Analytics & Insights</h4>
                                        <p className="text-[12px] text-[#9ca3af] mt-1">Track and improve your performance</p>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default ProfileSetup;
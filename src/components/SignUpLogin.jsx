import React, { useRef, useState } from "react";
import { User, Mail, Lock, Eye, EyeOff, Calendar, Upload, X, Zap, BarChart2, Shield, Rocket, ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
// firebase.js should export both auth and db (Firestore).
import { auth, db } from "../firebase";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
} from "firebase/auth";

const AuthPage = () => {
    const navigate = useNavigate();

    const [isLogin, setIsLogin] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [imagePreview, setImagePreview] = useState("");
    const fileInputRef = useRef(null);

    // Form Data State
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        age: "",
        gender: "Male",
        bio: "",
        profileImage: null,
    });


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const uploadProfileImage = async (file, uid) => {
        if (!file) return "";

        const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

        if (!cloudName || !uploadPreset) {
            throw new Error(
                "Cloudinary is not configured. Add VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET to your .env file."
            );
        }

        if (!file.type.startsWith("image/")) {
            throw new Error("Please select a valid image file.");
        }

        if (file.size > 5 * 1024 * 1024) {
            throw new Error("Profile image must be 5MB or smaller.");
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", uploadPreset);
        formData.append("folder", `techook/users/${uid}`);

        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
            {
                method: "POST",
                body: formData,
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result?.error?.message || "Failed to upload profile image.");
        }

        return result.secure_url || "";
    };

    const handleProfileImageChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            alert("Please select a valid image file.");
            e.target.value = "";
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert("Profile image must be 5MB or smaller.");
            e.target.value = "";
            return;
        }

        setFormData((prev) => ({ ...prev, profileImage: file }));
        setImagePreview(URL.createObjectURL(file));
    };

    const removeProfileImage = () => {
        setFormData((prev) => ({ ...prev, profileImage: null }));
        setImagePreview("");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);

        try {
            if (isLogin) {
                await signInWithEmailAndPassword(
                    auth,
                    formData.email.trim(),
                    formData.password
                );

                navigate("/home");
                return;
            }

            // Validation
            if (!formData.username.trim()) {
                return alert("Username is required");
            }

            const age = Number(formData.age);
            if (!formData.age || Number.isNaN(age) || age < 1 || age > 120) {
                return alert("Please enter a valid age between 1 and 120.");
            }

            if (!formData.email.trim()) {
                return alert("Email is required");
            }

            if (formData.password !== formData.confirmPassword) {
                return alert("Passwords do not match");
            }

            if (formData.password.length < 6) {
                return alert("Password must be at least 6 characters");
            }

            const userCredential = await createUserWithEmailAndPassword(
                auth,
                formData.email.trim(),
                formData.password
            );

            const user = userCredential.user;

            // Upload image first, then save the profile under this Firebase Auth UID.
            const profileImageUrl = await uploadProfileImage(
                formData.profileImage,
                user.uid
            );

            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                username: formData.username.trim(),
                email: user.email,
                age,
                gender: formData.gender,
                bio: formData.bio.trim(),
                profileImage: profileImageUrl,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });

            navigate("/home");
        } catch (error) {
            console.error("Authentication/Profile error:", error);

            // Firebase may already have created the auth account before an image/Firestore error.
            alert(error?.message || "Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };
    // Gender Options with Icons
    const genderOptions = [
        {
            id: 'Male',
            label: 'Male',
            icon: <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="10" cy="14" r="5" /><line x1="13.54" y1="10.46" x2="21" y2="3" /><line x1="16" y1="3" x2="21" y2="3" /><line x1="21" y1="8" x2="21" y2="3" /></svg>
        },
        {
            id: 'Female',
            label: 'Female',
            icon: <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="10" r="5" /><line x1="12" y1="15" x2="12" y2="22" /><line x1="9" y1="19" x2="15" y2="19" /></svg>
        },
        {
            id: 'Other',
            label: 'Other',
            icon: <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="2" x2="12" y2="7" /><line x1="12" y1="17" x2="12" y2="22" /><line x1="2" y1="12" x2="7" y2="12" /><line x1="17" y1="12" x2="22" y2="12" /></svg>
        }
    ];

    return (
        <div
            className="min-h-screen relative flex flex-col items-center justify-center px-3 py-24 sm:px-5 sm:py-28 lg:px-8 lg:py-10 font-sans bg-cover bg-center bg-no-repeat bg-fixed overflow-x-hidden"
            style={{ backgroundImage: "url('/SignupLoginBg.png')" }}
        >
            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-[#070714]/50 backdrop-blur-sm z-0"></div>

            {/* Top Header Navigation */}
            <header className="absolute top-0 left-0 w-full px-3 py-4 sm:px-6 md:px-10 md:py-6 flex flex-col sm:flex-row justify-between items-center z-20 gap-4">
                {/* Logo Section */}
                <div className="hidden lg:flex items-center gap-3">                   
                     <img
                        src="/ChatGPT Image Jun 19, 2026, 05_26_10 PM.png"
                        alt="Techook Logo"
                        className="w-16 h-16 sm:w-20 sm:h-20 -my-4 sm:-my-5 object-contain drop-shadow-[0_0_10px_rgba(139,92,246,0.8)] relative z-10"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 24 24' fill='none' stroke='%23a855f7' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M12 2L2 7l10 5 10-5-10-5z'/><path d='M2 17l10 5 10-5'/><path d='M2 12l10 5 10-5'/></svg>";
                        }}
                    />
                    <span className="text-lg sm:text-xl font-semibold text-white tracking-wide whitespace-nowrap">
                        Techook <span className="text-purple-400">Studio</span>
                    </span>
                </div>

                <div className="relative flex p-1 rounded-2xl bg-[#131a2f]/90 border border-white/10 backdrop-blur-xl w-full max-w-[340px] shrink-0">
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-purple-500/5" />

                    <button
                        onClick={() => setIsLogin(true)}
                        className={`relative flex-1 h-10 rounded-xl transition-all duration-500 overflow-hidden font-medium text-sm whitespace-nowrap ${isLogin ? "text-white" : "text-slate-400 hover:text-white"}`}
                    >
                        {isLogin && (
                            <>
                                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600 via-purple-500 to-blue-600" />
                                <div className="absolute inset-[1px] rounded-xl bg-gradient-to-b from-white/20 via-white/5 to-transparent" />
                                <div className="absolute top-[2px] left-[10%] w-[80%] h-[35%] rounded-full bg-white/20 blur-md" />
                            </>
                        )}
                        <span className="relative z-10 flex items-center justify-center h-full">Login</span>
                    </button>

                    <button
                        onClick={() => setIsLogin(false)}
                        className={`relative flex-1 h-10 rounded-xl transition-all duration-500 overflow-hidden font-medium text-sm whitespace-nowrap ${!isLogin ? "text-white" : "text-slate-400 hover:text-white"}`}
                    >
                        {!isLogin && (
                            <>
                                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600 via-purple-500 to-blue-600" />
                                <div className="absolute inset-[1px] rounded-xl bg-gradient-to-b from-white/20 via-white/5 to-transparent" />
                                <div className="absolute top-[2px] left-[10%] w-[80%] h-[35%] rounded-full bg-white/20 blur-md" />
                            </>
                        )}
                        <span className="relative z-10 flex items-center justify-center h-full">Register</span>
                    </button>
                </div>
            </header>

            {/* Main Glassmorphism Container */}
            <div className="w-full max-w-[1440px] lg:mt-15 lg:w-[94vw] xl:w-[92vw] 2xl:w-[90vw] flex flex-col lg:flex-row bg-[#0c0c1d]/60 backdrop-blur-xl border border-white/10 rounded-3xl shadow-[0_0_50px_rgba(124,58,237,0.15)] overflow-hidden z-10 min-h-0 lg:min-h-[700px]">

                {/* Left Side (Branding & Features) */}
                <div className="lg:w-[40%] xl:w-[38%] p-7 md:p-10 xl:p-12 flex-col justify-center relative hidden lg:flex">
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                        <div className="absolute -top-[20%] -left-[10%] w-72 h-72 bg-purple-600/30 rounded-full blur-[100px]"></div>
                    </div>

                    <div className="relative flex items-center justify-center w-full h-[250px] xl:h-[290px] shrink-0 overflow-hidden">                        <div className="absolute inset-0 opacity-20 pointer-events-none"
                        style={{ backgroundImage: 'radial-gradient(circle at center linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '100% 100%, 40px 40px, 40px 40px' }}>
                    </div>

                        <div className="absolute w-40 h-40 bg-blue-600/40 rounded-full blur-[60px]"></div>
                        <div className="absolute top-[55%] w-32 h-32 bg-purple-600/60 rounded-full blur-[40px] scale-y-[0.3]"></div>

                        <img
                            src="/ChatGPT Image Jun 19, 2026, 05_26_10 PM.png"
                            alt="Techook Logo"
                            className="relative -top-8 xl:-top-10 w-[min(92%,520px)] h-auto object-contain animate-pulse transition-transform duration-500 scale-110 xl:scale-125"
                        />
                    </div>

                    <div className="relative z-10">
                        <h1 className="text-4xl font-bold mb-4 leading-tight text-white">
                            {isLogin ? "Welcome Back to" : "Create Your"} <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Techook</span> Account
                        </h1>
                        <p className="text-gray-400 mb-10 text-sm leading-relaxed">
                            {isLogin
                                ? "Log in to access your customized AI tools, continue your projects, and scale your content creation workflow."
                                : "Join Techook Studio and start creating content that stands out."}
                        </p>

                        <div className="space-y-6">
                            <FeatureItem icon={<Zap className="text-purple-400 w-5 h-5" />} title="AI-Powered Tools" desc="Generate hooks, content and ideas in seconds." />
                            <FeatureItem icon={<BarChart2 className="text-purple-400 w-5 h-5" />} title="Save Time" desc="Automate your content workflow and focus on growth." />
                            <FeatureItem icon={<Shield className="text-purple-400 w-5 h-5" />} title="Secure & Private" desc="Your data is safe with us. We respect your privacy." />
                        </div>
                    </div>
                </div>

                {/* Right Side (Form Container) */}
                <div className="w-full lg:w-[60%] xl:w-[62%] p-3 sm:p-5 lg:p-7 xl:p-9 flex flex-col justify-center min-w-0">
                    <div className="bg-[#111126]/80 rounded-2xl border border-white/5 p-4 sm:p-6 lg:p-7 xl:p-8 shadow-2xl relative w-full flex flex-col justify-between min-h-0">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[80px] pointer-events-none">
                        </div>

                        <div className="flex-1 flex flex-col relative z-10">
                            {/* Header Title */}
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold flex items-center gap-2 text-white">
                                    {isLogin ? "Log In" : "Create Account"}
                                    <Sparkles className="text-purple-400 animate-pulse w-5 h-5 drop-shadow-[0_0_10px_rgba(168,85,247,0.9)]" />
                                </h2>
                                <p className="text-gray-400 text-sm mt-1">
                                    {isLogin ? "Enter your credentials to continue" : "Fill in your details to get started"}
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4 flex-1 flex flex-col">
                                {isLogin ? (
                                    // --- LOGIN FORM FIELDS ---
                                    <div className="space-y-5 py-2 sm:py-4 animate-in fade-in duration-500 flex-1 flex flex-col justify-start">
                                        {/* Email */}
                                        <div className="space-y-2 group">
                                            <label className="text-sm font-medium text-slate-300 transition-colors group-focus-within:text-purple-300">
                                                Email Address
                                            </label>
                                            <div className="relative overflow-hidden rounded-2xl">
                                                <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-purple-500/20 via-blue-500/10 to-cyan-400/20 opacity-70 blur-sm transition-all duration-500 group-focus-within:opacity-100" />
                                                <div className="relative flex items-center h-14 rounded-2xl border border-white/15 bg-white/[0.04] backdrop-blur-[30px] px-4 transition-all duration-500 group-focus-within:border-purple-400/60 group-focus-within:bg-white/[0.07] group-focus-within:shadow-[0_0_35px_rgba(168,85,247,0.30)]">
                                                    <div className="pointer-events-none absolute inset-[1px] rounded-2xl bg-gradient-to-b from-white/10 via-transparent to-transparent" />
                                                    <div className="pointer-events-none absolute top-[2px] left-[8%] w-[84%] h-[35%] rounded-full bg-white/15 blur-md" />
                                                    <Mail className="relative z-10 mr-3 h-5 w-5 text-slate-500 transition-colors duration-300 group-focus-within:text-purple-300" />
                                                    <input
                                                        type="email"
                                                        name="email"
                                                        value={formData.email}
                                                        onChange={handleChange}
                                                        required
                                                        autoComplete="email"
                                                        placeholder="Enter your email"
                                                        className="relative z-10 w-full appearance-none border-none bg-transparent text-sm text-white placeholder:text-slate-500 outline-none shadow-none ring-0 focus:outline-none focus:ring-0"
                                                    />
                                                </div>

                                            </div>
                                        </div>

                                        {/* Password */}
                                        <div className="space-y-2 group">
                                            <div className="flex items-center justify-between">
                                                <label className="text-sm font-medium text-slate-300 transition-colors group-focus-within:text-purple-300">
                                                    Password
                                                </label>
                                                <a href="#" className="text-xs text-purple-300 transition-all duration-300 hover:text-purple-200 hover:drop-shadow-[0_0_12px_rgba(192,132,252,.8)]">
                                                    Forgot Password?
                                                </a>
                                            </div>
                                            <div className="relative overflow-hidden rounded-2xl">
                                                <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-purple-500/20 via-blue-500/10 to-cyan-400/20 opacity-70 blur-sm transition-all duration-500 group-focus-within:opacity-100" />
                                                <div className="relative flex items-center h-14 rounded-2xl border border-white/15 bg-white/[0.04] backdrop-blur-[30px] px-4 transition-all duration-500 group-focus-within:border-purple-400/60 group-focus-within:bg-white/[0.07] group-focus-within:shadow-[0_0_35px_rgba(168,85,247,0.30)]">
                                                    <div className="pointer-events-none absolute inset-[1px] rounded-2xl bg-gradient-to-b from-white/10 via-transparent to-transparent" />
                                                    <div className="pointer-events-none absolute top-[2px] left-[8%] w-[84%] h-[35%] rounded-full bg-white/15 blur-md" />
                                                    <Lock className="relative z-10 mr-3 h-5 w-5 text-slate-500 transition-colors duration-300 group-focus-within:text-purple-300" />
                                                    <input
                                                        type={showPassword ? "text" : "password"}
                                                        name="password"
                                                        value={formData.password}
                                                        onChange={handleChange}
                                                        required
                                                        autoComplete="current-password"
                                                        placeholder="Enter your password"
                                                        className="relative z-10 w-full appearance-none border-none bg-transparent text-sm text-white placeholder:text-slate-500 outline-none shadow-none ring-0 focus:outline-none focus:ring-0"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="relative z-10 ml-3 flex h-8 w-8 items-center justify-center rounded-full  transition-all duration-300  active:scale-95"
                                                    >
                                                        {showPassword ? (
                                                            <EyeOff className="h-4 w-4 text-purple-300 transition-all duration-300" />
                                                        ) : (
                                                            <Eye className="h-4 w-4 text-slate-400 transition-all duration-300 hover:text-purple-300" />
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    // --- SIGN UP FORM FIELDS ---
                                    <div className="space-y-4 animate-in fade-in duration-500 flex-1">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2 group">
                                                <label className="text-xs font-medium text-slate-300 transition-colors group-focus-within:text-purple-300">
                                                    Username
                                                </label>
                                                <div className="relative overflow-hidden rounded-2xl">
                                                    {/* Glass Glow */}
                                                    <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-purple-500/20 via-blue-500/10 to-cyan-400/20 opacity-70 group-focus-within:opacity-100 blur-sm transition-all duration-500" />
                                                    {/* Glass Background */}
                                                    <div className="relative flex items-center h-12 rounded-2xl border border-white/15 bg-white/[0.04] backdrop-blur-[30px] px-4 transition-all duration-500 group-focus-within:border-purple-400/60 group-focus-within:bg-white/[0.07] group-focus-within:shadow-[0_0_35px_rgba(168,85,247,0.30)]">
                                                        {/* Reflection */}
                                                        <div className="pointer-events-none absolute inset-[1px] rounded-2xl bg-gradient-to-b from-white/10 via-transparent to-transparent" />
                                                        {/* Top Shine */}
                                                        <div className="pointer-events-none absolute top-[2px] left-[8%] w-[84%] h-[35%] rounded-full bg-white/15 blur-md" />
                                                        <User className="relative z-10 mr-3 h-4 w-4 text-slate-500 transition-colors duration-300 group-focus-within:text-purple-300" />
                                                        <input
                                                            type="text"
                                                            name="username"
                                                            value={formData.username}
                                                            onChange={handleChange}
                                                            placeholder="Choose a username"
                                                            autoComplete="username"
                                                            className="relative z-10 w-full bg-transparent text-sm text-white placeholder:text-slate-500 outline-none"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-2 group">
                                                <label className="text-xs font-medium text-slate-300 transition-colors group-focus-within:text-purple-300">
                                                    Email Address
                                                </label>
                                                <div className="relative overflow-hidden rounded-2xl">
                                                    {/* Glow */}
                                                    <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-purple-500/20 via-blue-500/10 to-cyan-400/20 opacity-70 blur-sm transition-all duration-500 group-focus-within:opacity-100" />
                                                    {/* Glass */}
                                                    <div className="relative flex items-center h-12 rounded-2xl border border-white/15 bg-white/[0.04] backdrop-blur-[30px] px-4 transition-all duration-500 group-focus-within:border-purple-400/60 group-focus-within:bg-white/[0.07] group-focus-within:shadow-[0_0_35px_rgba(168,85,247,0.30)]">
                                                        {/* Reflection */}
                                                        <div className="pointer-events-none absolute inset-[1px] rounded-2xl bg-gradient-to-b from-white/10 via-transparent to-transparent" />
                                                        {/* Top Shine */}
                                                        <div className="pointer-events-none absolute top-[2px] left-[8%] w-[84%] h-[35%] rounded-full bg-white/15 blur-md" />
                                                        <Mail className="relative z-10 mr-3 h-4 w-4 text-slate-500 transition-colors duration-300 group-focus-within:text-purple-300" />
                                                        <input
                                                            type="email"
                                                            name="email"
                                                            value={formData.email}
                                                            onChange={handleChange}
                                                            required
                                                            autoComplete="email"
                                                            spellCheck={false}
                                                            autoCorrect="off"
                                                            autoCapitalize="off"
                                                            placeholder="Enter your email"
                                                            className="relative z-10 w-full appearance-none border-none bg-transparent text-sm text-white placeholder:text-slate-500 outline-none shadow-none ring-0 focus:outline-none focus:ring-0"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-2 group">
                                                <label className="text-xs font-medium text-slate-300 transition-colors group-focus-within:text-purple-300">
                                                    Password
                                                </label>
                                                <div className="relative overflow-hidden rounded-2xl">
                                                    {/* Glow */}
                                                    <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-purple-500/20 via-blue-500/10 to-cyan-400/20 opacity-70 blur-sm transition-all duration-500 group-focus-within:opacity-100" />
                                                    {/* Glass */}
                                                    <div className="relative flex items-center h-12 rounded-2xl border border-white/15 bg-white/[0.04] backdrop-blur-[30px] px-4 transition-all duration-500 group-focus-within:border-purple-400/60 group-focus-within:bg-white/[0.07] group-focus-within:shadow-[0_0_35px_rgba(168,85,247,0.30)]">
                                                        {/* Reflection */}
                                                        <div className="pointer-events-none absolute inset-[1px] rounded-2xl bg-gradient-to-b from-white/10 via-transparent to-transparent" />
                                                        {/* Shine */}
                                                        <div className="pointer-events-none absolute top-[2px] left-[8%] w-[84%] h-[35%] rounded-full bg-white/15 blur-md" />
                                                        {/* Lock Icon */}
                                                        <Lock className="relative z-10 mr-3 h-4 w-4 text-slate-500 transition-colors duration-300 group-focus-within:text-purple-300" />
                                                        {/* Input */}
                                                        <input
                                                            type={showPassword ? "text" : "password"}
                                                            name="password"
                                                            value={formData.password}
                                                            onChange={handleChange}
                                                            required
                                                            autoComplete="current-password"
                                                            placeholder="Enter your password"
                                                            className="relative z-10 w-full appearance-none border-none bg-transparent text-sm text-white placeholder:text-slate-500 outline-none shadow-none ring-0 focus:outline-none focus:ring-0"
                                                        />
                                                        {/* Eye Button */}
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowPassword((prev) => !prev)}
                                                            aria-label={showPassword ? "Hide password" : "Show password"}
                                                            className="relative z-10 ml-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-400 transition-all duration-300 hover:border-purple-400/40 hover:bg-white/[0.08] hover:text-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400/30 active:scale-95"
                                                        >
                                                            {showPassword ? (
                                                                <EyeOff className="h-4 w-4 transition-all duration-200" />
                                                            ) : (
                                                                <Eye className="h-4 w-4 transition-all duration-200" />
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-2 group">
                                                <label className="text-xs font-medium text-slate-300 transition-colors group-focus-within:text-purple-300">
                                                    Confirm Password
                                                </label>
                                                <div className="relative overflow-hidden rounded-2xl">
                                                    {/* Glow */}
                                                    <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-purple-500/20 via-blue-500/10 to-cyan-400/20 opacity-70 blur-sm transition-all duration-500 group-focus-within:opacity-100" />
                                                    {/* Glass */}
                                                    <div className="relative flex items-center h-12 rounded-2xl border border-white/15 bg-white/[0.04] backdrop-blur-[30px] px-4 transition-all duration-500 group-focus-within:border-purple-400/60 group-focus-within:bg-white/[0.07] group-focus-within:shadow-[0_0_35px_rgba(168,85,247,0.30)]">
                                                        {/* Reflection */}
                                                        <div className="pointer-events-none absolute inset-[1px] rounded-2xl bg-gradient-to-b from-white/10 via-transparent to-transparent" />
                                                        {/* Top Shine */}
                                                        <div className="pointer-events-none absolute top-[2px] left-[8%] w-[84%] h-[35%] rounded-full bg-white/15 blur-md" />
                                                        {/* Lock Icon */}
                                                        <Lock className="relative z-10 mr-3 h-4 w-4 text-slate-500 transition-colors duration-300 group-focus-within:text-purple-300" />
                                                        {/* Input */}
                                                        <input
                                                            type={showConfirmPassword ? "text" : "password"}
                                                            name="confirmPassword"
                                                            value={formData.confirmPassword}
                                                            onChange={handleChange}
                                                            required
                                                            autoComplete="new-password"
                                                            placeholder="Confirm your password"
                                                            className="relative z-10 w-full appearance-none border-none bg-transparent text-sm text-white placeholder:text-slate-500 outline-none shadow-none ring-0 focus:outline-none focus:ring-0"
                                                        />

                                                        <button

                                                            type="button"

                                                            onClick={() => setShowConfirmPassword((prev) => !prev)}

                                                            aria-label={showConfirmPassword ? "Hide confirmation password" : "Show confirmation password"}

                                                            className="relative z-10 ml-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-400 transition-all duration-300 hover:border-purple-400/40 hover:bg-white/[0.08] hover:text-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400/30 active:scale-95"

                                                        >

                                                            {showConfirmPassword ? (

                                                                <EyeOff className="h-4 w-4 transition-all duration-200" />

                                                            ) : (

                                                                <Eye className="h-4 w-4 transition-all duration-200" />

                                                            )}

                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2 group">
                                                <label className="text-xs font-medium text-slate-300 transition-colors group-focus-within:text-purple-300">
                                                    Age
                                                </label>

                                                <div className="relative overflow-hidden rounded-2xl">

                                                    {/* Glow */}
                                                    <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-purple-500/20 via-blue-500/10 to-cyan-400/20 opacity-70 blur-sm transition-all duration-500 group-focus-within:opacity-100" />

                                                    {/* Glass Input */}
                                                    <div className="relative flex items-center h-12 rounded-2xl border border-white/15 bg-white/[0.04] backdrop-blur-[30px] px-4 transition-all duration-500 group-focus-within:border-purple-400/60 group-focus-within:bg-white/[0.07] group-focus-within:shadow-[0_0_35px_rgba(168,85,247,0.30)]">

                                                        {/* Reflection */}
                                                        <div className="pointer-events-none absolute inset-[1px] rounded-2xl bg-gradient-to-b from-white/10 via-transparent to-transparent" />

                                                        {/* Shine */}
                                                        <div className="pointer-events-none absolute top-[2px] left-[8%] w-[84%] h-[35%] rounded-full bg-white/15 blur-md" />

                                                        {/* Icon */}
                                                        <Calendar className="relative z-10 mr-3 h-4 w-4 text-slate-500 transition-colors duration-300 group-focus-within:text-purple-300" />

                                                        {/* Input */}
                                                        <input
                                                            type="number"
                                                            name="age"
                                                            value={formData.age}
                                                            onChange={handleChange}
                                                            placeholder="Enter your age"
                                                            min="1"
                                                            max="120"
                                                            className="relative z-10 w-full appearance-none border-none bg-transparent text-sm text-white placeholder:text-slate-500 outline-none shadow-none ring-0 focus:outline-none focus:ring-0"
                                                        />

                                                    </div>

                                                </div>
                                            </div>

                                            <div className="space-y-2 group">
                                                <label className="text-xs font-medium text-slate-300 transition-colors group-focus-within:text-purple-300">
                                                    Gender
                                                </label>

                                                <div className="relative overflow-hidden rounded-2xl">

                                                    {/* Glow */}
                                                    <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-purple-500/20 via-blue-500/10 to-cyan-400/20 opacity-70 blur-sm transition-all duration-500 group-focus-within:opacity-100" />

                                                    {/* Glass Container */}
                                                    <div className="relative flex h-12 rounded-2xl border border-white/15 bg-white/[0.04] backdrop-blur-[30px] p-1 transition-all duration-500 group-focus-within:border-purple-400/60 group-focus-within:shadow-[0_0_35px_rgba(168,85,247,0.30)]">

                                                        {/* Reflection */}
                                                        <div className="pointer-events-none absolute inset-[1px] rounded-2xl bg-gradient-to-b from-white/10 via-transparent to-transparent" />

                                                        {genderOptions.map((g) => (
                                                            <button
                                                                key={g.id}
                                                                type="button"
                                                                onClick={() => setFormData(prev => ({ ...prev, gender: g.id }))}
                                                                className={`relative flex-1 flex items-center justify-center gap-2 rounded-xl text-sm font-medium transition-all duration-300 overflow-hidden ${formData.gender === g.id ? "text-white" : "text-slate-400 hover:text-white hover:bg-white/[0.05]"}`}
                                                            >

                                                                {formData.gender === g.id && (
                                                                    <>
                                                                        {/* Active Glass */}
                                                                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/30 via-blue-500/25 to-cyan-400/25 backdrop-blur-xl border border-white/10" />

                                                                        {/* Active Reflection */}
                                                                        <div className="absolute inset-[1px] rounded-xl bg-gradient-to-b from-white/15 via-transparent to-transparent" />

                                                                        {/* Active Shine */}
                                                                        <div className="absolute top-[2px] left-[10%] w-[80%] h-[35%] rounded-full bg-white/20 blur-md" />
                                                                    </>
                                                                )}

                                                                <span className="relative z-10 text-sm">
                                                                    {g.icon}
                                                                </span>

                                                                <span className="relative z-10 whitespace-nowrap">
                                                                    {g.label}
                                                                </span>

                                                            </button>
                                                        ))}

                                                    </div>

                                                </div>
                                            </div>
                                        </div>

                                        {/* Profile Picture (Glassmorphism) */}
                                        <div className="space-y-2 group">
                                            <label className="text-xs font-medium text-slate-300 transition-colors group-hover:text-purple-300">
                                                Profile Picture
                                            </label>

                                            <div className="relative overflow-hidden rounded-2xl">

                                                {/* Glow */}
                                                <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-purple-500/20 via-blue-500/10 to-cyan-400/20 opacity-70 blur-sm transition-all duration-500 group-hover:opacity-100" />

                                                {/* Glass Upload */}
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    accept="image/png,image/jpeg,image/webp"
                                                    onChange={handleProfileImageChange}
                                                    className="hidden"
                                                />

                                                <div
                                                    role="button"
                                                    tabIndex={0}
                                                    onClick={() => fileInputRef.current?.click()}
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter" || e.key === " ") {
                                                            e.preventDefault();
                                                            fileInputRef.current?.click();
                                                        }
                                                    }}
                                                    className="relative flex items-center gap-3 sm:gap-4 rounded-2xl border border-white/15 bg-white/[0.04] backdrop-blur-[30px] px-3 sm:px-4 py-3 transition-all duration-500 hover:border-purple-400/60 hover:bg-white/[0.07] hover:shadow-[0_0_35px_rgba(168,85,247,0.30)] cursor-pointer"
                                                >

                                                    {/* Reflection */}
                                                    <div className="pointer-events-none absolute inset-[1px] rounded-2xl bg-gradient-to-b from-white/10 via-transparent to-transparent" />

                                                    {/* Top Shine */}
                                                    <div className="pointer-events-none absolute top-[2px] left-[8%] w-[84%] h-[35%] rounded-full bg-white/15 blur-md" />

                                                    {/* Upload Icon */}
                                                    <div className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/15 bg-white/[0.05] backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] transition-all duration-300 group-hover:border-purple-400/40 group-hover:shadow-[0_0_18px_rgba(168,85,247,0.25)]">
                                                        {imagePreview ? (
                                                            <img
                                                                src={imagePreview}
                                                                alt="Profile preview"
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : (
                                                            <Upload className="h-5 w-5 text-purple-300 transition-transform duration-300 group-hover:scale-110" />
                                                        )}
                                                    </div>

                                                    {/* Text */}
                                                    <div className="relative z-10 flex-1 min-w-0">
                                                        <p className="truncate text-sm font-medium text-white">
                                                            {formData.profileImage?.name || "Upload your profile picture"}
                                                        </p>

                                                        <p className="mt-0.5 text-xs text-slate-500">
                                                            {formData.profileImage ? "Ready to upload" : "JPG, PNG or WebP • Max 5MB"}
                                                        </p>
                                                    </div>

                                                    {/* Upload Badge */}
                                                    {formData.profileImage ? (
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                removeProfileImage();
                                                            }}
                                                            aria-label="Remove selected image"
                                                            className="relative z-20 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-slate-300 transition-all hover:border-red-400/40 hover:bg-red-400/10 hover:text-red-300 active:scale-95"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </button>
                                                    ) : (
                                                        <div className="relative z-10 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[11px] font-medium text-slate-300 backdrop-blur-xl transition-all duration-300 group-hover:border-purple-400/40 group-hover:text-white">
                                                            Browse
                                                        </div>
                                                    )}

                                                </div>

                                            </div>
                                        </div>

                                        {/* Bio Input Field (Premium Glass) */}
                                        <div className="space-y-2 group">
                                            <label className="text-xs font-medium text-slate-300 transition-colors group-focus-within:text-purple-300">
                                                Bio (Optional)
                                            </label>

                                            <div className="relative overflow-hidden rounded-2xl">

                                                {/* Glow */}
                                                <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-purple-500/20 via-blue-500/10 to-cyan-400/20 opacity-70 blur-sm transition-all duration-500 group-focus-within:opacity-100" />

                                                {/* Glass Container */}
                                                <div className="relative rounded-2xl border border-white/15 bg-white/[0.04] backdrop-blur-[30px] p-3 transition-all duration-500 group-focus-within:border-purple-400/60 group-focus-within:bg-white/[0.07] group-focus-within:shadow-[0_0_35px_rgba(168,85,247,0.30)]">

                                                    {/* Reflection */}
                                                    <div className="pointer-events-none absolute inset-[1px] rounded-2xl bg-gradient-to-b from-white/10 via-transparent to-transparent" />

                                                    {/* Top Shine */}
                                                    <div className="pointer-events-none absolute top-[2px] left-[8%] w-[84%] h-[35%] rounded-full bg-white/15 blur-md" />

                                                    <textarea
                                                        name="bio"
                                                        value={formData.bio}
                                                        onChange={handleChange}
                                                        maxLength={160}
                                                        placeholder="Tell us a bit about yourself..."
                                                        className="relative z-10 h-12 w-full resize-none appearance-none border-none bg-transparent text-sm text-white placeholder:text-slate-500 outline-none shadow-none ring-0 focus:outline-none focus:ring-0"
                                                    />

                                                    <div className="relative z-10 mt-1 flex justify-end">
                                                        <div className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[11px] font-medium text-slate-400 backdrop-blur-xl">
                                                            {formData.bio.length}/160
                                                        </div>
                                                    </div>

                                                </div>

                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 mt-3 pl-1">
                                            <div className="relative flex items-center justify-center w-4 h-4">
                                                <input type="checkbox" required className="peer w-4 h-4 appearance-none rounded border border-white/20 bg-white/5 checked:bg-purple-500 checked:border-purple-400 transition-colors cursor-pointer shrink-0" />
                                                <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                            </div>
                                            <span className="text-xs text-gray-400 leading-tight">I agree to the <a href="#" className="text-purple-400 hover:text-purple-300 hover:drop-shadow-[0_0_5px_rgba(192,132,252,0.8)] transition-all">Terms of Service</a> and <a href="#" className="text-purple-400 hover:text-purple-300 hover:drop-shadow-[0_0_5px_rgba(192,132,252,0.8)] transition-all">Privacy Policy</a></span>
                                        </div>
                                    </div>
                                )}

                                {/* Premium Submit Button */}
                                <div className="mt-auto pt-6">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className={`group relative w-full h-14 overflow-hidden rounded-2xl transition-all duration-500 hover:scale-[1.01] active:scale-[0.98] ${isSubmitting ? "opacity-70 cursor-wait" : ""}`}
                                    >
                                        {/* Outer Glow */}
                                        <div className="absolute -inset-[2px] rounded-2xl bg-gradient-to-r from-purple-500/30 via-blue-500/25 to-cyan-400/30 blur-xl opacity-60 group-hover:opacity-100 transition-all duration-500" />

                                        {/* Glass Background */}
                                        <div className="absolute inset-0 rounded-2xl border border-white/20 backdrop-blur-[30px] bg-gradient-to-r from-purple-600/75 via-purple-500/70 to-blue-500/75 shadow-[0_15px_40px_rgba(0,0,0,0.35)]" />

                                        {/* Inner Glass */}
                                        <div className="absolute inset-[1px] rounded-2xl border border-white/10 bg-gradient-to-b from-white/18 via-white/6 to-transparent" />

                                        {/* Glass Reflection */}
                                        <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.18),transparent_35%),radial-gradient(circle_at_85%_80%,rgba(103,232,249,0.18),transparent_30%),radial-gradient(circle_at_80%_20%,rgba(168,85,247,0.18),transparent_30%)]" />

                                        {/* Top Shine */}
                                        <div className="absolute top-[2px] left-[8%] w-[84%] h-[36%] rounded-full bg-white/20 blur-md" />

                                        {/* Left Glow */}
                                        <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-cyan-300/60 blur-xl group-hover:scale-125 transition-all duration-500" />

                                        {/* Right Glow */}
                                        <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-purple-300/60 blur-xl group-hover:scale-125 transition-all duration-500" />

                                        {/* Shine Animation */}
                                        <div className="absolute inset-0 overflow-hidden rounded-2xl">
                                            <div className="absolute -left-24 top-0 h-full w-20 rotate-12 bg-white/20 blur-md group-hover:left-[120%] transition-all duration-1000" />
                                        </div>

                                        {/* Content */}
                                        <span className="relative z-20 flex h-full items-center justify-center gap-2 font-semibold tracking-wide text-white">
                                            {isSubmitting ? (isLogin ? "Signing In..." : "Creating Account...") : (isLogin ? "Sign In" : "Create TechHook Account")}

                                            {isLogin ? (
                                                <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                                            ) : (
                                                <Rocket className="w-5 h-5 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1" />
                                            )}
                                        </span>
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Bottom OAuth Section */}
                        <div className="mt-4 relative z-10">
                            <div className="flex items-center gap-4 my-4">
                                <div className="flex-1 h-px bg-gray-800"></div>
                                <span className="text-xs text-gray-500 whitespace-nowrap">or continue with</span>
                                <div className="flex-1 h-px bg-gray-800"></div>
                            </div>

                            <button type="button" className="w-full py-2.5 bg-[#181833] hover:bg-[#23234a] border border-gray-700/50 rounded-xl text-white text-sm font-medium transition-colors flex items-center justify-center gap-2 whitespace-nowrap">
                                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                Continue with Google
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const FeatureItem = ({ icon, title, desc }) => (
    <div className="flex gap-4 items-start">
        <div className="bg-[#1a1a3a] p-3 rounded-xl border border-white/5 shrink-0">
            {icon}
        </div>
        <div>
            <h3 className="font-semibold text-white">{title}</h3>
            <p className="text-gray-400 text-sm mt-1">{desc}</p>
        </div>
    </div>
);

export default AuthPage;
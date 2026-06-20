"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function WaitlistModal({ isOpen, onClose, onSuccess }: WaitlistModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [xUsername, setXUsername] = useState("");
  const [telegramUsername, setTelegramUsername] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [supabaseCount, setSupabaseCount] = useState<number | null>(null);
  const [isFallbackMode, setIsFallbackMode] = useState(false);
  const [isDev, setIsDev] = useState(false);

  useEffect(() => {
    setIsDev(process.env.NODE_ENV === "development");
  }, []);

  // Sync count on mount and update
  useEffect(() => {
    if (!isOpen) return;
    
    const fetchCount = async () => {
      if (supabase) {
        try {
          const { count, error } = await supabase
            .from("airdrop_waitlist")
            .select("*", { count: "exact", head: true });
          
          if (!error && count !== null) {
            setSupabaseCount(count);
            setIsFallbackMode(false);
          } else {
            throw new Error("Supabase query error");
          }
        } catch (err) {
          setSupabaseCount(null);
          setIsFallbackMode(true);
        }
      } else {
        setSupabaseCount(null);
        setIsFallbackMode(true);
      }
    };

    fetchCount();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMessage("Email address is required.");
      return;
    }
    
    setIsSubmitting(true);
    setErrorMessage("");

    const newRecord = {
      email: email.trim().toLowerCase(),
      name: name.trim() || null,
      x_username: xUsername.trim() ? xUsername.trim().replace(/^@/, "") : null,
      telegram_username: telegramUsername.trim() ? telegramUsername.trim().replace(/^@/, "") : null,
      created_at: new Date().toISOString()
    };

    try {
      if (supabase) {
        // Attempt cloud write
        const { error } = await supabase
          .from("airdrop_waitlist")
          .insert([newRecord]);
        
        if (error) {
          throw error;
        }
        
        // Success
        setIsSuccess(true);
        if (onSuccess) onSuccess();
      } else {
        saveToLocalStorage(newRecord);
      }
    } catch (err: any) {
      console.warn("Supabase database error, attempting local storage fallback:", err);
      saveToLocalStorage(newRecord);
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveToLocalStorage = (record: any) => {
    try {
      const localData = localStorage.getItem("mm_airdrop_waitlist");
      let entries = [];
      if (localData) {
        entries = JSON.parse(localData);
        if (!Array.isArray(entries)) entries = [];
      }
      
      const emailExists = entries.some((e: any) => e.email === record.email);
      if (emailExists) {
        setErrorMessage("This email is already registered on the waitlist.");
        return;
      }
      
      entries.push(record);
      localStorage.setItem("mm_airdrop_waitlist", JSON.stringify(entries));
      
      setIsSuccess(true);
      if (onSuccess) onSuccess();
    } catch (e) {
      setErrorMessage("Could not save registration. Local storage full or disabled.");
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      {/* Dark overlay with blur */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-300"
      />
      
      {/* Glassmorphic Modal Card */}
      <div className="relative w-full max-w-[500px] bg-zinc-950/80 border border-zinc-800/80 rounded p-6 sm:p-8 shadow-2xl backdrop-blur-xl animate-fade-in pointer-events-auto">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors cursor-pointer text-xl font-sans"
        >
          &times;
        </button>

        {isDev && isFallbackMode && (
          <div className="mb-4 text-[9px] font-mono bg-yellow-950/20 border border-yellow-900/40 text-yellow-400 px-3 py-2 rounded">
            ⚠️ [DEV WARNING] Supabase is unconfigured or unavailable. Using localStorage fallback.
          </div>
        )}

        {!isSuccess ? (
          <>
            <div className="text-center mb-6">
              <span className="inline-block px-3 py-0.5 rounded-full bg-[#00ffc8]/10 text-[#00ffc8] text-[9px] font-mono tracking-widest uppercase border border-[#00ffc8]/20 mb-2">
                Genesis Explorer Node
              </span>
              <h2 className="text-2xl font-bold font-['Bebas_Neue'] text-white tracking-[2px] uppercase">
                Join the MMINT Genesis Airdrop
              </h2>
              <p className="text-xs font-mono text-zinc-400 mt-2 leading-relaxed">
                Be among the earliest members of the Million Mint civilization. Register to receive future airdrop announcements, eligibility updates, and genesis community access.
              </p>
            </div>

            {/* Waitlist status/stats */}
            {supabaseCount !== null ? (
              <div className="bg-black/40 border border-zinc-800/50 p-4 rounded text-center mb-6">
                <div className="text-2xl font-bold font-mono text-[#00ffc8] tracking-wider">
                  {supabaseCount.toLocaleString()}
                </div>
                <div className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mt-1">
                  Verified Explorer Registrations
                </div>
              </div>
            ) : (
              <div className="bg-black/40 border border-zinc-800/50 p-4 rounded text-center mb-6">
                <div className="text-sm font-bold font-mono text-[#f5c842] tracking-widest uppercase">
                  Genesis Airdrop Registration Open
                </div>
                <div className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mt-1">
                  Explorer Registration Active
                </div>
              </div>
            )}


            {errorMessage && (
              <div className="mb-4 text-xs font-mono bg-red-950/40 border border-red-900/60 text-red-400 p-3 rounded">
                ⚠️ {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
              <div>
                <label className="block text-zinc-400 mb-1.5 uppercase tracking-wider text-[10px]">
                  Name <span className="text-zinc-600">(Optional)</span>
                </label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Explorer Kalyan"
                  className="w-full bg-black border border-zinc-800 text-white rounded p-3 focus:outline-none focus:border-[#00ffc8] transition-colors"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1.5 uppercase tracking-wider text-[10px]">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. kalyan@millionmint.space"
                  className="w-full bg-black border border-zinc-800 text-white rounded p-3 focus:outline-none focus:border-[#00ffc8] transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 mb-1.5 uppercase tracking-wider text-[10px]">
                    X / Twitter <span className="text-zinc-600">(Optional)</span>
                  </label>
                  <input 
                    type="text" 
                    value={xUsername}
                    onChange={(e) => setXUsername(e.target.value)}
                    placeholder="@username"
                    className="w-full bg-black border border-zinc-800 text-white rounded p-3 focus:outline-none focus:border-[#00ffc8] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1.5 uppercase tracking-wider text-[10px]">
                    Telegram <span className="text-zinc-600">(Optional)</span>
                  </label>
                  <input 
                    type="text" 
                    value={telegramUsername}
                    onChange={(e) => setTelegramUsername(e.target.value)}
                    placeholder="t.me/username"
                    className="w-full bg-black border border-zinc-800 text-white rounded p-3 focus:outline-none focus:border-[#00ffc8] transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-6 bg-[#f5c842] hover:bg-[#ebd281] text-black font-bold uppercase tracking-wider p-4 rounded transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                    SYNCING TELEMETRY...
                  </>
                ) : "Join Genesis Airdrop"}
              </button>
            </form>
          </>
        ) : (
          /* SUCCESS SCREEN */
          <div className="text-center font-mono py-4">
            <div className="w-16 h-16 bg-[#00ffc8]/10 border border-[#00ffc8] rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-[#00ffc8]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold font-['Bebas_Neue'] text-white tracking-[2px] uppercase mb-4">
              Welcome to Million Mint Genesis
            </h2>
            
            <div className="text-xs text-zinc-300 space-y-4 text-left leading-relaxed border-t border-b border-zinc-800/80 py-4 my-4">
              <p>✓ Your registration has been received successfully.</p>
              <p>✓ You are now eligible to receive future MMINT Genesis Program updates and potential airdrop eligibility announcements.</p>
              <p>✓ Follow our official channels for upcoming missions and priority activities.</p>
            </div>

            <div className="flex flex-col gap-3 mt-6">
              <a 
                href="https://x.com/millionmint" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full p-3 border border-zinc-800 hover:border-white bg-zinc-900/40 text-white rounded text-xs transition-colors block text-center"
              >
                Follow Million Mint on X
              </a>
              <a 
                href="https://t.me/millionmint" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full p-3 border border-zinc-800 hover:border-white bg-zinc-900/40 text-white rounded text-xs transition-colors block text-center"
              >
                Join Telegram Community
              </a>
              <button
                onClick={onClose}
                className="w-full mt-4 p-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded text-xs cursor-pointer transition-colors"
              >
                Close Window
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

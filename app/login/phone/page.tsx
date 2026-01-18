"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect, Suspense } from "react";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";

function PhoneAuthContent() {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirectUri = searchParams.get("redirect_uri");
  const state = searchParams.get("state");

  useEffect(() => {
    const setupRecaptcha = () => {
      if (!(window as any).recaptchaVerifier) {
        (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
          size: "invisible",
        });
      }
    };

    setupRecaptcha();

    return () => {
      if ((window as any).recaptchaVerifier) {
        (window as any).recaptchaVerifier.clear();
        (window as any).recaptchaVerifier = null;
      }
    };
  }, []);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const appVerifier = (window as any).recaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, phone, appVerifier);
      setConfirmationResult(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await confirmationResult.confirm(code);
      const token = await result.user.getIdToken();

      if (redirectUri) {
        const params = new URLSearchParams();
        params.set("token", token);
        if (state) params.set("state", state);
        params.set("user_id", result.user.uid);
        params.set("phone", result.user.phoneNumber || "");

        window.location.href = `${redirectUri}?${params.toString()}`;
      } else {
        router.push("/");
      }
    } catch (err: any) {
      setError("Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      <div className="flex-1 flex flex-col">
        <div className="p-6">
          <Image src="/tnsa.svg" alt="TNSA" width={60} height={60} />
        </div>

        <div className="flex-1 flex items-center justify-center px-4">
          <div className="w-full max-w-sm space-y-8">
            <div className="text-center space-y-8">
              <h1 className="text-3xl font-normal">
                {confirmationResult ? "Enter verification code" : "Enter your phone number"}
              </h1>

              {!confirmationResult ? (
                <form onSubmit={handleSendCode} className="space-y-4">
                  <Input
                    type="tel"
                    placeholder="+1 234 567 8900"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="h-12 rounded-full border-gray-300 px-4"
                    required
                    autoFocus
                  />
                  {error && <p className="text-sm text-red-600">{error}</p>}
                  <Button
                    type="submit"
                    className="w-full h-12 rounded-full bg-black hover:bg-gray-800 text-white"
                    disabled={loading}
                  >
                    {loading ? "Sending..." : "Send code"}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleVerifyCode} className="space-y-4">
                  <Input
                    type="text"
                    placeholder="123456"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="h-12 rounded-full border-gray-300 px-4"
                    required
                    autoFocus
                    maxLength={6}
                  />
                  {error && <p className="text-sm text-red-600">{error}</p>}
                  <Button
                    type="submit"
                    className="w-full h-12 rounded-full bg-black hover:bg-gray-800 text-white"
                    disabled={loading}
                  >
                    {loading ? "Verifying..." : "Verify"}
                  </Button>
                </form>
              )}

              <button
                onClick={() => router.back()}
                className="text-sm text-blue-600 hover:underline"
              >
                Back
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex lg:w-1/2 bg-white items-center justify-center p-8">
        <Image
          src="/igen1.png"
          alt="TNSA Showcase"
          width={600}
          height={600}
          className="rounded-lg"
        />
      </div>

      <div id="recaptcha-container"></div>
    </div>
  );
}

export default function PhoneAuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>}>
      <PhoneAuthContent />
    </Suspense>
  );
}

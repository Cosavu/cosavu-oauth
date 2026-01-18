"use client";

export const dynamic = 'force-dynamic';

import { useState, Suspense } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { decodeParams } from "@/lib/hash-utils";

function PasswordContent() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const hash = searchParams.get("h");
  const decodedParams = hash ? decodeParams(hash) : {};

  const email = decodedParams.email || searchParams.get("email") || "";
  const redirectUri = decodedParams.redirect_uri || "https://chat.tnsaai.com";
  const state = decodedParams.state;
  const platform = decodedParams.platform;
  const mode = searchParams.get("mode");
  const isSignUp = mode === "signup";
  const isAndroid = platform === "android";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (isSignUp && password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (isSignUp && password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      let result;
      if (isSignUp) {
        result = await createUserWithEmailAndPassword(auth, email, password);
      } else {
        result = await signInWithEmailAndPassword(auth, email, password);
      }

      const token = await result.user.getIdToken();

      const params = new URLSearchParams();
      params.set("token", token);
      params.set("user_id", result.user.uid);
      params.set("email", result.user.email || "");
      if (state) params.set("state", state);

      if (isAndroid) {
        const deepLink = `genschat://auth?${params.toString()}`;

        window.location.href = deepLink;

        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = deepLink;
        document.body.appendChild(iframe);

        setTimeout(() => {
          try {
            window.open(deepLink, '_self');
          } catch (e) {
            const link = document.createElement('a');
            link.href = deepLink;
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
          }
        }, 500);

        setTimeout(() => {
          document.body.innerHTML = `
            <div class="min-h-screen flex bg-white">
              <div class="flex-1 flex flex-col">
                <div class="p-6">
                  <svg width="60" height="60" viewBox="0 0 720 720" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clip-path="url(#clip0_46_2)">
                      <rect width="720" height="720" rx="360" fill="white"/>
                      <path d="M300.776 189.5H329.576C336.776 189.5 342.776 192.2 347.576 197.6C352.976 202.4 355.676 208.4 355.676 215.6V244.4C355.676 251.6 352.976 257.9 347.576 263.3C342.776 268.1 336.776 270.5 329.576 270.5H300.776C293.576 270.5 287.276 268.1 281.876 263.3C277.076 257.9 274.676 251.6 274.676 244.4V215.6C274.676 208.4 277.076 202.4 281.876 197.6C287.276 192.2 293.576 189.5 300.776 189.5Z" fill="black"/>
                    </g>
                  </svg>
                </div>
                <div class="flex-1 flex items-center justify-center px-4">
                  <div class="w-full max-w-sm space-y-8">
                    <div class="text-center space-y-8">
                      <h1 class="text-3xl font-normal">Authentication successful</h1>
                      <p class="text-sm text-gray-600">You can now return to the GensChat app</p>
                      <button onclick="window.location.href='${deepLink}'" class="w-full h-12 rounded-full bg-black hover:bg-gray-800 text-white font-medium transition-colors">
                        Open GensChat App
                      </button>
                      <p class="text-xs text-gray-500">You can close this browser tab</p>
                    </div>
                  </div>
                </div>
              </div>
              <div class="hidden lg:flex lg:w-1/2 bg-white items-center justify-center p-8">
                <img src="/igen1.png" alt="TNSA Showcase" class="rounded-lg" width="600" height="600" />
              </div>
            </div>
          `;
        }, 1500);
      } else {
        window.location.href = `${redirectUri}/authredirect?${params.toString()}`;
      }
    } catch (err: any) {
      if (err.code === "auth/wrong-password") {
        setError("Incorrect password");
      } else if (err.code === "auth/user-not-found") {
        setError("No account found with this email");
      } else if (err.code === "auth/email-already-in-use") {
        setError("Email already in use");
      } else {
        setError(err.message);
      }
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
              <div>
                <h1 className="text-3xl font-normal">
                  {isSignUp ? "Create your password" : "Enter your password"}
                </h1>
                <p className="text-sm text-gray-600 mt-2">{email}</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 rounded-full border-gray-300 px-4"
                  required
                  autoFocus
                />
                {isSignUp && (
                  <Input
                    type="password"
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-12 rounded-full border-gray-300 px-4"
                    required
                  />
                )}
                {error && <p className="text-sm text-red-600">{error}</p>}
                <Button
                  type="submit"
                  className="w-full h-12 rounded-full bg-black hover:bg-gray-800 text-white"
                  disabled={loading}
                >
                  {loading ? "Loading..." : "Continue"}
                </Button>
              </form>

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
    </div>
  );
}

export default function PasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>}>
      <PasswordContent />
    </Suspense>
  );
}

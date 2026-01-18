"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState, Suspense } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

function AuthorizeContent() {
  const searchParams = useSearchParams();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const clientId = searchParams.get("client_id");
  const redirectUri = searchParams.get("redirect_uri");
  const state = searchParams.get("state");
  const scope = searchParams.get("scope");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        window.location.href = `/login?redirect_uri=${encodeURIComponent(redirectUri || "")}&state=${state || ""}`;
      } else {
        setUser(currentUser);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [redirectUri, state]);

  const handleAuthorize = async () => {
    if (!user) return;

    try {
      const token = await user.getIdToken();
      const params = new URLSearchParams({
        token,
        state: state || "",
      });

      window.location.href = `${redirectUri}?${params.toString()}`;
    } catch (error) {
      console.error("Authorization error:", error);
    }
  };

  const handleDeny = () => {
    window.location.href = `${redirectUri}?error=access_denied&state=${state || ""}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <Image src="/tnsa.svg" alt="TNSA" width={80} height={80} />
          </div>
          <CardTitle className="text-center text-2xl">Authorize Application</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              <strong>Application:</strong> {clientId}
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>Permissions:</strong> {scope || "Basic profile"}
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>Signed in as:</strong> {user?.email}
            </p>
          </div>

          <div className="space-y-2">
            <Button onClick={handleAuthorize} className="w-full">
              Authorize
            </Button>
            <Button onClick={handleDeny} variant="outline" className="w-full">
              Deny
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AuthorizePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>}>
      <AuthorizeContent />
    </Suspense>
  );
}

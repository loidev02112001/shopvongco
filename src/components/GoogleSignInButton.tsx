/**
 * UC03 – Đăng nhập bằng Google
 *
 * Sử dụng Google Identity Services (GSI) để xác thực người dùng.
 * Không cần backend — decode JWT ID token trực tiếp trong browser.
 *
 * Cấu hình: thêm VITE_GOOGLE_CLIENT_ID vào file .env.local
 * Lấy Client ID tại: https://console.cloud.google.com/apis/credentials
 */

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { storeActions } from "@/lib/store";

// Local type (mirrors the global GoogleCredentialResponse)
type GsiCredentialResponse = {
  credential: string;
  select_by: string;
};


// ── Helpers ────────────────────────────────────────────────────────────────

/**
 * Decode Google JWT payload (demo only — không verify signature).
 * Google tự verify token phía client khi dùng GSI.
 */
function decodeGoogleJwt(token: string): {
  sub: string;
  email: string;
  name: string;
  picture?: string;
  email_verified: boolean;
} {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(json);
  } catch {
    throw new Error("Invalid Google JWT");
  }
}

/** Load Google Identity Services script nếu chưa có */
function loadGsiScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve();
      return;
    }
    const existing = document.getElementById("google-gsi-script");
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", reject);
      return;
    }
    const script = document.createElement("script");
    script.id = "google-gsi-script";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google GSI script"));
    document.head.appendChild(script);
  });
}

// ── Props ──────────────────────────────────────────────────────────────────

interface GoogleSignInButtonProps {
  onSuccess: () => void;
  mode?: "signin" | "signup";
}

// ── Component ──────────────────────────────────────────────────────────────

export function GoogleSignInButton({ onSuccess, mode = "signin" }: GoogleSignInButtonProps) {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
  const buttonRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "no_client_id" | "error">(
    clientId && clientId !== "YOUR_GOOGLE_CLIENT_ID_HERE" ? "loading" : "no_client_id",
  );

  useEffect(() => {
    if (status === "no_client_id") return;

    loadGsiScript()
      .then(() => {
        if (!window.google?.accounts?.id) {
          setStatus("error");
          return;
        }

        // Khởi tạo GSI với callback
        window.google.accounts.id.initialize({
          client_id: clientId!,
          callback: handleCredentialResponse,
          context: mode === "signup" ? "signup" : "signin",
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        // Render nút Google chính thức
        if (buttonRef.current) {
          window.google.accounts.id.renderButton(buttonRef.current, {
            theme: "outline",
            size: "large",
            text: mode === "signup" ? "signup_with" : "continue_with",
            shape: "rectangular",
            logo_alignment: "left",
            width: buttonRef.current.offsetWidth || 400,
            locale: "vi",
          });
        }

        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, [clientId, mode]);

  // ── Xử lý credential từ Google ──────────────────────────────────────────

  const handleCredentialResponse = async (response: GsiCredentialResponse) => {
    try {
      const payload = decodeGoogleJwt(response.credential);

      if (!payload.email_verified) {
        toast.error("Email Google chưa được xác minh", {
          description: "Vui lòng xác minh email Google trước khi đăng nhập.",
        });
        return;
      }

      const result = await storeActions.loginWithGoogle({
        googleId: payload.sub,
        email: payload.email,
        fullName: payload.name,
        avatar: payload.picture,
      });

      if (!result.ok) {
        if (result.error === "Your account has been locked") {
          toast.error("Tài khoản bị khóa", {
            description: "Your account has been locked. Vui lòng liên hệ hỗ trợ.",
            duration: 6000,
          });
        } else {
          toast.error("Đăng nhập Google thất bại", { description: result.error });
        }
        return;
      }

      if (result.isNew) {
        toast.success(`Chào mừng đến với Luna Jewel, ${result.user.fullName}! 🎉`, {
          description: "Tài khoản của bạn đã được tạo thành công qua Google.",
        });
      } else {
        toast.success(`Chào mừng trở lại, ${result.user.fullName}! 👋`, {
          description: "Đăng nhập thành công qua tài khoản Google.",
        });
      }

      onSuccess();
    } catch {
      toast.error("Lỗi xác thực Google", {
        description: "Không thể xử lý thông tin từ Google. Vui lòng thử lại.",
      });
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────

  if (status === "no_client_id") {
    return <GoogleDevModeButton onSuccess={onSuccess} mode={mode} />;
  }

  if (status === "error") {
    return (
      <div className="w-full flex items-center justify-center gap-2 py-3 border border-red-200 rounded-lg bg-red-50 text-sm text-red-600">
        <span>⚠️ Không thể tải Google Sign-In. Kiểm tra kết nối mạng.</span>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Container cho Google render nút chính thức */}
      <div
        ref={buttonRef}
        id="google-signin-button"
        className="w-full flex justify-center"
        style={{ minHeight: 44 }}
      />
      {status === "loading" && (
        <div className="w-full flex items-center justify-center gap-2 py-3 border border-border rounded-lg text-sm text-muted-foreground animate-pulse">
          <GoogleIcon />
          Đang tải Google Sign-In...
        </div>
      )}
    </div>
  );
}

// ── Dev Mode Button (khi chưa có Client ID) ────────────────────────────────

/**
 * Nút giả lập Google Sign-In cho môi trường dev/demo
 * Cho phép nhập thông tin Google profile thủ công để test flow
 */
function GoogleDevModeButton({
  onSuccess,
  mode,
}: {
  onSuccess: () => void;
  mode: "signin" | "signup";
}) {
  const [showModal, setShowModal] = useState(false);
  const [devForm, setDevForm] = useState({
    name: "Nguyễn Văn Demo",
    email: "demo.google@gmail.com",
  });

  const handleDevLogin = async () => {
    const result = await storeActions.loginWithGoogle({
      googleId: "google_dev_" + Date.now(),
      email: devForm.email,
      fullName: devForm.name,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(devForm.name)}&background=4285F4&color=fff&size=128`,
    });

    if (!result.ok) {
      toast.error("Lỗi", { description: result.error });
      return;
    }

    setShowModal(false);
    if (result.isNew) {
      toast.success(`Chào mừng, ${result.user.fullName}! 🎉`, {
        description: "[DEV] Tài khoản Google giả lập đã được tạo.",
      });
    } else {
      toast.success(`Chào mừng trở lại, ${result.user.fullName}! 👋`, {
        description: "[DEV] Đăng nhập Google giả lập thành công.",
      });
    }
    onSuccess();
  };

  return (
    <>
      <button
        id="login-google"
        type="button"
        onClick={() => setShowModal(true)}
        className="w-full flex items-center justify-center gap-3 py-3 border border-border
          rounded-lg text-sm font-medium text-foreground hover:bg-muted/40 transition-all
          relative group"
        title="Chưa cấu hình VITE_GOOGLE_CLIENT_ID — click để dùng chế độ demo"
      >
        <GoogleIcon />
        {mode === "signup" ? "Đăng ký bằng Google" : "Đăng nhập bằng Google"}
        <span className="absolute -top-2 -right-2 bg-amber-400 text-[9px] text-white font-bold px-1 rounded">
          DEV
        </span>
      </button>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                <GoogleIcon />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Google Sign-In (Dev Mode)</h3>
                <p className="text-xs text-muted-foreground">Giả lập Google OAuth để test</p>
              </div>
            </div>

            {/* Dev notice */}
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
              <p className="font-semibold">⚠️ Chế độ phát triển</p>
              <p className="mt-0.5">
                Thêm <code className="bg-amber-100 px-1 rounded">VITE_GOOGLE_CLIENT_ID</code> vào{" "}
                <code className="bg-amber-100 px-1 rounded">.env.local</code> để dùng Google OAuth thật.
              </p>
            </div>

            {/* Form */}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Tên Google
                </label>
                <input
                  value={devForm.name}
                  onChange={(e) => setDevForm((f) => ({ ...f, name: e.target.value }))}
                  className="mt-1 w-full border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Email Google
                </label>
                <input
                  type="email"
                  value={devForm.email}
                  onChange={(e) => setDevForm((f) => ({ ...f, email: e.target.value }))}
                  className="mt-1 w-full border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2 border border-border rounded-lg text-sm text-muted-foreground hover:bg-muted/40 transition"
              >
                Hủy
              </button>
              <button
                id="google-dev-confirm"
                onClick={handleDevLogin}
                className="flex-1 py-2 bg-[#4285F4] text-white rounded-lg text-sm font-semibold hover:bg-[#3574e2] transition flex items-center justify-center gap-2"
              >
                <GoogleIcon className="text-white" />
                Đăng nhập
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── Google Icon SVG ────────────────────────────────────────────────────────

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={`w-4 h-4 shrink-0 ${className ?? ""}`}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

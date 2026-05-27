import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  CheckCircle2,
  AlertCircle,
  Phone,
  Camera,
  MapPin,
  Plus,
  Trash2,
  Edit,
  Check,
  Cloud,
  CloudOff,
  X,
} from "lucide-react";
import { TopBar, NavBar, Footer } from "@/components/SiteChrome";
import { storeActions, useStore } from "@/lib/store";
import { isSupabaseConfigured } from "@/lib/supabase";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";

const PROVINCES: Record<string, string[]> = {
  "Hà Nội": ["Ba Đình", "Hoàn Kiếm", "Cầu Giấy", "Đống Đa", "Thạch Thất"],
  "Hồ Chí Minh": ["Quận 1", "Quận 3", "Quận 7", "Bình Thạnh", "Thủ Đức"],
  "Đà Nẵng": ["Hải Châu", "Thanh Khê", "Sơn Trà", "Ngũ Hành Sơn"],
  "Hải Phòng": ["Hồng Bàng", "Lê Chân", "Ngô Quyền"],
};

const WARDS: Record<string, string[]> = {
  "Ba Đình": ["Trúc Bạch", "Vĩnh Phúc", "Cống Vị", "Kim Mã"],
  "Hoàn Kiếm": ["Hàng Bạc", "Hàng Trống", "Hàng Bông", "Tràng Tiền"],
  "Cầu Giấy": ["Dịch Vọng", "Nghĩa Tân", "Mai Dịch", "Yên Hòa"],
  "Đống Đa": ["Láng Hạ", "Láng Thượng", "Quang Trung", "Ô Chợ Dừa"],
  "Thạch Thất": ["Liên Quan", "Hương Ngải", "Canh Nậu", "Kim Quan"],
  "Quận 1": ["Bến Nghé", "Bến Thành", "Đa Kao", "Tân Định"],
  "Quận 3": ["Võ Thị Sáu", "Phường 1", "Phường 2", "Phường 3"],
  "Quận 7": ["Tân Phong", "Tân Quy", "Phú Mỹ", "Bình Thuận"],
  "Bình Thạnh": ["Phường 15", "Phường 17", "Phường 19", "Phường 21"],
  "Thủ Đức": ["Thảo Điền", "An Phú", "Hiệp Bình Chánh", "Linh Tây"],
  "Hải Châu": ["Hải Châu I", "Hải Châu II", "Thạch Thang", "Thanh Bình"],
  "Thanh Khê": ["Vĩnh Trung", "Tân Chính", "Thạc Gián", "Chính Gián"],
  "Sơn Trà": ["An Hải Bắc", "An Hải Tây", "An Hải Đông", "Mân Thái"],
  "Ngũ Hành Sơn": ["Mỹ An", "Khuê Mỹ", "Hòa Quý", "Hòa Hải"],
  "Hồng Bàng": ["Minh Khai", "Hoàng Văn Thụ", "Thượng Lý", "Hạ Lý"],
  "Lê Chân": ["Cát Dài", "An Biên", "Lam Sơn", "Trần Nguyên Hãn"],
  "Ngô Quyền": ["Máy Chai", "Cầu Đất", "Lạch Tray", "Đằng Giang"],
};

// ── Zod Schemas ────────────────────────────────────────────────────────────

const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(2, "Họ tên phải có ít nhất 2 ký tự")
      .max(50, "Họ tên không được vượt quá 50 ký tự")
      .regex(/^[\p{L}\s]+$/u, "Họ tên chỉ được chứa chữ cái và khoảng trắng"),
    email: z.string().email("Email không đúng định dạng"),
    password: z
      .string()
      .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
      .regex(/[A-Z]/, "Phải có ít nhất 1 chữ hoa")
      .regex(/[0-9]/, "Phải có ít nhất 1 chữ số"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Password confirmation does not match",
    path: ["confirmPassword"],
  });

const loginSchema = z.object({
  email: z.string().email("Email không đúng định dạng"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

type RegisterForm = z.infer<typeof registerSchema>;
type LoginForm = z.infer<typeof loginSchema>;

// ── Route ──────────────────────────────────────────────────────────────────

export const Route = createFileRoute("/tai-khoan")({
  head: () => ({
    meta: [
      { title: "Tài khoản — Luna Jewel" },
      {
        name: "description",
        content: "Đăng ký hoặc đăng nhập tài khoản Luna Jewel của bạn.",
      },
    ],
  }),
  component: AccountPage,
});

// ── Shared input wrapper ───────────────────────────────────────────────────

function FieldWrapper({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-semibold uppercase tracking-wider text-foreground/60">
        {label}
      </label>
      {children}
      {error && (
        <p className="flex items-center gap-1 text-xs text-destructive">
          <AlertCircle className="w-3 h-3 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

// ── Password strength bar ──────────────────────────────────────────────────

function PasswordStrength({ value }: { value: string }) {
  const checks = [
    { label: "8+ ký tự", ok: value.length >= 8 },
    { label: "Chữ hoa", ok: /[A-Z]/.test(value) },
    { label: "Chữ số", ok: /[0-9]/.test(value) },
  ];
  const score = checks.filter((c) => c.ok).length;
  const colors = ["bg-destructive", "bg-orange-400", "bg-yellow-400", "bg-green-500"];
  const labels = ["", "Yếu", "Trung bình", "Mạnh"];

  if (!value) return null;
  return (
    <div className="space-y-1.5">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i < score ? colors[score] : "bg-border"
            }`}
          />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex gap-3">
          {checks.map((c) => (
            <span
              key={c.label}
              className={`text-[11px] flex items-center gap-0.5 ${c.ok ? "text-green-600" : "text-muted-foreground"}`}
            >
              <CheckCircle2 className={`w-3 h-3 ${c.ok ? "opacity-100" : "opacity-30"}`} />
              {c.label}
            </span>
          ))}
        </div>
        {score > 0 && (
          <span className={`text-[11px] font-semibold ${score === 3 ? "text-green-600" : "text-orange-500"}`}>
            {labels[score]}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Register Form (UC01) ───────────────────────────────────────────────────

function RegisterForm({ onSuccess }: { onSuccess: () => void }) {
  const [showPw, setShowPw] = useState(false);
  const [showCpw, setShowCpw] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
  });

  const passwordValue = watch("password", "");

  const onSubmit = async (data: RegisterForm) => {
    const result = await storeActions.register({
      fullName: data.fullName,
      email: data.email,
      password: data.password,
    });

    if (!result.ok) {
      if (result.error === "Email already exists") {
        toast.error("Email đã tồn tại", {
          description: "Email này đã được sử dụng. Vui lòng đăng nhập hoặc dùng email khác.",
        });
      } else {
        toast.error("Đăng ký thất bại", { description: result.error });
      }
      return;
    }

    toast.success("Đăng ký thành công! 🎉", {
      description: `Chào mừng ${result.user.fullName} đến với Luna Jewel!`,
    });
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {/* Họ và tên */}
      <FieldWrapper label="Họ và tên *" error={errors.fullName?.message}>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand/60" />
          <input
            id="register-fullname"
            {...register("fullName")}
            placeholder="Nguyễn Văn A"
            autoComplete="name"
            className={`w-full pl-10 pr-4 py-3 border rounded-lg text-sm outline-none transition-all
              ${errors.fullName
                ? "border-destructive bg-destructive/5 focus:border-destructive focus:ring-2 focus:ring-destructive/20"
                : "border-border focus:border-brand focus:ring-2 focus:ring-brand/20"
              }`}
          />
        </div>
      </FieldWrapper>

      {/* Email */}
      <FieldWrapper label="Email *" error={errors.email?.message}>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand/60" />
          <input
            id="register-email"
            {...register("email")}
            type="email"
            placeholder="example@email.com"
            autoComplete="email"
            className={`w-full pl-10 pr-4 py-3 border rounded-lg text-sm outline-none transition-all
              ${errors.email
                ? "border-destructive bg-destructive/5 focus:border-destructive focus:ring-2 focus:ring-destructive/20"
                : "border-border focus:border-brand focus:ring-2 focus:ring-brand/20"
              }`}
          />
        </div>
      </FieldWrapper>

      {/* Mật khẩu */}
      <FieldWrapper label="Mật khẩu *" error={errors.password?.message}>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand/60" />
          <input
            id="register-password"
            {...register("password")}
            type={showPw ? "text" : "password"}
            placeholder="Tối thiểu 8 ký tự"
            autoComplete="new-password"
            className={`w-full pl-10 pr-11 py-3 border rounded-lg text-sm outline-none transition-all
              ${errors.password
                ? "border-destructive bg-destructive/5 focus:border-destructive focus:ring-2 focus:ring-destructive/20"
                : "border-border focus:border-brand focus:ring-2 focus:ring-brand/20"
              }`}
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-brand transition"
            aria-label={showPw ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          >
            {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <PasswordStrength value={passwordValue} />
      </FieldWrapper>

      {/* Xác nhận mật khẩu */}
      <FieldWrapper label="Xác nhận mật khẩu *" error={errors.confirmPassword?.message}>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand/60" />
          <input
            id="register-confirm-password"
            {...register("confirmPassword")}
            type={showCpw ? "text" : "password"}
            placeholder="Nhập lại mật khẩu"
            autoComplete="new-password"
            className={`w-full pl-10 pr-11 py-3 border rounded-lg text-sm outline-none transition-all
              ${errors.confirmPassword
                ? "border-destructive bg-destructive/5 focus:border-destructive focus:ring-2 focus:ring-destructive/20"
                : "border-border focus:border-brand focus:ring-2 focus:ring-brand/20"
              }`}
          />
          <button
            type="button"
            onClick={() => setShowCpw((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-brand transition"
            aria-label={showCpw ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          >
            {showCpw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </FieldWrapper>

      {/* Submit */}
      <button
        id="register-submit"
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-brand text-brand-foreground rounded-lg py-3.5 text-sm font-semibold
          flex items-center justify-center gap-2 hover:brightness-105 active:scale-[0.99]
          transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-sm shadow-brand/20"
      >
        {isSubmitting ? (
          <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
        ) : (
          <UserPlus className="w-4 h-4" />
        )}
        Tạo tài khoản
      </button>

      <p className="text-center text-xs text-muted-foreground">
        Bằng cách đăng ký, bạn đồng ý với{" "}
        <a href="/dieu-khoan-dich-vu" className="text-brand hover:underline">
          Điều khoản dịch vụ
        </a>{" "}
        và{" "}
        <a href="/dich-vu" className="text-brand hover:underline">
          Chính sách bảo mật
        </a>{" "}
        của Luna Jewel.
      </p>

      {/* ── Divider + Google (UC03) ─────────────────────────────────────── */}
      <div className="relative flex items-center gap-3">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted-foreground">hoặc đăng ký với</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <GoogleSignInButton onSuccess={onSuccess} mode="signup" />
    </form>
  );
}

// ── Login Form (UC02) ──────────────────────────────────────────────────────

type LoginErrorType = "invalid_credentials" | "account_locked" | null;

function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [showPw, setShowPw] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loginError, setLoginError] = useState<LoginErrorType>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setLoginError(null);

    const result = await storeActions.login(data.email, data.password);

    if (!result.ok) {
      if (result.error === "Your account has been locked") {
        setLoginError("account_locked");
        toast.error("Tài khoản bị khóa", {
          description: "Your account has been locked. Vui lòng liên hệ bộ phận hỗ trợ.",
          duration: 6000,
        });
      } else {
        setLoginError("invalid_credentials");
        toast.error("Đăng nhập thất bại", {
          description: "Invalid email or password.",
        });
      }
      return;
    }

    toast.success(`Chào mừng trở lại, ${result.user.fullName}! 👋`, {
      description: "Bạn đã đăng nhập thành công vào hệ thống.",
    });
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>

      {/* ── Inline Error Banner ─────────────────────────────────────── */}
      {loginError && (
        <div
          role="alert"
          className={`flex items-start gap-3 px-4 py-3.5 rounded-lg border text-sm
            ${
              loginError === "account_locked"
                ? "bg-amber-50 border-amber-200 text-amber-800"
                : "bg-destructive/8 border-destructive/20 text-destructive"
            }`}
        >
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <div>
            {loginError === "account_locked" ? (
              <>
                <p className="font-semibold">Tài khoản của bạn đã bị khóa</p>
                <p className="text-xs mt-0.5 opacity-80">
                  Your account has been locked. Vui lòng{" "}
                  <a href="/ho-tro" className="underline font-medium">liên hệ hỗ trợ</a>{" "}
                  để được giải quyết.
                </p>
              </>
            ) : (
              <>
                <p className="font-semibold">Email hoặc mật khẩu không đúng</p>
                <p className="text-xs mt-0.5 opacity-80">
                  Invalid email or password. Kiểm tra lại và thử lại.
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Email ───────────────────────────────────────────────────── */}
      <FieldWrapper label="Email" error={errors.email?.message}>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand/60" />
          <input
            id="login-email"
            {...register("email")}
            type="email"
            placeholder="example@email.com"
            autoComplete="email"
            onChange={() => setLoginError(null)}
            className={`w-full pl-10 pr-4 py-3 border rounded-lg text-sm outline-none transition-all
              ${
                errors.email || loginError === "invalid_credentials"
                  ? "border-destructive bg-destructive/5 focus:border-destructive focus:ring-2 focus:ring-destructive/20"
                  : "border-border focus:border-brand focus:ring-2 focus:ring-brand/20"
              }`}
          />
        </div>
      </FieldWrapper>

      {/* ── Mật khẩu ────────────────────────────────────────────────── */}
      <FieldWrapper label="Mật khẩu" error={errors.password?.message}>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand/60" />
          <input
            id="login-password"
            {...register("password")}
            type={showPw ? "text" : "password"}
            placeholder="Mật khẩu của bạn"
            autoComplete="current-password"
            onChange={() => setLoginError(null)}
            className={`w-full pl-10 pr-11 py-3 border rounded-lg text-sm outline-none transition-all
              ${
                errors.password || loginError === "invalid_credentials"
                  ? "border-destructive bg-destructive/5 focus:border-destructive focus:ring-2 focus:ring-destructive/20"
                  : "border-border focus:border-brand focus:ring-2 focus:ring-brand/20"
              }`}
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-brand transition"
            aria-label={showPw ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          >
            {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </FieldWrapper>

      {/* ── Ghi nhớ + Quên mật khẩu ─────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            id="login-remember-me"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 rounded border-border accent-brand cursor-pointer"
          />
          <span className="text-xs text-foreground/70">Ghi nhớ đăng nhập</span>
        </label>
        <a
          href="/ho-tro"
          className="text-xs text-brand hover:underline font-medium"
        >
          Quên mật khẩu?
        </a>
      </div>

      {/* ── Submit ──────────────────────────────────────────────────── */}
      <button
        id="login-submit"
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-brand text-brand-foreground rounded-lg py-3.5 text-sm font-semibold
          flex items-center justify-center gap-2 hover:brightness-105 active:scale-[0.99]
          transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-sm shadow-brand/20"
      >
        {isSubmitting ? (
          <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
        ) : (
          <LogIn className="w-4 h-4" />
        )}
        Đăng nhập
      </button>

      {/* ── Divider + Google (UC03) ──────────────────────────────────────── */}
      <div className="relative flex items-center gap-3">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted-foreground">hoặc</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <GoogleSignInButton onSuccess={onSuccess} mode="signin" />
    </form>
  );
}

// ── Logged-in Profile Panel (UC10 - Quản lý Profile) ─────────────────────────

function ProfilePanel() {
  const { currentUser } = useStore();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sub-tab: profile vs addresses vs password
  const [activeSubTab, setActiveSubTab] = useState<"profile" | "addresses" | "password">("profile");

  // States cho đổi mật khẩu (UC12)
  const [passwordForm, setPasswordForm] = useState({
    currentPw: "",
    newPw: "",
    confirmNewPw: "",
  });
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmNewPw, setShowConfirmNewPw] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});

  const resetPasswordForm = () => {
    setPasswordForm({
      currentPw: "",
      newPw: "",
      confirmNewPw: "",
    });
    setShowCurrentPw(false);
    setShowNewPw(false);
    setShowConfirmNewPw(false);
    setPasswordErrors({});
  };

  // States quản lý form chỉnh sửa hồ sơ (UC10)
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(currentUser?.fullName || "");
  const [editPhone, setEditPhone] = useState(currentUser?.phone || "");
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});

  // States quản lý sổ địa chỉ (UC11)
  const [isAddingOrEditingAddress, setIsAddingOrEditingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

  const [addressForm, setAddressForm] = useState({
    recipientName: "",
    phone: "",
    province: "",
    district: "",
    ward: "",
    street: "",
    isDefault: false,
  });

  const [addressErrors, setAddressErrors] = useState<Record<string, string>>({});

  if (!currentUser) return null;

  const initials = currentUser.fullName
    .split(" ")
    .map((w) => w[0])
    .slice(-2)
    .join("")
    .toUpperCase();

  const handleLogout = () => {
    storeActions.logout();
    toast.info("Đã đăng xuất thành công");
    navigate({ to: "/" });
  };

  // Cập nhật Avatar qua FileReader (Base64 DataURL)
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn tệp hình ảnh hợp lệ!");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Kích thước ảnh không được lớn hơn 2MB!");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      storeActions.updateProfile({ avatar: dataUrl });
      toast.success("Thay đổi ảnh đại diện thành công! 📸");
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};

    const nameTrimmed = editName.trim();
    if (!nameTrimmed) {
      newErrors.name = "Họ tên không được để trống";
    } else if (nameTrimmed.length < 2) {
      newErrors.name = "Họ tên phải có ít nhất 2 ký tự";
    }

    const phoneTrimmed = editPhone.trim();
    if (phoneTrimmed) {
      const phoneRegex = /^(03|05|07|08|09)\d{8}$/;
      if (!phoneRegex.test(phoneTrimmed)) {
        newErrors.phone = "Số điện thoại Việt Nam không hợp lệ (ví dụ: 0912345678)";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    storeActions.updateProfile({
      fullName: nameTrimmed,
      phone: phoneTrimmed || undefined,
    });

    toast.success("Cập nhật thông tin cá nhân thành công! 🎉");
    setIsEditing(false);
    setErrors({});
  };

  const handleCancel = () => {
    setEditName(currentUser.fullName);
    setEditPhone(currentUser.phone || "");
    setIsEditing(false);
    setErrors({});
  };

  // Logic Sổ địa chỉ (UC11)
  const resetAddressForm = () => {
    setAddressForm({
      recipientName: "",
      phone: "",
      province: "",
      district: "",
      ward: "",
      street: "",
      isDefault: false,
    });
    setEditingAddressId(null);
    setIsAddingOrEditingAddress(false);
    setAddressErrors({});
  };

  const handleStartAddAddress = () => {
    resetAddressForm();
    setIsAddingOrEditingAddress(true);
  };

  const handleStartEditAddress = (addr: any) => {
    setAddressForm({
      recipientName: addr.recipientName,
      phone: addr.phone,
      province: addr.province,
      district: addr.district,
      ward: addr.ward,
      street: addr.street,
      isDefault: addr.isDefault,
    });
    setEditingAddressId(addr.id);
    setIsAddingOrEditingAddress(true);
    setAddressErrors({});
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};

    if (!addressForm.recipientName.trim()) {
      errs.recipientName = "Họ tên người nhận không được để trống";
    } else if (addressForm.recipientName.trim().length < 2) {
      errs.recipientName = "Họ tên phải có ít nhất 2 ký tự";
    }

    const phoneRegex = /^(03|05|07|08|09)\d{8}$/;
    if (!addressForm.phone.trim()) {
      errs.phone = "Số điện thoại không được để trống";
    } else if (!phoneRegex.test(addressForm.phone.trim())) {
      errs.phone = "Số điện thoại Việt Nam không hợp lệ (ví dụ: 0912345678)";
    }

    if (!addressForm.province) {
      errs.province = "Vui lòng chọn Tỉnh/Thành phố";
    }

    if (!addressForm.district) {
      errs.district = "Vui lòng chọn Quận/Huyện";
    }

    if (!addressForm.ward) {
      errs.ward = "Vui lòng chọn hoặc nhập Phường/Xã";
    }

    if (!addressForm.street.trim()) {
      errs.street = "Vui lòng nhập địa chỉ chi tiết (số nhà, tên đường)";
    }

    if (Object.keys(errs).length > 0) {
      setAddressErrors(errs);
      return;
    }

    const addressData = {
      recipientName: addressForm.recipientName.trim(),
      phone: addressForm.phone.trim(),
      province: addressForm.province,
      district: addressForm.district,
      ward: addressForm.ward,
      street: addressForm.street.trim(),
      isDefault: addressForm.isDefault,
    };

    if (editingAddressId) {
      storeActions.updateShippingAddress(editingAddressId, addressData);
      toast.success("Cập nhật địa chỉ thành công! 🎉");
    } else {
      storeActions.addShippingAddress(addressData);
      toast.success("Thêm địa chỉ giao hàng mới thành công! 🎉");
    }

    resetAddressForm();
  };

  const handleDeleteAddress = (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa địa chỉ này?")) {
      storeActions.deleteShippingAddress(id);
      toast.info("Đã xóa địa chỉ thành công");
    }
  };

  const handleSetDefaultAddress = (id: string) => {
    storeActions.setDefaultShippingAddress(id);
    toast.success("Đã đặt làm địa chỉ giao hàng mặc định! 📌");
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    const hasPasswordSet = storeActions.currentUserHasPassword();

    // Nếu tài khoản đã thiết lập mật khẩu, yêu cầu nhập mật khẩu hiện tại
    if (hasPasswordSet) {
      if (!passwordForm.currentPw) {
        errs.currentPw = "Vui lòng nhập mật khẩu hiện tại";
      }
    }

    // Kiểm tra mật khẩu mới
    const newPw = passwordForm.newPw;
    if (!newPw) {
      errs.newPw = "Vui lòng nhập mật khẩu mới";
    } else {
      if (newPw.length < 8) {
        errs.newPw = "Mật khẩu mới phải có ít nhất 8 ký tự";
      } else if (!/[A-Z]/.test(newPw)) {
        errs.newPw = "Mật khẩu mới phải chứa ít nhất 1 chữ in hoa";
      } else if (!/[0-9]/.test(newPw)) {
        errs.newPw = "Mật khẩu mới phải chứa ít nhất 1 chữ số";
      }
      
      if (hasPasswordSet && newPw === passwordForm.currentPw) {
        errs.newPw = "Mật khẩu mới không được trùng với mật khẩu cũ";
      }
    }

    // Kiểm tra xác nhận mật khẩu mới
    if (passwordForm.confirmNewPw !== newPw) {
      errs.confirmNewPw = "Xác nhận mật khẩu mới không khớp";
    }

    if (Object.keys(errs).length > 0) {
      setPasswordErrors(errs);
      return;
    }

    const res = await storeActions.changePassword({
      currentPw: passwordForm.currentPw,
      newPw: passwordForm.newPw,
    });

    if (!res.ok) {
      toast.error("Thay đổi mật khẩu thất bại", {
        description: res.error,
      });
      return;
    }

    toast.success("Thay đổi mật khẩu thành công! 🔑", {
      description: hasPasswordSet
        ? "Mật khẩu của bạn đã được cập nhật thành công."
        : "Đã thiết lập mật khẩu thành công. Giờ đây bạn có thể dùng mật khẩu này để đăng nhập.",
    });
    resetPasswordForm();
  };

  const roleBadge: Record<string, { label: string; color: string }> = {
    USER: { label: "Thành viên", color: "bg-brand-soft text-brand" },
    MANAGER: { label: "Quản lý", color: "bg-amber-100 text-amber-700" },
    ADMIN: { label: "Admin", color: "bg-red-100 text-red-700" },
  };
  const badge = roleBadge[currentUser.role] ?? roleBadge["USER"];

  const savedAddresses = currentUser.addresses || [];
  const districtOpts = addressForm.province ? PROVINCES[addressForm.province] || [] : [];
  const wardOpts = addressForm.district ? WARDS[addressForm.district] || [] : [];
  const hasPasswordSet = storeActions.currentUserHasPassword();

  return (
    <div className="space-y-6">
      {/* Avatar + name */}
      <div className="flex items-center gap-4 p-5 bg-gradient-to-r from-brand/10 to-brand-soft rounded-xl border border-brand/15">
        <div className="relative">
          {currentUser.avatar ? (
            <img
              src={currentUser.avatar}
              alt={currentUser.fullName}
              className="w-16 h-16 rounded-full object-cover ring-2 ring-brand/30 shadow-xs"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-brand text-brand-foreground flex items-center justify-center text-xl font-bold ring-2 ring-brand/20 shadow-xs">
              {initials}
            </div>
          )}
          {/* File Input Ẩn */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleAvatarChange}
            accept="image/*"
            className="hidden"
          />
          {/* Nút trigger upload */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-1 -right-1 w-6 h-6 bg-white border border-border rounded-full
              flex items-center justify-center hover:bg-brand-soft transition shadow-md active:scale-90"
            title="Thay đổi ảnh đại diện"
          >
            <Camera className="w-3 h-3 text-brand" />
          </button>
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-foreground truncate">{currentUser.fullName}</div>
          <div className="text-sm text-muted-foreground truncate">{currentUser.email}</div>
          <span className={`mt-1.5 inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${badge.color}`}>
            {badge.label}
          </span>
        </div>
      </div>

      {/* Sub-tabs Navigation */}
      <div className="flex border-b border-border pb-px gap-1">
        <button
          onClick={() => setActiveSubTab("profile")}
          className={`flex-1 md:flex-none px-5 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all duration-200
            ${
              activeSubTab === "profile"
                ? "border-brand text-brand bg-brand-soft/20 rounded-t-lg font-extrabold"
                : "border-transparent text-muted-foreground hover:text-foreground font-semibold"
            }`}
        >
          👤 Thông tin cá nhân
        </button>
        <button
          onClick={() => {
            setActiveSubTab("addresses");
            resetAddressForm();
          }}
          className={`flex-1 md:flex-none px-5 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all duration-200
            ${
              activeSubTab === "addresses"
                ? "border-brand text-brand bg-brand-soft/20 rounded-t-lg font-extrabold"
                : "border-transparent text-muted-foreground hover:text-foreground font-semibold"
            }`}
        >
          📍 Sổ địa chỉ
        </button>
        <button
          onClick={() => {
            setActiveSubTab("password");
            resetPasswordForm();
          }}
          className={`flex-1 md:flex-none px-5 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all duration-200
            ${
              activeSubTab === "password"
                ? "border-brand text-brand bg-brand-soft/20 rounded-t-lg font-extrabold"
                : "border-transparent text-muted-foreground hover:text-foreground font-semibold"
            }`}
        >
          🔑 Đổi mật khẩu
        </button>
      </div>

      {/* Sub-tab: Profile Details */}
      {activeSubTab === "profile" && (
        <div className="space-y-5">
          {isEditing ? (
            <form onSubmit={handleSave} className="space-y-5.5 pt-2">
              <h3 className="text-xs font-bold text-brand uppercase tracking-widest">Cập nhật thông tin tài khoản</h3>

              {/* Input: Họ và tên */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/60 block">Họ và tên *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand/60" />
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg text-sm outline-none transition-all ${
                      errors.name
                        ? "border-destructive bg-destructive/5 focus:border-destructive"
                        : "border-border focus:border-brand focus:ring-1 focus:ring-brand"
                    }`}
                    required
                  />
                </div>
                {errors.name && (
                  <p className="text-xs text-destructive flex items-center gap-1.5 mt-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Input: Số điện thoại */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/60 block">Số điện thoại</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand/60" />
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="0912345678"
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg text-sm outline-none transition-all ${
                      errors.phone
                        ? "border-destructive bg-destructive/5 focus:border-destructive"
                        : "border-border focus:border-brand focus:ring-1 focus:ring-brand"
                    }`}
                  />
                </div>
                {errors.phone && (
                  <p className="text-xs text-destructive flex items-center gap-1.5 mt-1 font-medium leading-normal">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {errors.phone}
                  </p>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-brand text-brand-foreground py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest hover:opacity-95 shadow-sm transition active:scale-[0.98]"
                >
                  Lưu thay đổi
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 border border-brand/20 text-brand bg-white py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-brand-soft transition active:scale-[0.98]"
                >
                  Hủy bỏ
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-5">
              {/* Info grid */}
              <div className="grid grid-cols-1 gap-3">
                <InfoRow icon={<Mail className="w-4 h-4" />} label="Email" value={currentUser.email} />
                <InfoRow
                  icon={<Phone className="w-4 h-4" />}
                  label="Số điện thoại"
                  value={currentUser.phone || "Chưa cập nhật"}
                  dim={!currentUser.phone}
                />
                <InfoRow icon={<User className="w-4 h-4" />} label="Họ và tên" value={currentUser.fullName} />
              </div>

              {/* Edit Profile Action button */}
              <button
                onClick={() => setIsEditing(true)}
                className="w-full bg-brand-soft/75 border border-brand/20 text-brand py-3 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-brand hover:text-brand-foreground shadow-2xs active:scale-[0.98] transition-all"
              >
                Chỉnh sửa hồ sơ
              </button>
            </div>
          )}
        </div>
      )}

      {/* Sub-tab: Shipping Addresses Book (UC11) */}
      {activeSubTab === "addresses" && (
        <div className="space-y-5 animate-fadeIn">
          {isAddingOrEditingAddress ? (
            /* Form thêm/sửa địa chỉ */
            <form onSubmit={handleSaveAddress} className="space-y-4 pt-2">
              <h3 className="text-xs font-bold text-brand uppercase tracking-widest">
                {editingAddressId ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ nhận hàng mới"}
              </h3>

              {/* Tên người nhận */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/60 block">Họ tên người nhận *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand/60" />
                  <input
                    type="text"
                    value={addressForm.recipientName}
                    onChange={(e) => setAddressForm({ ...addressForm, recipientName: e.target.value })}
                    placeholder="Nguyễn Văn A"
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm outline-none transition-all ${
                      addressErrors.recipientName
                        ? "border-destructive bg-destructive/5 focus:border-destructive"
                        : "border-border focus:border-brand focus:ring-1 focus:ring-brand"
                    }`}
                  />
                </div>
                {addressErrors.recipientName && (
                  <p className="text-xs text-destructive flex items-center gap-1.5 mt-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {addressErrors.recipientName}
                  </p>
                )}
              </div>

              {/* SĐT người nhận */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/60 block">Số điện thoại liên hệ *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand/60" />
                  <input
                    type="tel"
                    value={addressForm.phone}
                    onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                    placeholder="0912345678"
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm outline-none transition-all ${
                      addressErrors.phone
                        ? "border-destructive bg-destructive/5 focus:border-destructive"
                        : "border-border focus:border-brand focus:ring-1 focus:ring-brand"
                    }`}
                  />
                </div>
                {addressErrors.phone && (
                  <p className="text-xs text-destructive flex items-center gap-1.5 mt-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {addressErrors.phone}
                  </p>
                )}
              </div>

              {/* Tỉnh thành + Quận huyện */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/60 block">Tỉnh / Thành phố *</label>
                  <select
                    value={addressForm.province}
                    onChange={(e) =>
                      setAddressForm({
                        ...addressForm,
                        province: e.target.value,
                        district: "",
                        ward: "",
                      })
                    }
                    className={`w-full bg-white border rounded-lg px-3 py-2.5 text-sm outline-none transition-all ${
                      addressErrors.province
                        ? "border-destructive focus:border-destructive"
                        : "border-border focus:border-brand"
                    }`}
                  >
                    <option value="">Chọn Tỉnh/Thành</option>
                    {Object.keys(PROVINCES).map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                  {addressErrors.province && (
                    <p className="text-xs text-destructive flex items-center gap-1 mt-1 font-medium">
                      {addressErrors.province}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/60 block">Quận / Huyện *</label>
                  <select
                    value={addressForm.district}
                    disabled={!addressForm.province}
                    onChange={(e) =>
                      setAddressForm({
                        ...addressForm,
                        district: e.target.value,
                        ward: "",
                      })
                    }
                    className={`w-full bg-white border rounded-lg px-3 py-2.5 text-sm outline-none transition-all disabled:opacity-50 ${
                      addressErrors.district
                        ? "border-destructive focus:border-destructive"
                        : "border-border focus:border-brand"
                    }`}
                  >
                    <option value="">Chọn Quận/Huyện</option>
                    {districtOpts.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                  {addressErrors.district && (
                    <p className="text-xs text-destructive flex items-center gap-1 mt-1 font-medium">
                      {addressErrors.district}
                    </p>
                  )}
                </div>
              </div>

              {/* Phường xã */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/60 block">Phường / Xã *</label>
                {wardOpts.length > 0 ? (
                  <select
                    value={addressForm.ward}
                    onChange={(e) => setAddressForm({ ...addressForm, ward: e.target.value })}
                    className={`w-full bg-white border rounded-lg px-3 py-2.5 text-sm outline-none transition-all ${
                      addressErrors.ward
                        ? "border-destructive focus:border-destructive"
                        : "border-border focus:border-brand"
                    }`}
                  >
                    <option value="">Chọn Phường/Xã</option>
                    {wardOpts.map((w) => (
                      <option key={w} value={w}>
                        {w}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand/60" />
                    <input
                      type="text"
                      value={addressForm.ward}
                      disabled={!addressForm.district}
                      onChange={(e) => setAddressForm({ ...addressForm, ward: e.target.value })}
                      placeholder="Nhập tên Phường/Xã..."
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm outline-none transition-all disabled:opacity-50 ${
                        addressErrors.ward
                          ? "border-destructive bg-destructive/5 focus:border-destructive"
                          : "border-border focus:border-brand"
                      }`}
                    />
                  </div>
                )}
                {addressErrors.ward && (
                  <p className="text-xs text-destructive flex items-center gap-1.5 mt-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {addressErrors.ward}
                  </p>
                )}
              </div>

              {/* Địa chỉ chi tiết */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/60 block">Số nhà, tên đường, ngõ hẻm *</label>
                <textarea
                  value={addressForm.street}
                  onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                  placeholder="Ví dụ: 123 Đường Trần Hưng Đạo, Ngõ 4"
                  rows={2}
                  className={`w-full bg-white border rounded-lg px-4 py-2.5 text-sm outline-none transition-all resize-none ${
                    addressErrors.street
                      ? "border-destructive focus:border-destructive"
                      : "border-border focus:border-brand"
                  }`}
                />
                {addressErrors.street && (
                  <p className="text-xs text-destructive flex items-center gap-1.5 mt-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {addressErrors.street}
                  </p>
                )}
              </div>

              {/* Checkbox Đặt làm mặc định */}
              <label className="flex items-center gap-2 pt-1 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={addressForm.isDefault}
                  onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                  className="w-4 h-4 rounded border-border accent-brand cursor-pointer"
                />
                <span className="text-xs text-foreground/75 font-semibold">Đặt làm địa chỉ nhận hàng mặc định</span>
              </label>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-3">
                <button
                  type="submit"
                  className="flex-1 bg-brand text-brand-foreground py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest hover:opacity-95 shadow-sm transition active:scale-[0.98]"
                >
                  Lưu địa chỉ
                </button>
                <button
                  type="button"
                  onClick={resetAddressForm}
                  className="flex-1 border border-brand/20 text-brand bg-white py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-brand-soft transition active:scale-[0.98]"
                >
                  Hủy bỏ
                </button>
              </div>
            </form>
          ) : (
            /* Danh sách các địa chỉ */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-brand uppercase tracking-widest">
                  Danh sách địa chỉ của bạn ({savedAddresses.length})
                </h3>
                <button
                  onClick={handleStartAddAddress}
                  className="text-xs font-bold text-brand flex items-center gap-1 bg-brand-soft/70 px-3.5 py-2 rounded-lg border border-brand/10 hover:bg-brand hover:text-brand-foreground transition-all"
                >
                  <Plus className="w-3.5 h-3.5" /> Thêm địa chỉ mới
                </button>
              </div>

              {savedAddresses.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-border rounded-xl px-4">
                  <MapPin className="w-10 h-10 text-muted-foreground/45 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-muted-foreground">Bạn chưa có địa chỉ giao hàng nào</p>
                  <p className="text-xs text-muted-foreground/70 mt-1 max-w-sm mx-auto">
                    Thêm địa chỉ giao hàng của bạn để quá trình mua sắm và thanh toán COD diễn ra thuận tiện, nhanh chóng hơn.
                  </p>
                  <button
                    onClick={handleStartAddAddress}
                    className="mt-4 bg-brand text-brand-foreground text-xs font-bold uppercase tracking-widest px-6 py-2.5 rounded-lg hover:brightness-105 shadow-sm transition"
                  >
                    Thêm địa chỉ đầu tiên
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3.5">
                  {savedAddresses.map((addr) => (
                    <div
                      key={addr.id}
                      className={`relative p-5 rounded-xl border transition-all duration-300 bg-white
                        ${
                          addr.isDefault
                            ? "border-brand ring-2 ring-brand/10 shadow-xs"
                            : "border-border hover:border-brand/40 shadow-2xs"
                        }`}
                    >
                      {/* Default badge */}
                      {addr.isDefault && (
                        <span className="absolute top-4 right-4 inline-flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-widest bg-brand text-brand-foreground px-2.5 py-0.5 rounded-full shadow-2xs">
                          <Check className="w-2.5 h-2.5 stroke-[3px]" /> Mặc định
                        </span>
                      )}

                      <div className="pr-20">
                        {/* Tên người nhận */}
                        <div className="font-extrabold text-foreground text-sm uppercase tracking-wide">
                          {addr.recipientName}
                        </div>

                        {/* SĐT */}
                        <div className="text-xs text-muted-foreground font-bold flex items-center gap-1.5 mt-1.5">
                          <Phone className="w-3.5 h-3.5 text-brand/60 shrink-0" /> {addr.phone}
                        </div>

                        {/* Địa chỉ */}
                        <div className="text-xs md:text-sm text-foreground/80 mt-3 leading-relaxed flex items-start gap-1">
                          <MapPin className="w-4 h-4 text-brand/60 shrink-0 mt-0.5" />
                          <span>
                            {addr.street}, {addr.ward}, {addr.district}, {addr.province}
                          </span>
                        </div>
                      </div>

                      {/* Các nút hành động */}
                      <div className="flex items-center gap-4 mt-5 pt-3 border-t border-muted">
                        {!addr.isDefault && (
                          <button
                            onClick={() => handleSetDefaultAddress(addr.id)}
                            className="text-[10px] font-bold text-brand uppercase tracking-widest hover:underline"
                          >
                            Đặt làm mặc định
                          </button>
                        )}
                        <button
                          onClick={() => handleStartEditAddress(addr)}
                          className="text-[10px] font-bold text-brand uppercase tracking-widest hover:underline flex items-center gap-1"
                        >
                          <Edit className="w-3.5 h-3.5" /> Sửa
                        </button>
                        <button
                          onClick={() => handleDeleteAddress(addr.id)}
                          className="text-[10px] font-bold text-destructive uppercase tracking-widest hover:underline flex items-center gap-1 ml-auto"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Xóa địa chỉ
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Sub-tab: Đổi mật khẩu (UC12) */}
      {activeSubTab === "password" && (
        <form onSubmit={handleSavePassword} className="space-y-4 pt-2 animate-fadeIn" noValidate>
          <h3 className="text-xs font-bold text-brand uppercase tracking-widest">
            {hasPasswordSet ? "Thay đổi mật khẩu" : "Thiết lập mật khẩu đầu tiên"}
          </h3>

          {!hasPasswordSet && (
            <div role="alert" className="flex items-start gap-3 px-4 py-3.5 rounded-lg border text-sm bg-amber-50 border-amber-200 text-amber-800">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold">Tài khoản Google chưa có mật khẩu</p>
                <p className="text-xs mt-0.5 opacity-85">
                  Tài khoản của bạn được liên kết qua tài khoản Google. Hãy thiết lập mật khẩu đầu tiên của bạn để có thể đăng nhập bằng email bình thường trong tương lai.
                </p>
              </div>
            </div>
          )}

          {/* Mật khẩu hiện tại */}
          {hasPasswordSet && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/60 block">Mật khẩu hiện tại *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand/60" />
                <input
                  type={showCurrentPw ? "text" : "password"}
                  value={passwordForm.currentPw}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPw: e.target.value })}
                  placeholder="Nhập mật khẩu hiện tại"
                  className={`w-full pl-10 pr-11 py-2.5 border rounded-lg text-sm outline-none transition-all ${
                    passwordErrors.currentPw
                      ? "border-destructive bg-destructive/5 focus:border-destructive"
                      : "border-border focus:border-brand focus:ring-1 focus:ring-brand"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-brand transition"
                >
                  {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passwordErrors.currentPw && (
                <p className="text-xs text-destructive flex items-center gap-1.5 mt-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {passwordErrors.currentPw}
                </p>
              )}
            </div>
          )}

          {/* Mật khẩu mới */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/60 block">Mật khẩu mới *</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand/60" />
              <input
                type={showNewPw ? "text" : "password"}
                value={passwordForm.newPw}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPw: e.target.value })}
                placeholder="Tối thiểu 8 ký tự"
                className={`w-full pl-10 pr-11 py-2.5 border rounded-lg text-sm outline-none transition-all ${
                  passwordErrors.newPw
                    ? "border-destructive bg-destructive/5 focus:border-destructive"
                    : "border-border focus:border-brand focus:ring-1 focus:ring-brand"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowNewPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-brand transition"
              >
                {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {passwordErrors.newPw && (
              <p className="text-xs text-destructive flex items-center gap-1.5 mt-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {passwordErrors.newPw}
              </p>
            )}
            <PasswordStrength value={passwordForm.newPw} />
          </div>

          {/* Xác nhận mật khẩu mới */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/60 block">Xác nhận mật khẩu mới *</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand/60" />
              <input
                type={showConfirmNewPw ? "text" : "password"}
                value={passwordForm.confirmNewPw}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmNewPw: e.target.value })}
                placeholder="Nhập lại mật khẩu mới"
                className={`w-full pl-10 pr-11 py-2.5 border rounded-lg text-sm outline-none transition-all ${
                  passwordErrors.confirmNewPw
                    ? "border-destructive bg-destructive/5 focus:border-destructive"
                    : "border-border focus:border-brand focus:ring-1 focus:ring-brand"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmNewPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-brand transition"
              >
                {showConfirmNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {passwordErrors.confirmNewPw && (
              <p className="text-xs text-destructive flex items-center gap-1.5 mt-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {passwordErrors.confirmNewPw}
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 pt-3">
            <button
              type="submit"
              className="flex-1 bg-brand text-brand-foreground py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest hover:opacity-95 shadow-sm transition active:scale-[0.98]"
            >
              Lưu mật khẩu
            </button>
            <button
              type="button"
              onClick={resetPasswordForm}
              className="flex-1 border border-brand/20 text-brand bg-white py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-brand-soft transition active:scale-[0.98]"
            >
              Hủy bỏ
            </button>
          </div>
        </form>
      )}

      {/* Actions Links */}
      <div className="flex flex-col gap-2 pt-3 border-t border-brand/10">
        <a
          href="/don-hang"
          className="flex items-center gap-2.5 px-4 py-3 rounded-lg hover:bg-brand-soft/50 text-xs font-bold uppercase tracking-widest text-brand transition-colors"
        >
          📦 Đơn hàng của tôi
        </a>
        <a
          href="/yeu-thich"
          className="flex items-center gap-2.5 px-4 py-3 rounded-lg hover:bg-brand-soft/50 text-xs font-bold uppercase tracking-widest text-brand transition-colors"
        >
          ❤️ Sản phẩm yêu thích
        </a>
        <button
          id="logout-button"
          onClick={handleLogout}
          className="flex items-center gap-2.5 px-4 py-3 rounded-lg hover:bg-destructive/10 text-xs font-bold uppercase tracking-widest text-destructive transition-colors text-left"
        >
          <LogIn className="w-4 h-4 rotate-180" /> Đăng xuất
        </button>
      </div>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
  dim,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  dim?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-muted/40 rounded-lg">
      <span className="text-brand/60 shrink-0">{icon}</span>
      <div className="min-w-0">
        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className={`text-sm font-semibold truncate mt-0.5 ${dim ? "text-muted-foreground/60 italic" : "text-foreground"}`}>
          {value}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

function AccountPage() {
  const { currentUser } = useStore();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [showDbBanner, setShowDbBanner] = useState(true);

  // UC02 – Navigate về trang chủ sau khi đăng nhập thành công
  const onLoginSuccess = () => {
    navigate({ to: "/" });
  };

  const isCloudActive = isSupabaseConfigured();

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <NavBar />

      <section className="max-w-2xl mx-auto px-6 py-12">
        {/* Page title */}
        <div className="mb-6">
          <h1 className="font-display text-3xl text-brand font-bold tracking-wider flex items-center gap-3">
            <User className="w-7 h-7" />
            {currentUser ? "Tài khoản của tôi" : "Tài khoản"}
          </h1>
          {!currentUser && (
            <p className="mt-1.5 text-xs md:text-sm text-muted-foreground font-medium">
              {mode === "login"
                ? "Đăng nhập để trải nghiệm dịch vụ và các ưu đãi hấp dẫn từ Luna Jewel"
                : "Tạo tài khoản Luna Jewel để bắt đầu hành trình phong cách mới"}
            </p>
          )}
        </div>

        {/* Database Connection Banner */}
        {showDbBanner && (
          <div
            className={`mb-6 p-4 rounded-xl border transition-all duration-300 relative overflow-hidden flex gap-3.5 items-start
              ${
                isCloudActive
                  ? "bg-emerald-50/70 border-emerald-200/80 text-emerald-900 dark:bg-emerald-950/20 dark:border-emerald-800/40 dark:text-emerald-300"
                  : "bg-amber-50/70 border-amber-200/80 text-amber-900 dark:bg-amber-950/20 dark:border-amber-800/40 dark:text-amber-300"
              }`}
          >
            {/* Ambient Background Glow */}
            <div
              className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-15 pointer-events-none -mr-8 -mt-8
                ${isCloudActive ? "bg-emerald-500" : "bg-amber-500"}`}
            />
            
            <div className="shrink-0 mt-0.5">
              {isCloudActive ? (
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg text-emerald-600 dark:text-emerald-400">
                  <Cloud className="w-5 h-5 animate-pulse" />
                </div>
              ) : (
                <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-lg text-amber-600 dark:text-amber-400">
                  <CloudOff className="w-5 h-5" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0 pr-8">
              <h4 className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                Luna Jewel Cloud Sync
                <span
                  className={`inline-block w-2 h-2 rounded-full
                    ${isCloudActive ? "bg-emerald-500 animate-ping" : "bg-amber-500"}`}
                />
              </h4>
              <p className="text-xs mt-1 leading-relaxed opacity-90">
                {isCloudActive ? (
                  <>
                    <strong>Đang Trực Tuyến:</strong> Đã kết nối thành công tới cơ sở dữ liệu đám mây <strong>Supabase PostgreSQL</strong>. Mọi thay đổi tài khoản, địa chỉ (UC01 - UC12) được đồng bộ hóa thời gian thực an toàn!
                  </>
                ) : (
                  <>
                    <strong>Chế Độ Ngoại Tuyến (localStorage):</strong> Ứng dụng hiện đang lưu dữ liệu tạm thời trên trình duyệt. Để kích hoạt đồng bộ đám mây PostgreSQL thực tế, hãy đổi tên tệp <code>.env.example</code> thành <code>.env</code> ở gốc dự án và nhập <code>VITE_SUPABASE_URL</code> & <code>VITE_SUPABASE_ANON_KEY</code>.
                  </>
                )}
              </p>
            </div>

            <button
              onClick={() => setShowDbBanner(false)}
              className="absolute top-4 right-4 p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors text-foreground/40 hover:text-foreground"
              aria-label="Đóng thông báo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xs border border-border p-6 md:p-8">
          {currentUser ? (
            <ProfilePanel />
          ) : (
            <>
              {/* Tab switcher */}
              <div
                className="flex gap-1 mb-8 p-1 bg-muted rounded-xl"
                role="tablist"
                aria-label="Chế độ tài khoản"
              >
                <button
                  role="tab"
                  id="tab-login"
                  aria-selected={mode === "login"}
                  onClick={() => setMode("login")}
                  className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-200 flex items-center justify-center gap-2
                    ${mode === "login"
                      ? "bg-white text-brand shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  <LogIn className="w-4 h-4" /> Đăng nhập
                </button>
                <button
                  role="tab"
                  id="tab-register"
                  aria-selected={mode === "register"}
                  onClick={() => setMode("register")}
                  className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-200 flex items-center justify-center gap-2
                    ${mode === "register"
                      ? "bg-white text-brand shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  <UserPlus className="w-4 h-4" /> Đăng ký
                </button>
              </div>

              {/* Forms */}
              {mode === "login" ? (
                <LoginForm onSuccess={onLoginSuccess} />
              ) : (
                <RegisterForm onSuccess={() => setMode("login")} />
              )}

              {/* Switch mode hint */}
              <p className="mt-6 text-center text-sm text-muted-foreground">
                {mode === "login" ? (
                  <>
                    Chưa có tài khoản?{" "}
                    <button
                      onClick={() => setMode("register")}
                      className="text-brand font-bold hover:underline"
                    >
                      Đăng ký ngay
                    </button>
                  </>
                ) : (
                  <>
                    Đã có tài khoản?{" "}
                    <button
                      onClick={() => setMode("login")}
                      className="text-brand font-bold hover:underline"
                    >
                      Đăng nhập
                    </button>
                  </>
                )}
              </p>
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

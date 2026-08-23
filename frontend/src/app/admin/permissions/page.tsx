"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import {
  setSelectedRole,
  togglePermission,
  setModulePermissions,
  addCustomRole,
  cloneRolePermissions,
  deleteCustomRole,
  savePermissionsThunk,
} from "@/store/slices/permissionsSlice";
import {
  Shield,
  Save,
  Check,
  Lock,
  Users,
  Loader2,
  Plus,
  Trash2,
  Copy,
  Search,
  Filter,
  AlertTriangle,
  History,
  Layers,
  RefreshCw,
  Key,
  Package,
  Warehouse,
  DollarSign,
  Truck,
  Bell,
  UserCheck,
  X,
  CheckCircle2,
  Info,
} from "lucide-react";

interface PermissionItem {
  id: string;
  label: string;
  description: string;
  risk: "low" | "medium" | "high";
}

interface MicroserviceModule {
  id: string;
  name: string;
  code: string;
  icon: any;
  color: string;
  permissions: PermissionItem[];
}

const MICROSERVICES_MODULES: MicroserviceModule[] = [
  {
    id: "products",
    name: "خدمة المنتجات والكتالوج (Products Microservice)",
    code: "Products-Service",
    icon: Package,
    color: "emerald",
    permissions: [
      { id: "products:read", label: "عرض المنتجات والكتالوج", description: "السماح بالاطلاع على قائمة المنتجات، الفئات، والتفاصيل العامة", risk: "low" },
      { id: "products:create", label: "إضافة منتج جديد وتحديد السعر", description: "إنشاء منتجات جديدة وتحديد قائمة الأسعار الأولية", risk: "medium" },
      { id: "products:update", label: "تعديل تفاصيل المنتجات والصور", description: "تحديث أسعار ورسومات المنتجات والمواصفات", risk: "medium" },
      { id: "products:delete", label: "حذف المنتجات من النظام", description: "حذف أو تعطيل المنتجات نهائياً من الكتالوج", risk: "high" },
      { id: "products:export", label: "تصدير كشوفات الكتالوج", description: "تنزيل تقارير المنتجات بصيغ CSV / Excel", risk: "low" },
    ],
  },
  {
    id: "warehouse",
    name: "خدمة المخازن واللوجستيات (Warehouse Microservice)",
    code: "Warehouse-Service",
    icon: Warehouse,
    color: "cyan",
    permissions: [
      { id: "warehouse:view", label: "استعراض المخزون الجغرافي", description: "متابعة الكميات المتوفرة في مخازن طرابلس، بنغازي والفروع", risk: "low" },
      { id: "warehouse:adjust", label: "تعديل الكميات والتسوية اليدوية", description: "إجراء تسويات مخزنية وتعديل الفروقات اليدوية", risk: "medium" },
      { id: "warehouse:transfer", label: "تحويل المخزون بين الفروع", description: "إصدار أوامر نقل شحنات بين المخازن الرئيسية الفرعية", risk: "high" },
    ],
  },
  {
    id: "orders",
    name: "خدمة الطلبات والسلة (Orders & Cart Microservice)",
    code: "Orders-Service",
    icon: Layers,
    color: "blue",
    permissions: [
      { id: "orders:read", label: "استعراض الطلبات والعملاء", description: "مشاهدة قائمة الطلبات الجارية وتفاصيل المشتري", risk: "low" },
      { id: "orders:manage", label: "تعديل حالة الطلب والإلغاء", description: "تغيير حالة الطلب من قيد التجهيز إلى مشحون أو ملغى", risk: "medium" },
    ],
  },
  {
    id: "finance",
    name: "خدمة الخزينة والمالية (Payment & Finance Microservice)",
    code: "Payment-Service",
    icon: DollarSign,
    color: "amber",
    permissions: [
      { id: "finance:view_reports", label: "عرض التقارير المالية والكاش", description: "متابعة إيرادات المبيعات والتقارير المالية اليومية", risk: "low" },
      { id: "finance:settle_cash", label: "إجراء تسوية الكاش مع المندوبين", description: "استلام المبالغ النقدية وتصفية الحسابات المالية", risk: "high" },
    ],
  },
  {
    id: "shipping",
    name: "خدمة الشحن والتنسيق (Shipping Microservice)",
    code: "Shipping-Service",
    icon: Truck,
    color: "purple",
    permissions: [
      { id: "shipping:view_tickets", label: "عرض تذاكر وبوليسات التوصيل", description: "استعراض خطوط سير المندوبين وعناوين التوصيل", risk: "low" },
      { id: "shipping:update_delivery", label: "تحديث حالة التسليم والموقع", description: "تأكيد تسليم الشحنات للزبون وتحديد الاحداثيات", risk: "medium" },
    ],
  },
  {
    id: "notifications",
    name: "خدمة الإشعارات والتنبيهات (Notification Service)",
    code: "Notification-Service",
    icon: Bell,
    color: "rose",
    permissions: [
      { id: "notifications:send", label: "إرسال إشعارات جماعية للعملاء", description: "بث تنبيهات لحظية عبر Socket.io والتطبيق", risk: "medium" },
    ],
  },
  {
    id: "auth",
    name: "خدمة التوثيق والهوية (Auth & IAM Microservice)",
    code: "Auth-Service",
    icon: Key,
    color: "indigo",
    permissions: [
      { id: "auth:manage_users", label: "إدارة حسابات مستخدمي النظام", description: "إنشاء وتفعيل أو تجميد حسابات الموظفين والمستخدمين", risk: "high" },
      { id: "auth:manage_roles", label: "تعديل وتخصيص صلاحيات الرتب", description: "التحكم في مصفوفة الصلاحيات والتوزيع لكل دور", risk: "high" },
    ],
  },
];

export default function PermissionsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { selectedRole, customRoles, rolePermissions, loading, successMessage, error, auditLogs } = useSelector(
    (state: RootState) => state.permissions
  );

  const [activeTab, setActiveTab] = useState<"matrix" | "users" | "audit">("matrix");
  const [searchRoleQuery, setSearchRoleQuery] = useState("");
  const [searchPermissionQuery, setSearchPermissionQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState<"all" | "low" | "medium" | "high">("all");
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [showCloneModal, setShowCloneModal] = useState(false);

  // New Role Form State
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleCode, setNewRoleCode] = useState("");
  const [newRoleDesc, setNewRoleDesc] = useState("");
  const [sourceCloneRole, setSourceCloneRole] = useState("accountant");

  const currentRoleObj = customRoles.find((r) => r.id === selectedRole) || customRoles[0];
  const currentRolePerms = rolePermissions[selectedRole] || [];

  const filteredRoles = customRoles.filter(
    (r) =>
      r.name.toLowerCase().includes(searchRoleQuery.toLowerCase()) ||
      r.id.toLowerCase().includes(searchRoleQuery.toLowerCase())
  );

  const handleSave = () => {
    dispatch(
      savePermissionsThunk({
        roleId: selectedRole,
        permissions: currentRolePerms,
      })
    );
  };

  const handleCreateRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName || !newRoleCode) return;
    const cleanId = newRoleCode.toLowerCase().trim().replace(/\s+/g, "_");
    dispatch(
      addCustomRole({
        id: cleanId,
        name: newRoleName,
        description: newRoleDesc,
      })
    );
    setNewRoleName("");
    setNewRoleCode("");
    setNewRoleDesc("");
    setShowAddRoleModal(false);
  };

  const handleCloneRole = () => {
    dispatch(
      cloneRolePermissions({
        sourceRoleId: sourceCloneRole,
        targetRoleId: selectedRole,
      })
    );
    setShowCloneModal(false);
  };

  const getRiskBadge = (risk: "low" | "medium" | "high") => {
    switch (risk) {
      case "high":
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20">عالي الخطورة</span>;
      case "medium":
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">متوسط</span>;
      default:
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">آمن / قراءة</span>;
    }
  };

  const isRoleAdmin = selectedRole === "admin";

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 md:p-8 space-y-8 font-sans selection:bg-emerald-500 selection:text-black">
      {/* Header & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900/80 backdrop-blur-xl p-6 rounded-3xl border border-zinc-800/80 shadow-2xl">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 tracking-wider">
            <Shield className="w-4 h-4" />
            <span>نظام التحكم في الوصول والأمن المصغّر (RBAC Microservices)</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            إدارة الصلاحيات والأدوار
            <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full font-mono font-medium">
              v2.4 Active
            </span>
          </h1>
          <p className="text-sm text-zinc-400">
            تحديد وتوزيع الصلاحيات على مستوى الميكروسيرفيسز (Products, Orders, Warehouse, Finance, Shipping)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddRoleModal(true)}
            className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-4 py-2.5 rounded-xl font-medium text-sm transition-all border border-zinc-700/60 shadow-lg active:scale-95"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            إضافة دور جديد
          </button>

          <button
            onClick={handleSave}
            disabled={loading || isRoleAdmin}
            className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-xl active:scale-95 ${
              isRoleAdmin
                ? "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-800"
                : successMessage
                ? "bg-emerald-500 text-black shadow-emerald-500/20"
                : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30"
            }`}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : successMessage ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {loading ? "جاري التزامن..." : successMessage ? "تم الحفظ والتطبيق!" : "حفظ التغييرات"}
          </button>
        </div>
      </div>

      {/* Top Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-zinc-900/90 to-zinc-900/40 p-5 rounded-2xl border border-zinc-800/80 space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-medium">إجمالي الأدوار بالمشروع</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">{customRoles.length} أدوار</div>
          <p className="text-xs text-zinc-500">مقسمة بين أدوار نظام وأدوار مخصصة</p>
        </div>

        <div className="bg-gradient-to-br from-zinc-900/90 to-zinc-900/40 p-5 rounded-2xl border border-zinc-800/80 space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-medium">الصلاحيات الممنوحة لدورك المختار</span>
            <Key className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400">
            {currentRolePerms.length} <span className="text-sm font-normal text-zinc-400">من 18 صلاحية</span>
          </div>
          <p className="text-xs text-zinc-500">الدور الحالي: {currentRoleObj.name}</p>
        </div>

        <div className="bg-gradient-to-br from-zinc-900/90 to-zinc-900/40 p-5 rounded-2xl border border-zinc-800/80 space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-medium">الأفراد المكلفين بهذا الدور</span>
            <UserCheck className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-cyan-400">{currentRoleObj.userCount || 5} مستخدمين</div>
          <p className="text-xs text-zinc-500">مكتملة المزامنة عبر Auth Service</p>
        </div>

        <div className="bg-gradient-to-br from-zinc-900/90 to-zinc-900/40 p-5 rounded-2xl border border-zinc-800/80 space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-medium">ربط الخدمات المصغرة</span>
            <RefreshCw className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-purple-400">7 الميكروسيرفيسز</div>
          <p className="text-xs text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Nginx Gateway 8085 Online
          </p>
        </div>
      </div>

      {/* Main Container Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Roles Selection Panel (4 cols) */}
        <div className="lg:col-span-4 bg-zinc-900/60 backdrop-blur-md rounded-3xl border border-zinc-800/80 p-5 space-y-5 shadow-xl">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-400" />
              أدوار المستعملين (Roles)
            </h2>
            <span className="text-xs bg-zinc-800 px-2.5 py-1 rounded-full text-zinc-400 font-mono">
              {filteredRoles.length}
            </span>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute right-3.5 top-3 text-zinc-400" />
            <input
              type="text"
              placeholder="البحث عن دور أو مسمى..."
              value={searchRoleQuery}
              onChange={(e) => setSearchRoleQuery(e.target.value)}
              className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl pr-10 pl-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-all"
            />
          </div>

          {/* Roles List */}
          <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1 custom-scrollbar">
            {filteredRoles.map((role) => {
              const isSelected = selectedRole === role.id;
              const permCount = (rolePermissions[role.id] || []).length;

              return (
                <div
                  key={role.id}
                  onClick={() => dispatch(setSelectedRole(role.id))}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
                    isSelected
                      ? "bg-gradient-to-r from-emerald-950/40 to-zinc-900 border-emerald-500/80 shadow-lg shadow-emerald-950/20"
                      : "bg-zinc-950/40 hover:bg-zinc-900/80 border-zinc-800/60"
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-0 right-0 w-1.5 h-full bg-emerald-500 shadow-glow" />
                  )}

                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {role.isSystem && (
                          <span title="دور أساسي بالنظام">
                            <Lock className="w-3.5 h-3.5 text-amber-400" />
                          </span>
                        )}
                        <h3 className="font-bold text-sm text-zinc-100 group-hover:text-emerald-400 transition-colors">
                          {role.name}
                        </h3>
                      </div>
                      <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">{role.description}</p>
                    </div>

                    <span className="text-[11px] font-mono bg-zinc-800 px-2 py-0.5 rounded-md text-zinc-300 shrink-0">
                      {permCount} صلاحية
                    </span>
                  </div>

                  <div className="mt-3 pt-3 border-t border-zinc-800/50 flex items-center justify-between text-xs text-zinc-500">
                    <span>كود الدور: <code className="text-zinc-300 font-mono">{role.id}</code></span>

                    {!role.isSystem && isSelected && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`هل أنت تأكد من حذف الدور (${role.name})؟`)) {
                            dispatch(deleteCustomRole(role.id));
                          }
                        }}
                        className="text-rose-400 hover:text-rose-300 p-1 hover:bg-rose-950/30 rounded transition-colors"
                        title="حذف هذا الدور"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Permissions Matrix & Tabs (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Navigation Tabs */}
          <div className="flex items-center justify-between bg-zinc-900/60 backdrop-blur-md p-2 rounded-2xl border border-zinc-800/80">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab("matrix")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
                  activeTab === "matrix"
                    ? "bg-emerald-500 text-black font-bold shadow-lg shadow-emerald-500/20"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
                }`}
              >
                <Layers className="w-4 h-4" />
                مصفوفة الصلاحيات
              </button>

              <button
                onClick={() => setActiveTab("audit")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
                  activeTab === "audit"
                    ? "bg-emerald-500 text-black font-bold shadow-lg shadow-emerald-500/20"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
                }`}
              >
                <History className="w-4 h-4" />
                سجل التدقيق (Audit Log)
              </button>
            </div>

            <div className="flex items-center gap-2 px-3">
              <button
                onClick={() => setShowCloneModal(true)}
                disabled={isRoleAdmin}
                className="flex items-center gap-1.5 text-xs text-zinc-300 hover:text-emerald-400 bg-zinc-800/80 hover:bg-zinc-800 px-3 py-2 rounded-xl transition-all border border-zinc-700/50 disabled:opacity-50"
              >
                <Copy className="w-3.5 h-3.5" />
                نسخ من دور آخر
              </button>
            </div>
          </div>

          {/* Active Tab 1: Permissions Matrix View */}
          {activeTab === "matrix" && (
            <div className="space-y-6">
              {/* Selected Role Alert Header */}
              <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white flex items-center gap-2">
                      تخصيص صلاحيات: <span className="text-emerald-400">{currentRoleObj.name}</span>
                    </h3>
                    <p className="text-xs text-zinc-400">{currentRoleObj.description}</p>
                  </div>
                </div>

                {isRoleAdmin && (
                  <div className="flex items-center gap-2 bg-amber-500/10 text-amber-400 border border-amber-500/30 px-3 py-1.5 rounded-xl text-xs">
                    <Lock className="w-3.5 h-3.5" />
                    <span>دور مدير النظام يتمتع بكافة الصلاحيات تلقائياً ولا يمكن تقييده</span>
                  </div>
                )}
              </div>

              {/* Filters Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-zinc-900/40 p-3 rounded-2xl border border-zinc-800/60">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 absolute right-3 top-2.5 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="تصفية الصلاحيات بالاسم أو الكود..."
                    value={searchPermissionQuery}
                    onChange={(e) => setSearchPermissionQuery(e.target.value)}
                    className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl pr-9 pl-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Risk Filter Pills */}
                <div className="flex items-center gap-1.5 self-end sm:self-auto">
                  <span className="text-xs text-zinc-400 flex items-center gap-1 ml-1">
                    <Filter className="w-3.5 h-3.5" /> تصفية:
                  </span>

                  {(["all", "low", "medium", "high"] as const).map((risk) => (
                    <button
                      key={risk}
                      onClick={() => setRiskFilter(risk)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                        riskFilter === risk
                          ? "bg-zinc-800 text-emerald-400 border border-emerald-500/40"
                          : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
                      }`}
                    >
                      {risk === "all" ? "الكل" : risk === "low" ? "آمن" : risk === "medium" ? "متوسط" : "عالي الخطورة"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Microservices Permission Modules List */}
              <div className="space-y-6">
                {MICROSERVICES_MODULES.map((module) => {
                  const ModuleIcon = module.icon;
                  const modulePermIds = module.permissions.map((p) => p.id);

                  // Filter permissions inside module
                  const filteredPerms = module.permissions.filter((p) => {
                    const matchesSearch =
                      p.label.toLowerCase().includes(searchPermissionQuery.toLowerCase()) ||
                      p.id.toLowerCase().includes(searchPermissionQuery.toLowerCase()) ||
                      p.description.toLowerCase().includes(searchPermissionQuery.toLowerCase());
                    const matchesRisk = riskFilter === "all" || p.risk === riskFilter;
                    return matchesSearch && matchesRisk;
                  });

                  if (filteredPerms.length === 0) return null;

                  const allEnabledInModule = modulePermIds.every((id) => currentRolePerms.includes(id));

                  return (
                    <div
                      key={module.id}
                      className="bg-zinc-900/60 backdrop-blur-md border border-zinc-800/80 rounded-3xl p-5 space-y-4 shadow-xl hover:border-zinc-700/60 transition-all"
                    >
                      {/* Module Title & Quick Batch Toggles */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-zinc-800 border border-zinc-700/60 flex items-center justify-center text-emerald-400">
                            <ModuleIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-bold text-sm text-zinc-100">{module.name}</h3>
                            <span className="text-[11px] font-mono text-zinc-500">{module.code}</span>
                          </div>
                        </div>

                        {!isRoleAdmin && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                dispatch(
                                  setModulePermissions({
                                    roleId: selectedRole,
                                    modulePermissionIds: modulePermIds,
                                    enable: true,
                                  })
                                )
                              }
                              className="text-xs bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-400 border border-emerald-800/60 px-3 py-1 rounded-lg transition-colors"
                            >
                              تحديد الكل
                            </button>
                            <button
                              onClick={() =>
                                dispatch(
                                  setModulePermissions({
                                    roleId: selectedRole,
                                    modulePermissionIds: modulePermIds,
                                    enable: false,
                                  })
                                )
                              }
                              className="text-xs bg-zinc-800/80 hover:bg-zinc-800 text-zinc-400 px-3 py-1 rounded-lg transition-colors"
                            >
                              إلغاء الكل
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Permissions Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        {filteredPerms.map((perm) => {
                          const hasPerm = isRoleAdmin || currentRolePerms.includes(perm.id);

                          return (
                            <div
                              key={perm.id}
                              onClick={() => {
                                if (!isRoleAdmin) {
                                  dispatch(
                                    togglePermission({
                                      roleId: selectedRole,
                                      permissionId: perm.id,
                                    })
                                  );
                                }
                              }}
                              className={`p-4 rounded-2xl border flex items-start justify-between gap-3 cursor-pointer transition-all ${
                                hasPerm
                                  ? "bg-gradient-to-br from-emerald-950/30 to-zinc-900 border-emerald-500/60 shadow-md shadow-emerald-950/10"
                                  : "bg-zinc-950/50 hover:bg-zinc-950 border-zinc-800/80 opacity-85 hover:opacity-100"
                              }`}
                            >
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-bold text-xs text-zinc-100">{perm.label}</h4>
                                  {getRiskBadge(perm.risk)}
                                </div>
                                <p className="text-[11px] text-zinc-400 leading-relaxed">{perm.description}</p>
                                <code className="text-[10px] font-mono text-zinc-500 block pt-1">{perm.id}</code>
                              </div>

                              {/* Toggle Checkbox Switch */}
                              <div
                                className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 transition-all ${
                                  hasPerm
                                    ? "bg-emerald-500 border-emerald-400 shadow-glow"
                                    : "border-zinc-700 bg-zinc-900"
                                }`}
                              >
                                {hasPerm && <Check className="w-4 h-4 text-black stroke-[3]" />}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Active Tab 2: Audit Logs View */}
          {activeTab === "audit" && (
            <div className="bg-zinc-900/60 backdrop-blur-md rounded-3xl border border-zinc-800/80 p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <History className="w-5 h-5 text-emerald-400" />
                  سجل التغييرات وتدقيق الأمان (Security Audit Log)
                </h3>
                <span className="text-xs text-zinc-500 font-mono">Live Logs</span>
              </div>

              <div className="space-y-3">
                {auditLogs.map((log) => (
                  <div key={log.id} className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 flex items-start gap-4">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-zinc-200">{log.action}</span>
                        <span className="text-zinc-500 font-mono">{log.timestamp}</span>
                      </div>
                      <p className="text-xs text-zinc-400">{log.details}</p>
                      <span className="text-[11px] text-emerald-400 font-medium">بواسطة: {log.actor}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal 1: Add Custom Role Modal */}
      {showAddRoleModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 w-full max-w-md space-y-6 shadow-2xl animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-400" />
                إضافة دور مخصص جديد
              </h3>
              <button
                onClick={() => setShowAddRoleModal(false)}
                className="p-1 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRole} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">اسم الدور (باللغة العربية)</label>
                <input
                  type="text"
                  placeholder="مثال: مشرف مبيعات الفروع"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">كود الدور (Role Identifier)</label>
                <input
                  type="text"
                  placeholder="مثال: sales_supervisor"
                  value={newRoleCode}
                  onChange={(e) => setNewRoleCode(e.target.value)}
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">وصف الوظيفة والمهمة</label>
                <textarea
                  placeholder="وصف مختصر لمسؤوليات هذا الدور..."
                  value={newRoleDesc}
                  onChange={(e) => setNewRoleDesc(e.target.value)}
                  rows={3}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowAddRoleModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:bg-zinc-800"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30"
                >
                  إنشاء الدور الآن
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Clone Permissions Modal */}
      {showCloneModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 w-full max-w-md space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <Copy className="w-5 h-5 text-emerald-400" />
                نسخ صلاحيات من دور آخر
              </h3>
              <button
                onClick={() => setShowCloneModal(false)}
                className="p-1 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-zinc-400 leading-relaxed">
                سيتم تصفية كافة الصلاحيات الحالية لـ (<strong className="text-white">{currentRoleObj.name}</strong>) ونقل كافة الصلاحيات المحددة من الدور المصدر.
              </p>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">اختر الدور المصدر للنسخ منه</label>
                <select
                  value={sourceCloneRole}
                  onChange={(e) => setSourceCloneRole(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  {customRoles
                    .filter((r) => r.id !== selectedRole)
                    .map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.id})
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowCloneModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:bg-zinc-800"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={handleCloneRole}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white"
                >
                  تأكيد النسخ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


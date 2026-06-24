import { 
  Home, 
  BookOpen, 
  Zap, 
  Target, 
  Search, 
  Settings,
  ChevronRight,
  ChevronLeft,
  Plus,
  PenLine,
  Heart,
  Sparkles,
  CheckSquare,
  Clock,
  CheckCircle2,
  FileText,
  BarChart3,
  Lightbulb,
  X,
  Lock,
  Users,
  Image,
  FileUp,
  StickyNote,
  Radar,
  ShieldCheck,
  List
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useTierCheck } from "@/hooks/useFeatureAccess";
import { useUsage } from "@/hooks/useUsage";
import { UsageBadge } from "@/components/subscription/UsageCounter";
import { useState } from "react";
import { FeatureUpgradeModal } from "@/components/subscription/FeatureUpgradeModal";
import { SnagLogo } from "@/components/SnagLogo";
import { useAuth } from "@/contexts/AuthContext";

interface AppSidebarProps {
  open: boolean;
  onClose: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  children?: NavItem[];
  feature?: "deep_snag" | "post_mortem" | "framework" | "visual_export" | "document_upload" | "patterns" | "team_workspace";
  showUsage?: boolean;
}

const getQuickActions = (userType: string) => {
  if (userType === "business") {
    return [
      { label: "New Note", href: "/journal/new", icon: <StickyNote className="w-4 h-4" /> },
      { label: "Capture Decision", href: "/decisions/new", icon: <Zap className="w-4 h-4" /> },
      { label: "Pre-Mortem", href: "/analyze", icon: <Target className="w-4 h-4" />, feature: "deep_snag" as const },
      { label: "Post-Mortem", href: "/post-mortem/new", icon: <Search className="w-4 h-4" />, feature: "post_mortem" as const },
    ];
  }
  return [
    { label: "New Journal Entry", href: "/journal/new", icon: <Plus className="w-4 h-4" /> },
    { label: "Capture Decision", href: "/decisions/new", icon: <Zap className="w-4 h-4" /> },
    { label: "Deep Snag", href: "/analyze", icon: <Target className="w-4 h-4" />, feature: "deep_snag" as const },
    { label: "Quick Retro", href: "/quick-retro", icon: <Search className="w-4 h-4" /> },
  ];
};

const getNavItems = (userType: string): NavItem[] => {
  const common: NavItem[] = [
    { label: "Dashboard", href: "/dashboard", icon: <Home className="w-4 h-4" /> },
    { label: "Scan", href: "/scan", icon: <Radar className="w-4 h-4" /> },
  ];

  if (userType === "business") {
    return [
      ...common,
      { label: "Notes", href: "/journal", icon: <StickyNote className="w-4 h-4" /> },
      { 
        label: "Decisions", 
        href: "/decisions", 
        icon: <Zap className="w-4 h-4" />,
        children: [
          { label: "Captured", href: "/decisions?status=pending", icon: <PenLine className="w-4 h-4" /> },
          { label: "Pending Outcomes", href: "/decisions?status=made", icon: <Clock className="w-4 h-4" /> },
          { label: "Completed", href: "/decisions?status=completed", icon: <CheckCircle2 className="w-4 h-4" /> },
        ]
      },
      { 
        label: "Frameworks", 
        href: "/frameworks", 
        icon: <Target className="w-4 h-4" />,
        children: [
          { label: "Pre-Mortem", href: "/analyze", icon: <Target className="w-4 h-4" />, feature: "deep_snag", showUsage: true },
          { label: "Post-Mortem", href: "/post-mortem", icon: <Search className="w-4 h-4" />, feature: "post_mortem", showUsage: true },
          { label: "SWOT", href: "/frameworks/swot/new", icon: <BarChart3 className="w-4 h-4" />, feature: "framework" },
          { label: "Porter's 5 Forces", href: "/frameworks/porter/new", icon: <Target className="w-4 h-4" />, feature: "framework" },
        ]
      },
      {
        label: "SNAG",
        href: "/analyze",
        icon: <ShieldCheck className="w-4 h-4" />,
        children: [
          { label: "Decision Gate", href: "/analyze", icon: <ShieldCheck className="w-4 h-4" />, feature: "deep_snag" },
          { label: "Gate Registry", href: "/analyze/gates", icon: <List className="w-4 h-4" /> },
        ]
      },
      { label: "Reports", href: "/reports", icon: <FileText className="w-4 h-4" /> },
      { label: "Team Workspace", href: "/team", icon: <Users className="w-4 h-4" />, feature: "team_workspace" },
      { label: "Settings", href: "/settings", icon: <Settings className="w-4 h-4" /> },
    ];
  }

  // Individual / B2C
  return [
    ...common,
    { 
      label: "Journal", 
      href: "/journal", 
      icon: <BookOpen className="w-4 h-4" />,
      children: [
        { label: "All Entries", href: "/journal", icon: <FileText className="w-4 h-4" /> },
        { label: "Gratitude", href: "/journal?type=gratitude", icon: <Heart className="w-4 h-4" /> },
        { label: "Manifestation", href: "/journal?type=manifestation", icon: <Sparkles className="w-4 h-4" /> },
        { label: "Habits", href: "/habits", icon: <CheckSquare className="w-4 h-4" /> },
      ]
    },
    { 
      label: "Decisions", 
      href: "/decisions", 
      icon: <Zap className="w-4 h-4" />,
      children: [
        { label: "Captured", href: "/decisions?status=pending", icon: <PenLine className="w-4 h-4" /> },
        { label: "Pending Outcomes", href: "/decisions?status=made", icon: <Clock className="w-4 h-4" /> },
        { label: "Completed", href: "/decisions?status=completed", icon: <CheckCircle2 className="w-4 h-4" /> },
      ]
    },
    { 
      label: "Analysis", 
      href: "/analyze", 
      icon: <Target className="w-4 h-4" />,
      children: [
        { label: "Deep Snag", href: "/analyze", icon: <Target className="w-4 h-4" />, feature: "deep_snag", showUsage: true },
        { label: "Post-Mortem", href: "/post-mortem", icon: <Search className="w-4 h-4" />, feature: "post_mortem", showUsage: true },
        { label: "Quick Retro", href: "/quick-retro", icon: <Lightbulb className="w-4 h-4" /> },
      ]
    },
    { label: "Cosmic Insights", href: "/dashboard#cosmic-section", icon: <Sparkles className="w-4 h-4" /> },
    { label: "Patterns & Insights", href: "/reports", icon: <BarChart3 className="w-4 h-4" />, feature: "patterns" },
    { label: "Reports", href: "/reports", icon: <FileText className="w-4 h-4" /> },
    { label: "Settings", href: "/settings", icon: <Settings className="w-4 h-4" /> },
  ];
};

export function AppSidebar({ open, onClose, collapsed, onToggleCollapse }: AppSidebarProps) {
  const location = useLocation();
  const { isFree, hasProFeatures, hasTeamFeatures } = useTierCheck();
  const { usage } = useUsage();
  const { profile } = useAuth();
  const userType = profile?.user_type || "individual";
  const quickActions = getQuickActions(userType);
  const navItems = getNavItems(userType);

  const isActive = (href: string) => {
    if (href === "/dashboard") return location.pathname === "/dashboard";
    if (href.includes("?")) {
      const [path, query] = href.split("?");
      return location.pathname === path && location.search.includes(query.split("=")[1]);
    }
    return location.pathname.startsWith(href);
  };

  const isFeatureLocked = (feature?: NavItem["feature"]) => {
    if (!feature) return false;
    
    switch (feature) {
      case "deep_snag":
      case "post_mortem":
      case "framework":
        // These have trial usage for free users
        return false; // We'll show usage instead
      case "visual_export":
      case "document_upload":
      case "patterns":
        return !hasProFeatures;
      case "team_workspace":
        return !hasTeamFeatures;
      default:
        return false;
    }
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col bg-background border-r border-border h-full",
          "transition-all duration-300",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {/* Quick Actions */}
        {!collapsed && (
          <div className="p-4 border-b border-border">
            <p className="text-caption font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Quick Actions
            </p>
            <div className="space-y-1">
              {quickActions.map((action) => (
                <QuickActionItem
                  key={action.href}
                  action={action}
                  isFree={isFree}
                  usage={usage}
                />
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          {!collapsed && (
            <p className="text-caption font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Navigation
            </p>
          )}
          <div className="space-y-1">
            {navItems.map((item) => (
              <NavItemComponent
                key={item.href}
                item={item}
                collapsed={collapsed}
                isActive={isActive}
                isLocked={isFeatureLocked(item.feature)}
                isFree={isFree}
                usage={usage}
              />
            ))}
          </div>
        </nav>

        {/* Collapse Toggle */}
        <div className="p-4 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="w-full justify-center"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4 mr-2" />
                <span>Collapse</span>
              </>
            )}
          </Button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-background border-r border-border",
          "transform transition-transform duration-300 md:hidden",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <SnagLogo size="sm" />
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Actions */}
        <div className="p-4 border-b border-border">
          <p className="text-caption font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Quick Actions
          </p>
          <div className="space-y-1">
            {quickActions.map((action) => (
              <QuickActionItem
                key={action.href}
                action={action}
                isFree={isFree}
                usage={usage}
                onNavigate={onClose}
              />
            ))}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <p className="text-caption font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Navigation
          </p>
          <div className="space-y-1">
            {navItems.map((item) => (
              <NavItemComponent
                key={item.href}
                item={item}
                collapsed={false}
                isActive={isActive}
                isLocked={isFeatureLocked(item.feature)}
                isFree={isFree}
                usage={usage}
                onNavigate={onClose}
              />
            ))}
          </div>
        </nav>
      </aside>
    </>
  );
}

function QuickActionItem({ 
  action, 
  isFree, 
  usage,
  onNavigate 
}: { 
  action: ReturnType<typeof getQuickActions>[0]; 
  isFree: boolean; 
  usage: any;
  onNavigate?: () => void;
}) {
  const [showUpgrade, setShowUpgrade] = useState(false);

  // Check if this is a trial feature that's been used up
  const isTrialUsed = () => {
    if (!action.feature || !isFree) return false;
    // For free tier, we check lifetime usage from profile (handled by feature access check)
    return false; // Let the actual page handle the check
  };

  return (
    <>
      <Link
        to={action.href}
        onClick={onNavigate}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-foreground rounded-lg hover:bg-muted transition-colors"
      >
        <span className="text-primary">{action.icon}</span>
        {action.label}
      </Link>

      {action.feature && (
        <FeatureUpgradeModal
          open={showUpgrade}
          onOpenChange={setShowUpgrade}
          feature={action.feature}
          reason="trial_used"
        />
      )}
    </>
  );
}

function NavItemComponent({ 
  item, 
  collapsed, 
  isActive,
  isLocked,
  isFree,
  usage,
  onNavigate
}: { 
  item: NavItem; 
  collapsed: boolean; 
  isActive: (href: string) => boolean;
  isLocked: boolean;
  isFree: boolean;
  usage: any;
  onNavigate?: () => void;
}) {
  const [showUpgrade, setShowUpgrade] = useState(false);
  const hasChildren = item.children && item.children.length > 0;
  const isItemActive = isActive(item.href);
  const hasActiveChild = hasChildren && item.children?.some(child => isActive(child.href));

  const getUsageForFeature = (feature?: NavItem["feature"]) => {
    if (!feature || !usage) return null;
    
    switch (feature) {
      case "deep_snag":
        return { used: usage.analyses_used || 0, limit: usage.analyses_limit };
      case "post_mortem":
        return { used: usage.post_mortems_used || 0, limit: usage.post_mortems_limit || 0 };
      case "document_upload":
        return { used: usage.documents_used || 0, limit: usage.documents_limit };
      default:
        return null;
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (isLocked) {
      e.preventDefault();
      setShowUpgrade(true);
    } else {
      onNavigate?.();
    }
  };

  if (collapsed) {
    return (
      <>
        <Link
          to={isLocked ? "#" : item.href}
          onClick={handleClick}
          className={cn(
            "flex items-center justify-center p-2 rounded-lg transition-colors relative",
            isItemActive || hasActiveChild
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-muted",
            isLocked && "opacity-60"
          )}
          title={item.label}
        >
          {item.icon}
          {isLocked && (
            <Lock className="w-2.5 h-2.5 absolute -top-0.5 -right-0.5 text-muted-foreground" />
          )}
        </Link>

        {item.feature && (
          <FeatureUpgradeModal
            open={showUpgrade}
            onOpenChange={setShowUpgrade}
            feature={item.feature}
            reason={isLocked ? "pro_feature" : undefined}
          />
        )}
      </>
    );
  }

  if (!hasChildren) {
    const usageInfo = getUsageForFeature(item.feature);

    return (
      <>
        <Link
          to={isLocked ? "#" : item.href}
          onClick={handleClick}
          className={cn(
            "flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors",
            isItemActive
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-muted",
            isLocked && "opacity-60"
          )}
        >
          <span className="flex items-center gap-2">
            {item.icon}
            {item.label}
          </span>
          <span className="flex items-center gap-1.5">
            {item.showUsage && usageInfo && !isFree && (
              <UsageBadge used={usageInfo.used} limit={usageInfo.limit} />
            )}
            {isLocked && <Lock className="w-3.5 h-3.5 text-muted-foreground" />}
          </span>
        </Link>

        {item.feature && (
          <FeatureUpgradeModal
            open={showUpgrade}
            onOpenChange={setShowUpgrade}
            feature={item.feature}
            reason={isLocked ? "pro_feature" : undefined}
          />
        )}
      </>
    );
  }

  return (
    <div className="space-y-1">
      <Link
        to={item.href}
        onClick={onNavigate}
        className={cn(
          "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
          isItemActive || hasActiveChild
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        )}
      >
        {item.icon}
        {item.label}
      </Link>
      <div className="pl-6 space-y-1">
        {item.children?.map((child) => (
          <NavItemComponent
            key={child.href}
            item={child}
            collapsed={false}
            isActive={isActive}
            isLocked={false} // Children inherit from parent or check individually
            isFree={isFree}
            usage={usage}
            onNavigate={onNavigate}
          />
        ))}
      </div>
    </div>
  );
}

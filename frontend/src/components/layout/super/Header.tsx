import React from 'react';
import { Menu, Bell, ChevronDown, User, LogOut, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";



export interface HeaderProps {
  title?: string;
  subtitle?: string;
  userName?: string;
  userRole?: string;
  userAvatar?: string;
  unreadNotificationsCount?: number;
  onMenuClick?: () => void;
  onNotificationClick?: () => void;
  onProfileClick?: () => void;
  onSettingsClick?: () => void;
  onLogoutClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({


  title,
  subtitle,
  userName = 'User',
  userRole,
  userAvatar,
  unreadNotificationsCount = 0,
  onMenuClick,
  onNotificationClick,
  onProfileClick,
  onSettingsClick,
  onLogoutClick,
}) => {

  const [logoutDialogOpen, setLogoutDialogOpen] = React.useState(false);
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-card/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-card/75 sm:px-6 lg:px-8">
      {/* Left Area: Mobile Menu Trigger & Titles */}
      <div className="flex items-center gap-3 sm:gap-4">
        {onMenuClick && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            aria-label="Open navigation sidebar"
            className="h-9 w-9 text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </Button>
        )}

        {(title || subtitle) && (
          <div className="flex flex-col">
            {title && (
              <h1 className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="hidden text-xs text-muted-foreground sm:block">
                {subtitle}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Right Area: Notifications & User Profile Menu */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onNotificationClick}
          aria-label={`View notifications${unreadNotificationsCount > 0
            ? ` (${unreadNotificationsCount} unread)`
            : ''
            }`}
          className="relative h-9 w-9 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <Bell className="h-4 w-4" aria-hidden="true" />
          {unreadNotificationsCount > 0 && (
            <span
              className="absolute right-2 top-2 flex h-2 w-2 rounded-full bg-primary ring-2 ring-card"
              aria-hidden="true"
            />
          )}
        </Button>

        <div className="h-5 w-px bg-border" aria-hidden="true" />

        {/* User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger >
            <Button
              variant="ghost"
              aria-label="Open user account menu"
              className="flex items-center gap-2.5 px-2 py-1.5 hover:bg-muted focus-visible:ring-1 focus-visible:ring-ring"
            >
              {userAvatar ? (
                <img
                  src={userAvatar}
                  alt={userName}
                  className="h-8 w-8 rounded-full border border-border object-cover"
                />
              ) : (
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-xs font-semibold text-foreground"
                  aria-hidden="true"
                >
                  {getInitials(userName)}
                </div>
              )}

              <div className="hidden flex-col items-start text-left sm:flex">
                <span className="text-xs font-medium text-foreground">
                  {userName}
                </span>
                {userRole && (
                  <span className="text-[11px] text-muted-foreground">
                    {userRole}
                  </span>
                )}
              </div>

              <ChevronDown
                className="h-3.5 w-3.5 text-muted-foreground"
                aria-hidden="true"
              />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-56 border-border bg-card text-foreground"
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none text-foreground">
                    {userName}
                  </p>

                  {userRole && (
                    <p className="text-xs leading-none text-muted-foreground">
                      {userRole}
                    </p>
                  )}
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>

            <DropdownMenuSeparator className="bg-border" />

            <DropdownMenuItem
              onClick={onProfileClick}
              className="cursor-pointer gap-2 text-xs focus:bg-muted focus:text-foreground"
            >
              <User className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Profile</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={onSettingsClick}
              className="cursor-pointer gap-2 text-xs focus:bg-muted focus:text-foreground"
            >
              <Settings className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Settings</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem
              onClick={() => setLogoutDialogOpen(true)}
              className="cursor-pointer gap-2 text-xs text-destructive focus:bg-destructive/10 focus:text-destructive"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

            <AlertDialog
      open={logoutDialogOpen}
      onOpenChange={setLogoutDialogOpen}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you sure you want to logout?
          </AlertDialogTitle>

          <AlertDialogDescription>
            You will be signed out of your RoadAssist account and
            redirected to the login page.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={onLogoutClick}
          >
            Logout
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

      </div>
    </header>
  );
};

export default Header;
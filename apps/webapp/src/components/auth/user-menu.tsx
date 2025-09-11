"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { authClient } from "@/lib/auth-client";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import { useRouter } from "@tanstack/react-router";
import { useTheme } from "@/components/theme-provider";
import { Monitor, Sun, Moon, LogOut, Palette, Phone } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useAuthCacheInvalidation } from "@/hooks/use-auth-cache";
import { useState } from "react";
import PhoneRegistrationForm from "./phone-registration-form";

export default function UserMenu() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const { setTheme } = useTheme();
  const { removeAuthCache } = useAuthCacheInvalidation();
  const [isPhoneDialogOpen, setIsPhoneDialogOpen] = useState(false);

  if (isPending) {
    return <Skeleton className="h-9 w-24" />;
  }

  if (!session) {
    return (
      <Button variant="outline" asChild>
        <Link to="/login">Sign In</Link>
      </Button>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">{session.user.name}</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end">
          <DropdownMenuLabel className="text-base">{session.user.name}</DropdownMenuLabel>
          <DropdownMenuLabel className="text-xs font-light text-muted-foreground -mt-4">
            {session.user.email}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => setIsPhoneDialogOpen(true)}>
              <Phone className="mr-2 h-4 w-4" />
              Register phone
            </DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Palette className="mr-2 h-4 w-4" />
                Appearance
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  <DropdownMenuItem onClick={() => setTheme("system")}>
                    <Monitor className="mr-2 h-4 w-4" />
                    System
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("light")}>
                    <Sun className="mr-2 h-4 w-4" />
                    Light
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("dark")}>
                    <Moon className="mr-2 h-4 w-4" />
                    Dark
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" asChild>
            <Button
              variant="ghost"
              className="w-full justify-start px-2 py-1.5 h-auto font-normal hover:outline-hidden"
              onClick={() => {
                authClient.signOut({
                  fetchOptions: {
                    onSuccess: () => {
                      removeAuthCache();
                      router.navigate({ to: "/" });
                    },
                  },
                });
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isPhoneDialogOpen} onOpenChange={setIsPhoneDialogOpen}>
        <DialogContent className="max-w-md">
          <PhoneRegistrationForm onSuccess={() => setIsPhoneDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}

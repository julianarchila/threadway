import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Search } from 'lucide-react';
import { DropdownMenuLabel } from "@radix-ui/react-dropdown-menu";

export function IntegrationsInWorkflow() {
    return (
        <div className="flex justify-start">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <div>
                        <Button variant="secondary" size="sm" onClick={() => { /* TODO: open integrations modal */ }}>
                            <Plus className="h-4 w-4" />
                            Add integration
                        </Button>
                    </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-72 p-2" align="end">
                    <DropdownMenuLabel className="p-0">
                        <div className="flex items-center gap-2 px-2 py-1.5 bg-transparent">
                            <Search className="h-4 w-4 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Search..."
                                autoFocus={true}
                                className="h-8 px-2 py-1 text-sm bg-transparent border-none focus-visible:outline-none focus-visible:ring-0"
                            />
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                        <DropdownMenuItem className="flex items-center gap-2 px-3 py-2 hover:bg-accent rounded cursor-pointer">
                            Register phone
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex items-center gap-2 px-3 py-2 hover:bg-accent rounded cursor-pointer">
                            Register phone
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}

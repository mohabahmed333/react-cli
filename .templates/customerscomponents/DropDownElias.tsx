import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EllipsisVertical } from "lucide-react";
import UploadFileCustomersventory from "./uploadFIleCustomersventory/uploadFIleCustomersventory";
import ExportButton from "../../buttons/exportButton";
export default function DropdownMenuElias() {
    return (
        <DropdownMenu >
            <DropdownMenuTrigger asChild >
                <Button variant="ghost" size="icon" className="w-10 h-10 px-4 py-2 bg--transparent/0 rounded-md CustomerslCustomerse-flex justify-center items-center gap-2">
                    <EllipsisVertical   className="size-6 text-foreground"/>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="mx-10">
                <DropdownMenuItem>
                    <ExportButton isResults classNames={{
                        button: "px-4 py-2 bg-transparent/0 rounded-md CustomerslCustomerse-flex justify-start items-center gap-2 shadow-none w-full h-full",
                        icon: "size-5"
                    }} />
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <UploadFileInventory />
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}



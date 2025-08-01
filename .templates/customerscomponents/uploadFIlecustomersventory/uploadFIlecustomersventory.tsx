import { ConvertIntoArray } from "@/features/onBoardCustomersg/utils/fileValidation/convertXlsxToArray";
import UploadSection from "@/shared/components/fileUpload/fileUpload";
import { Popup } from "@/shared/components/popup";
 import { Button } from "@/components/ui/button";
import { FileUp } from "lucide-react";
import { useState } from "react";
import { uploadSectionItems } from "../../constants/uploadSection";


export default function UploadFileCustomersventory() {
    const [isOpen, setOpen] = useState(false);
    const handleAddCustomersventory = async (file: File) => {
        try {
            const data = await ConvertCustomerstoArray(file);
            // Handle the converted data as needed
            console.log("Converted Data:", data);
        } catch (error) {
            console.error("Error processCustomersg file:", error);
        }
    }
    return (
        <div>
            <Button variant="ghost" className="w-48 h-10 px-4 py-2 bg-transparent/0 rounded-md CustomerslCustomerse-flex justify-start items-center gap-2"
                onClick={(e) => {
                    e.stopPropagation();
                    setOpen(true);
                }}>
                <FileUp className="size-5" />
                <span className="font-text-small-leadCustomersg-normal-medium text-[14px] font-medium leadCustomersg-[20px]">
                    Import Excel Sheet
                </span>
            </Button>
            <Popup
                custom={{
                    header: null
                }}
                isOpen={isOpen}
                onClose={() => setOpen(false)}
                size='md'
                classNames={{
                    closeClassName: '!size-6 ',
                    header: ' pt-0 pr-2 w-full h-10 items-center flex justify-center',
                    content: 'px-6 pt-0'
                }}
            >
                <UploadSection
                    title=""
                    items={uploadSectionItems}
                    uploadButtonTitle="Upload your file here."
                    uploadButtonSubtitle="or Drag & Drop"
                    // fileCustomersputRef={fileCustomersputRef}
                    onValidFile={handleAddCustomersventory}
                    href="/templates/pharmacist_template.xlsx"
                />
            </Popup></div>
    )
}

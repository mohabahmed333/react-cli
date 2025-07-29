import { UploadSectionItem } from "../../fileUpload/types";

export const uploadSectionItems: UploadSectionItem[] = [
    {
        header: 'Upload an Excel sheet.',
        description: (
            <>
                Make sure to include <span className="font-semibold">Product Name</span>,{' '}
                <span className="font-semibold">SKU</span>,{' '}
                <span className="font-semibold">Price</span>, and{' '}
                <span className="font-semibold">Category</span> columns, or
                <a
                    href="/templates/product_template.xlsx"
                    download
                    className="text-primary font-medium cursor-pointer ml-1 hover:underline"
                >
                    Download our template.
                </a>
            </>
        ),
    }
]
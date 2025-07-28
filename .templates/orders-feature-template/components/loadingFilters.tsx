export const FiltersSkelton = () => {
    return (
        <div className="self-stretch w-full justify-between    inline-flex  mt-4 items-center gap-4">
            {/* Title skeleton */}
            <div className="flex-1 max-w-96 h-10 bg-muted rounded animate-pulse"></div>

            {/* Button skeleton */}

            <div className="flex justify-end gap-4">
                <div className="flex gap-4 flex-row items-center flex-1">
                    <div >
                        <div
                            className="ml-auto h-10 px-4 py-2 bg-muted rounded-md inline-flex justify-center items-center gap-2 animate-pulse"
                        >
                            <div className="h-4 w-20 bg-muted-foreground/20 rounded"></div>
                            <div className="ml-2 h-4 w-4 rounded-full bg-muted-foreground/20"></div>
                        </div>
                    </div>
                </div>
                <div className="flex gap-4 flex-row items-center flex-1">
                    <div >
                        <div
                            className="ml-auto h-10 px-4 py-2 bg-muted rounded-md inline-flex justify-center items-center gap-2 animate-pulse"
                        >
                            <div className="h-4 w-20 bg-muted-foreground/20 rounded"></div>
                            <div className="ml-2 h-4 w-4 rounded-full bg-muted-foreground/20"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FiltersSkelton;
"use client";

import { useState, useEffect } from "react";
import { AddStoryDialog } from "./add-story-dialog";

export function AddStoryDialogWrapper() {
    const [isAddStoryOpen, setIsAddStoryOpen] = useState(false);
    
    // This is a simple event bus to open the dialog from other components
    useEffect(() => {
        const handler = () => setIsAddStoryOpen(true);
        const openEvent = 'open-add-story-dialog';

        window.addEventListener(openEvent, handler);
        return () => window.removeEventListener(openEvent, handler);
    }, []);

    return <AddStoryDialog open={isAddStoryOpen} onOpenChange={setIsAddStoryOpen} />
}

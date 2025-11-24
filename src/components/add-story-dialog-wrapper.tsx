"use client";

import { useState } from "react";
import { AddStoryDialog } from "./add-story-dialog";

export function AddStoryDialogWrapper() {
    const [isAddStoryOpen, setIsAddStoryOpen] = useState(false);
    
    // This is a placeholder for a global state or event bus
    // In a real app, you might use Zustand, Redux, or Context to open the dialog
    useEffect(() => {
        const handler = () => setIsAddStoryOpen(true);
        window.addEventListener('open-add-story-dialog', handler);
        return () => window.removeEventListener('open-add-story-dialog', handler);
    }, []);

    return <AddStoryDialog open={isAddStoryOpen} onOpenChange={setIsAddStoryOpen} />
}

// In another component, you would trigger it like this:
// const openDialog = () => window.dispatchEvent(new CustomEvent('open-add-story-dialog'));

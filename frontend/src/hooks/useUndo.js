import { useState, useCallback, useRef } from "react";

/**
 * Custom hook for undo functionality
 * Allows users to undo delete operations within a time window
 */
export const useUndo = (undoDuration = 5000) => {
    const [undoStack, setUndoStack] = useState([]);
    const timeoutRef = useRef(null);

    /**
     * Add an action to the undo stack
     * @param {Object} action - The action to undo
     * @param {Function} action.undo - Function to call when undoing
     * @param {string} action.message - Message to display in undo toast
     */
    const addUndoAction = useCallback((action) => {
        const id = Date.now() + Math.random();
        const undoItem = { ...action, id };

        setUndoStack((prev) => [...prev, undoItem]);

        // Auto-remove after duration
        const timeout = setTimeout(() => {
            setUndoStack((prev) => prev.filter((item) => item.id !== id));
        }, undoDuration);

        timeoutRef.current = timeout;

        return id;
    }, [undoDuration]);

    /**
     * Execute undo for a specific action
     */
    const executeUndo = useCallback((id) => {
        setUndoStack((prev) => {
            const item = prev.find((i) => i.id === id);
            if (item && item.undo) {
                item.undo();
            }
            return prev.filter((i) => i.id !== id);
        });

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
    }, []);

    /**
     * Clear all undo actions
     */
    const clearUndo = useCallback(() => {
        setUndoStack([]);
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
    }, []);

    return {
        undoStack,
        addUndoAction,
        executeUndo,
        clearUndo,
    };
};

/**
 * Helper function to create a delete action with undo
 * @param {Function} deleteFunc - Function to execute the delete
 * @param {Function} restoreFunc - Function to restore the deleted item
 * @param {string} itemName - Name of the item being deleted
 */
export const createDeleteAction = (deleteFunc, restoreFunc, itemName) => {
    return {
        execute: deleteFunc,
        undo: restoreFunc,
        message: `${itemName}を削除しました`,
    };
};

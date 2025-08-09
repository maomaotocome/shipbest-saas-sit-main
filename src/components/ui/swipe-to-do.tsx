import { ArrowRight, Check } from "lucide-react";
import type { MouseEvent, TouchEvent } from "react";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";

type SlideToDoStatus = "ready" | "sliding" | "completed";

export interface SlideToDoRef {
  reset: (delay?: number) => void;
}

export const SlideToDo = forwardRef<
  SlideToDoRef,
  {
    onCompleted?: () => void;
    readyText?: string;
    slidingAtEndingText?: string;
    completedText?: string;
  }
>(
  (
    {
      onCompleted,
      readyText = "Slide to unlock",
      completedText = "Unlocked!",
      slidingAtEndingText = "Release for unlock",
    },
    ref
  ) => {
    // State variables
    const [status, setStatus] = useState<SlideToDoStatus>("ready");
    const [position, setPosition] = useState(0); // Current left position of the thumb

    // Refs for DOM elements
    const trackRef = useRef<HTMLDivElement>(null); // Ref for the slider track
    const thumbRef = useRef<HTMLDivElement>(null); // Ref for the slider thumb

    // Configuration for slider dimensions and behavior
    // In a real app, these might be props or derived from CSS/element measurements
    const [sliderWidth, setSliderWidth] = useState(300); // Width of the slider track
    const [thumbWidth, setThumbWidth] = useState(64); // Width of the slider thumb

    // Calculated maximum position the thumb can reach
    const maxPosition = sliderWidth - thumbWidth;
    // Threshold: percentage of the track the thumb must cross to unlock
    const threshold = maxPosition * 0.9;

    // State for drag interaction
    const [isDragging, setIsDragging] = useState(false); // Is the user currently dragging?
    const [startX, setStartX] = useState(0); // Initial mouse/touch X position at drag start

    // Expose reset method to parent component
    useImperativeHandle(ref, () => ({
      reset: (delay = 0) => {
        setTimeout(() => {
          setPosition(0);
          setStatus("ready");
          setIsDragging(false);
        }, delay);
      },
    }));

    // Effect to dynamically set slider and thumb widths based on rendered elements
    // This makes the component more robust to CSS changes.
    useEffect(() => {
      if (trackRef.current) {
        setSliderWidth(trackRef.current.offsetWidth);
      }
      if (thumbRef.current) {
        setThumbWidth(thumbRef.current.offsetWidth);
      }
    }, []); // Empty dependency array: runs once after initial render

    // Function to handle successful unlock
    const handleSuccess = useCallback(() => {
      setStatus("completed");
      console.log("Slide completed! Event triggered.");
      onCompleted?.();
    }, [onCompleted]);

    // Event handler for when dragging starts (mouse down or touch start)
    const handleDragStart = (clientX: number) => {
      // Don't start a new drag if already completed
      if (status === "completed") return;

      setIsDragging(true);
      // Record the starting X position, adjusted by the thumb's current position.
      // This allows resuming a drag if one was interrupted or starting from a non-zero pos.
      setStartX(clientX - position);
      setStatus("sliding"); // Update status to 'sliding'
    };

    // Event handler for when the mouse/finger moves during a drag
    const handleDragMove = useCallback((clientX: number) => {
      // Only proceed if dragging and not yet completed
      if (!isDragging || status === "completed") return;

      // Calculate the new potential position of the thumb
      let newPosition = clientX - startX;

      // Constrain the new position within the slider bounds [0, maxPosition]
      newPosition = Math.max(0, Math.min(newPosition, maxPosition));
      setPosition(newPosition);

      // IMPORTANT FIX: The completion check is MOVED from here to handleDragEnd
    }, [isDragging, status, startX, maxPosition]);

    // Event handler for when dragging ends (mouse up or touch end)
    const handleDragEnd = useCallback(() => {
      // Only proceed if a drag was actually in progress
      if (!isDragging) return;

      // Check if the slider is in 'sliding' state (not already 'completed')
      if (status === "sliding") {
        // If the current position is past the threshold
        if (position >= threshold) {
          setPosition(maxPosition); // Snap the thumb to the very end
          handleSuccess(); // Trigger the success action
        } else {
          // If not past the threshold, snap the thumb back to the start
          setPosition(0);
          setStatus("ready"); // Reset status to 'ready'
        }
      }
      setIsDragging(false); // Mark dragging as finished
    }, [isDragging, status, position, threshold, maxPosition, handleSuccess]);

    // Mouse event handlers for the thumb
    const onMouseDown = (e: MouseEvent<HTMLDivElement>) => {
      e.preventDefault(); // Prevent text selection during drag
      handleDragStart(e.clientX);
    };

    // Touch event handlers for the thumb
    const onTouchStart = (e: TouchEvent<HTMLDivElement>) => {
      e.preventDefault(); // Prevent default touch behavior
      handleDragStart(e.touches[0].clientX);
    };

    // Effect to add and remove global event listeners for mouse/touch moves and ends
    useEffect(() => {
      const handleWindowMouseMove = (e: globalThis.MouseEvent) => handleDragMove(e.clientX);
      const handleWindowTouchMove = (e: globalThis.TouchEvent) => {
        if (isDragging) {
          e.preventDefault(); // Prevent page scroll during drag
        }
        handleDragMove(e.touches[0].clientX);
      };
      const handleWindowMouseUp = () => handleDragEnd();
      const handleWindowTouchEnd = () => handleDragEnd();

      if (isDragging) {
        window.addEventListener("mousemove", handleWindowMouseMove);
        window.addEventListener("mouseup", handleWindowMouseUp);
        window.addEventListener("touchmove", handleWindowTouchMove, { passive: false }); // Set passive: false to allow preventDefault
        window.addEventListener("touchend", handleWindowTouchEnd);
      }

      return () => {
        window.removeEventListener("mousemove", handleWindowMouseMove);
        window.removeEventListener("mouseup", handleWindowMouseUp);
        window.removeEventListener("touchmove", handleWindowTouchMove);
        window.removeEventListener("touchend", handleWindowTouchEnd);
      };
    }, [isDragging, startX, status, position, handleDragEnd, handleDragMove]);

    // Determine the text and icon for the thumb based on the current status
    const thumbIcon =
      status === "completed" ? <Check className="h-6 w-6" /> : <ArrowRight className="h-6 w-6" />;
    // Determine the text for the track
    const trackText =
      status === "completed"
        ? completedText
        : status === "sliding" && position >= thumbWidth
          ? slidingAtEndingText
          : readyText;

    return (
      <div className="flex w-full flex-col items-center gap-6 p-4 md:p-8">
        {/* Slider Track */}
        <div
          ref={trackRef}
          className={`relative h-16 w-full max-w-xs overflow-hidden rounded-full border-2 transition-colors duration-300 ease-in-out sm:max-w-sm ${
            status === "completed" ? "border-primary bg-primary/10" : "border-muted bg-muted"
          }`}
          style={{ width: `${sliderWidth}px` }}
        >
          {/* Text inside the track */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span
              className={`text-base font-medium transition-opacity duration-300 ease-in-out sm:text-lg ${
                status === "completed" ? "text-primary" : "text-muted-foreground"
              } ${status === "sliding" && position > thumbWidth / 2 && position < maxPosition ? "opacity-0" : "opacity-100"}`}
            >
              {readyText}
            </span>
          </div>

          {/* Filled progress part of the track */}
          <div
            className={`absolute top-0 bottom-0 left-0 h-full rounded-full ${
              status === "completed" ? "bg-primary" : "bg-primary"
            }`}
            style={{
              width: `${status === "completed" ? sliderWidth : position + thumbWidth / 2}px`,
              transition: isDragging
                ? "none"
                : "width 0.2s ease-out, background-color 0.3s ease-in-out",
            }}
          />

          {/* Combined progress bar and thumb */}
          <div
            ref={thumbRef}
            className={`absolute top-0 bottom-0 left-0 flex h-full items-center rounded-full shadow-lg transition-colors duration-300 ease-in-out ${
              status === "completed"
                ? "bg-primary text-primary-foreground"
                : "bg-primary text-primary-foreground"
            }`}
            style={{
              width: `${status === "completed" ? sliderWidth : position + thumbWidth}px`,
              transition: isDragging
                ? "none"
                : "width 0.2s ease-out, background-color 0.3s ease-in-out",
            }}
            onMouseDown={onMouseDown}
            onTouchStart={onTouchStart}
            role="slider"
            aria-valuemin={0}
            aria-valuemax={maxPosition}
            aria-valuenow={position}
            aria-label="Unlock slider"
          >
            <div className="relative flex h-full w-full items-center justify-center">
              {((status === "sliding" && position >= threshold) || status === "completed") && (
                <span className="text-sm font-medium">{trackText}</span>
              )}
              <div className="absolute right-0 flex h-full w-16 items-center justify-center">
                <span className="text-2xl font-semibold">{thumbIcon}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

SlideToDo.displayName = "SlideToDo";

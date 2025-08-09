import { BsGrid, BsTable } from "react-icons/bs";
import { ViewMode } from "./PeriodToggle";

type ViewToggleProps = {
  viewMode: ViewMode;
  onChange: (mode: ViewMode) => void;
};

export default function ViewToggle({ viewMode, onChange }: ViewToggleProps) {
  return (
    <div className="inline-flex rounded-full bg-[var(--toggle-bg)] p-1 shadow-md dark:bg-[var(--toggle-bg-dark)] dark:shadow-[0_0_20px_rgba(255,255,255,0.15)]">
      <button
        className={`rounded-full px-2 py-1 sm:px-3 sm:py-1.5 ${
          viewMode === "card"
            ? "bg-primary text-white shadow-xs dark:bg-white/80 dark:text-gray-800"
            : "text-gray-600 hover:bg-[var(--toggle-bg-hover)] hover:text-gray-800 dark:text-gray-400 dark:hover:bg-[var(--toggle-bg-hover-dark)] dark:hover:text-gray-200"
        }`}
        onClick={() => onChange("card")}
        aria-label="Card View"
      >
        <BsGrid className="h-4 w-4 sm:h-5 sm:w-5" />
      </button>
      <button
        className={`rounded-full px-2 py-1 sm:px-3 sm:py-1.5 ${
          viewMode === "table"
            ? "bg-primary text-white shadow-xs dark:bg-white/80 dark:text-gray-800"
            : "text-gray-600 hover:bg-[var(--toggle-bg-hover)] hover:text-gray-800 dark:text-gray-400 dark:hover:bg-[var(--toggle-bg-hover-dark)] dark:hover:text-gray-200"
        }`}
        onClick={() => onChange("table")}
        aria-label="Table View"
      >
        <BsTable className="h-4 w-4 sm:h-5 sm:w-5" />
      </button>
    </div>
  );
}

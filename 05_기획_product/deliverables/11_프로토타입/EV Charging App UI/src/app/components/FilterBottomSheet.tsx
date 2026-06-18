import { X, RotateCcw } from "lucide-react";
import { Drawer } from "vaul";

interface FilterBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  options: { id: string; label: string }[];
  selectedOptions: Set<string>;
  onSelectionChange: (selected: Set<string>) => void;
  onApply: () => void;
  onReset: () => void;
}

export function FilterBottomSheet({
  isOpen,
  onClose,
  title,
  options,
  selectedOptions,
  onSelectionChange,
  onApply,
  onReset,
}: FilterBottomSheetProps) {
  const toggleOption = (id: string) => {
    const newSelected = new Set(selectedOptions);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    onSelectionChange(newSelected);
  };

  return (
    <Drawer.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <Drawer.Content className="bg-white flex flex-col rounded-t-3xl max-h-[80vh] fixed bottom-0 left-0 right-0 z-50">
          {/* Handle */}
          <div className="px-6 pt-4 pb-2">
            <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto" />
          </div>

          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <Drawer.Title className="text-xl font-semibold text-slate-900">{title}</Drawer.Title>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={20} className="text-slate-600" />
              </button>
            </div>
            <Drawer.Description className="sr-only">
              Filter options for {title}
            </Drawer.Description>
          </div>

          {/* Options */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="grid grid-cols-2 gap-3">
              {options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => toggleOption(option.id)}
                  className={`p-4 rounded-xl border-2 transition-all text-sm font-medium ${
                    selectedOptions.has(option.id)
                      ? "border-orange-500 bg-orange-50 text-orange-700"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-200 flex gap-3">
            <button
              onClick={onReset}
              className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-slate-200 rounded-xl text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
            >
              <RotateCcw size={18} />
              <span>Reset</span>
            </button>
            <button
              onClick={onApply}
              className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl py-3 font-semibold shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 transition-all"
            >
              Apply
            </button>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

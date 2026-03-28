import { useState } from "react";

interface Props {
  message: string;
  recipientName: string;
  onSend: () => void;
  onEdit: (msg: string) => void;
  onCancel: () => void;
}

export function MessagePreview({ message, recipientName, onSend, onEdit, onCancel }: Props) {
  const [sent, setSent] = useState(false);

  function handleSend() {
    setSent(true);
    onSend();
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-end justify-center z-50">
      <div className="w-full max-w-md bg-white rounded-t-3xl px-5 pt-5 pb-10 flex flex-col gap-4">
        <div className="w-10 h-1 bg-[#E5E5EA] rounded-full mx-auto -mt-1" />

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-black font-semibold text-base">
              {sent ? "Message Sent!" : "Message Draft"}
            </h2>
            <p className="text-[#8E8E93] text-xs mt-0.5">To: {recipientName}</p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="text-[#8E8E93] text-sm w-7 h-7 bg-[#F2F2F7] rounded-full flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        {sent ? (
          <div className="flex flex-col items-center gap-3 py-6">
            <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center">
              <span className="text-2xl">✓</span>
            </div>
            <p className="text-black font-semibold text-sm">Sent to {recipientName}</p>
            <p className="text-[#8E8E93] text-xs text-center leading-relaxed">
              Tap ✕ to continue browsing and select more options
            </p>
          </div>
        ) : (
          <>
            <div className="bg-[#F2F2F7] rounded-2xl rounded-tl-sm p-4">
              <textarea
                aria-label="Message text"
                className="w-full bg-transparent text-black text-sm resize-none focus:outline-none min-h-[100px]"
                value={message}
                onChange={(e) => onEdit(e.target.value)}
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 rounded-2xl bg-[#F2F2F7] py-3 text-sm font-semibold text-black"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSend}
                className="flex-1 rounded-2xl bg-black py-3 text-sm font-semibold text-white"
              >
                Send
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

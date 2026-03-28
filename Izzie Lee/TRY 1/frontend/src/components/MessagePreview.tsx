interface Props {
  message: string;
  recipientName: string;
  onSend: () => void;
  onEdit: (msg: string) => void;
  onCancel: () => void;
}

export function MessagePreview({ message, recipientName, onSend, onEdit, onCancel }: Props) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-end justify-center z-50">
      <div className="w-full max-w-lg bg-white rounded-t-3xl p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-lg">AI-Drafted Message</h2>
          <button onClick={onCancel} className="text-gray-400 text-xl">✕</button>
        </div>
        <p className="text-sm text-gray-500">To: <span className="font-medium text-gray-800">{recipientName}</span></p>
        <textarea
          className="w-full rounded-xl border border-gray-200 p-3 text-sm resize-none min-h-[120px] focus:outline-none focus:ring-2 focus:ring-indigo-400"
          value={message}
          onChange={(e) => onEdit(e.target.value)}
        />
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl border border-gray-200 py-2 text-sm text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onSend}
            className="flex-1 rounded-xl bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
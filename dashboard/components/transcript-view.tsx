// HR sends `transcript` as a JSON-encoded array of turn objects with lots
// of metadata (id, start/end ms, tool_calls, role: 'tool', etc.). For the
// Sheet we only want the human-readable conversation — agent and carrier
// lines, in order, no system-y noise.

import { cn } from '@/lib/utils';

type Turn = {
  role?: string;
  content?: string;
  tool_calls?: unknown;
};

function parseTranscript(raw: string | null | undefined): Turn[] | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Turn[]) : null;
  } catch {
    return null;
  }
}

export function TranscriptView({ raw }: { raw: string | null | undefined }) {
  if (!raw) {
    return <p className="text-sm text-muted-foreground">No transcript.</p>;
  }

  const turns = parseTranscript(raw);

  // Fallback for non-JSON transcripts — render the raw text as-is.
  if (!turns) {
    return (
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
        {raw}
      </p>
    );
  }

  const filtered = turns.filter(
    (t) =>
      (t.role === 'assistant' || t.role === 'user') &&
      typeof t.content === 'string' &&
      t.content.trim().length > 0,
  );

  if (filtered.length === 0) {
    return <p className="text-sm text-muted-foreground">No transcript content.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {filtered.map((t, i) => {
        const isCarrier = t.role === 'user';
        const prev = filtered[i - 1];
        const sameSpeakerAsPrev = prev && prev.role === t.role;
        return (
          <div
            key={i}
            className={cn(
              'flex',
              isCarrier ? 'justify-end' : 'justify-start',
              // Tighter spacing for back-to-back turns from the same speaker.
              sameSpeakerAsPrev ? '-mt-1' : 'mt-1',
            )}
          >
            <div
              className={cn(
                'max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed',
                isCarrier
                  ? 'bg-foreground text-background rounded-br-md'
                  : 'bg-muted text-foreground rounded-bl-md',
              )}
            >
              {t.content}
            </div>
          </div>
        );
      })}
    </div>
  );
}

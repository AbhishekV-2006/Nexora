import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useApi } from "../context/ApiContext";
import { useAuth } from "../context/AuthContext";
import PageShell from "../components/PageShell";
import { io } from "socket.io-client";

const idOf = (value) => String(value?._id || value?.id || value || "");
const errorText = (error, fallback) => {
  const detail = error.response?.data?.error;
  return typeof detail === "string" ? detail : detail?.message || fallback;
};

export default function MessagesPage() {
  const api = useApi();
  const { user, token } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedRecipient = searchParams.get("with");
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);
  const socketRef = useRef(null);
  const activeIdRef = useRef(activeId);
  const activeConversation = useMemo(() => conversations.find((item) => idOf(item) === activeId), [conversations, activeId]);
  const otherUser = activeConversation?.participants?.find((person) => idOf(person) !== idOf(user));

  const refreshConversations = useCallback(async () => {
    const { data } = await api.getConversations();
    const items = data.conversations || [];
    setConversations(items);
    return items;
  }, [api]);

  useEffect(() => { activeIdRef.current = activeId; }, [activeId]);

  useEffect(() => {
    if (!token) return undefined;
    const apiUrl = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:5001/api" : "/api");
    const socketOrigin = apiUrl.startsWith("/") ? window.location.origin : apiUrl.replace(/\/api\/?$/, "");
    const socket = io(socketOrigin, { auth: { token }, transports: ["websocket"] });
    socketRef.current = socket;
    socket.on("connect", () => setSocketConnected(true));
    socket.on("disconnect", () => setSocketConnected(false));
    socket.on("connect_error", (err) => {
      setSocketConnected(false);
      setError(err.message || "Live chat connection failed.");
    });
    socket.on("message:new", (message) => {
      if (idOf(message.conversation) !== activeIdRef.current) return;
      setMessages((current) => current.some((item) => idOf(item) === idOf(message)) ? current : [...current, message]);
    });
    socket.on("conversation:updated", () => { refreshConversations().catch(() => {}); });
    return () => {
      socket.disconnect();
      socketRef.current = null;
      setSocketConnected(false);
    };
  }, [token, refreshConversations]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await api.getConversations();
        if (cancelled) return;
        const items = data.conversations || [];
        setConversations(items);
        if (requestedRecipient) {
          const existing = items.find((item) => item.participants?.some((person) => idOf(person) === requestedRecipient));
          if (existing) setActiveId(idOf(existing));
          else {
            const started = await api.startConversation(requestedRecipient);
            if (cancelled) return;
            const conversation = started.data.conversation;
            setConversations((prev) => [conversation, ...prev.filter((item) => idOf(item) !== idOf(conversation))]);
            setActiveId(idOf(conversation));
          }
          setSearchParams({}, { replace: true });
        } else if (items.length) {
          setActiveId((previous) => previous && items.some((item) => idOf(item) === previous) ? previous : idOf(items[0]));
        }
      } catch (err) {
        if (!cancelled) setError(errorText(err, "Could not load your conversations."));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [api, requestedRecipient, setSearchParams]);

  useEffect(() => {
    if (!activeId) { setMessages([]); return undefined; }
    let cancelled = false;
    setMessages([]);
    const loadMessages = async () => {
      try {
        const { data } = await api.getMessages(activeId);
        if (!cancelled) setMessages(data.messages || []);
      } catch (err) {
        if (!cancelled) setError(errorText(err, "Could not load messages."));
      }
    };
    loadMessages();
    return () => { cancelled = true; };
  }, [api, activeId]);

  useEffect(() => {
    if (!activeId || !socketConnected) return;
    socketRef.current?.emit("conversation:join", { conversationId: activeId }, (result) => {
      if (result?.error) setError(result.error);
      else if (result?.messages) setMessages((current) => {
        const merged = new Map(result.messages.map((message) => [idOf(message), message]));
        current.forEach((message) => merged.set(idOf(message), message));
        return [...merged.values()].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      });
    });
  }, [activeId, socketConnected]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async (event) => {
    event.preventDefault();
    const content = draft.trim();
    if (!content || !activeId || sending || !socketRef.current?.connected) return;
    setSending(true);
    setError("");
    try {
      socketRef.current.timeout(10000).emit("message:send", { conversationId: activeId, content }, (timeoutError, result) => {
        if (timeoutError) {
          setError("Message delivery timed out. Check your connection and try again.");
          setSending(false);
          return;
        }
        if (result?.error) {
          setError(result.error);
          setSending(false);
          return;
        }
        const message = result?.message;
        if (message) setMessages((current) => current.some((item) => idOf(item) === idOf(message)) ? current : [...current, message]);
        setDraft("");
        setSending(false);
      });
    } catch (err) {
      setError(errorText(err, "Message could not be sent."));
      setSending(false);
    }
  };

  return (
    <PageShell>
      <main className="mx-auto max-w-6xl">
        <header className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-300">Your inbox</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Messages</h1>
          <p className="mt-2 text-slate-400">Talk directly with clients and freelancers about their work.</p>
        </header>
        {error && <div role="alert" className="mb-4 rounded-xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{error}</div>}
        <section className="grid min-h-[560px] overflow-hidden rounded-3xl border border-white/10 bg-slate-900/80 md:grid-cols-[300px_1fr]">
          <aside className="border-b border-white/10 md:border-b-0 md:border-r">
            <div className="border-b border-white/10 px-5 py-4 font-semibold text-white">Conversations</div>
            {loading ? <p className="p-5 text-sm text-slate-400">Loading conversations…</p> : conversations.length === 0 ? <p className="p-5 text-sm leading-6 text-slate-400">No conversations yet. Open a freelancer or client profile and select Message to start one.</p> : (
              <ul className="max-h-[250px] overflow-y-auto md:max-h-[500px]">
                {conversations.map((conversation) => {
                  const person = conversation.participants?.find((item) => idOf(item) !== idOf(user));
                  const id = idOf(conversation);
                  return <li key={id}><button onClick={() => setActiveId(id)} className={`w-full border-b border-white/5 px-5 py-4 text-left transition hover:bg-white/5 ${activeId === id ? "bg-indigo-500/10" : ""}`}>
                    <span className="block font-medium text-white">{person?.name || "Nexora member"}</span>
                    <span className="mt-1 block truncate text-sm text-slate-400">{conversation.lastMessage?.content || "Start a conversation"}</span>
                  </button></li>;
                })}
              </ul>
            )}
          </aside>
          <div className="flex min-h-[480px] flex-col">
            {activeConversation ? <>
              <div className="border-b border-white/10 px-5 py-4"><div className="font-semibold text-white">{otherUser?.name || "Conversation"}</div><div className="text-xs capitalize text-slate-400">{otherUser?.role || "Nexora member"} · {socketConnected ? "Live" : "Connecting to live chat…"}</div></div>
              <div className="flex-1 space-y-3 overflow-y-auto px-4 py-5 sm:px-6">
                {messages.length === 0 && <p className="py-12 text-center text-sm text-slate-400">This conversation is ready. Send the first message.</p>}
                {messages.map((message) => {
                  const mine = idOf(message.sender) === idOf(user);
                  return <div key={idOf(message)} className={`flex ${mine ? "justify-end" : "justify-start"}`}><div className={`max-w-[85%] rounded-2xl px-4 py-3 sm:max-w-[70%] ${mine ? "bg-indigo-600 text-white" : "border border-white/10 bg-slate-800 text-slate-100"}`}><p className="whitespace-pre-wrap break-words text-sm">{message.content}</p><time className="mt-1 block text-right text-[10px] opacity-70">{new Date(message.createdAt).toLocaleString()}</time></div></div>;
                })}
                <div ref={bottomRef} />
              </div>
              <form onSubmit={send} className="flex gap-3 border-t border-white/10 p-4 sm:p-5">
                <label className="sr-only" htmlFor="message-composer">Write a message</label>
                <input id="message-composer" value={draft} onChange={(event) => setDraft(event.target.value)} maxLength={4000} placeholder="Write a message…" className="min-w-0 flex-1 rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-indigo-400" />
                <button disabled={!draft.trim() || sending || !socketConnected} className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50">{sending ? "Sending…" : socketConnected ? "Send" : "Connecting…"}</button>
              </form>
            </> : <div className="flex flex-1 items-center justify-center px-6 text-center text-slate-400">{loading ? "Loading your inbox…" : "Choose a conversation to read and reply."}</div>}
          </div>
        </section>
      </main>
    </PageShell>
  );
}

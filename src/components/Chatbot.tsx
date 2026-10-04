import React, { useState, useEffect, useRef } from 'react';
import { Ico } from './MockupIcons';
import { pickAnswer, SUGGESTED_QUESTIONS } from '../data/chatbotKnowledge';

interface Message {
  id: string;
  sender: 'bot' | 'me';
  text: string;
  chips?: boolean;
}

interface ChatbotProps {
  user: string;
  role: string;
  roleLabel: string;
  pjClass?: string | null;
}

export const Chatbot: React.FC<ChatbotProps> = ({ user, role, roleLabel, pjClass }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [hasStarted, setHasStarted] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const msgsEndRef = useRef<HTMLDivElement>(null);

  const resetChat = () => {
    setHasStarted(false);
    setMessages([
      {
        id: 'init-1',
        sender: 'bot',
        text: 'Halo kak! Aku chatbot UT Family. Aku bisa bantu soal katalog UT dan cara memakai web ini. Klik tombol di bawah untuk memulai.',
      }
    ]);
  };

  useEffect(() => {
    resetChat();
  }, [user]);

  useEffect(() => {
    msgsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleStart = () => {
    setHasStarted(true);
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), sender: 'me', text: 'Mulai tanya' }
    ]);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: 'Silakan kak, mau tanya apa? Ketik pertanyaanmu atau pilih saran di bawah.',
          chips: true
        }
      ]);
    }, 250);
  };

  const handleAsk = (queryText: string) => {
    if (!queryText.trim() || isTyping) return;
    const cleanText = queryText.trim();
    setInput('');
    if (!hasStarted) setHasStarted(true);

    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), sender: 'me', text: cleanText }
    ]);

    setIsTyping(true);
    setTimeout(() => {
      const response = pickAnswer(cleanText, {
        user,
        role,
        roleLabel,
        pjClass: pjClass || undefined
      });
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: 'bot',
          text: response.text,
          chips: response.chips
        }
      ]);
    }, 350);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleEndAndClose = () => {
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), sender: 'me', text: 'Selesai dan tutup' }
    ]);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), sender: 'bot', text: 'Semoga terbantu dan semangat kak' }
      ]);
      setTimeout(() => {
        setIsOpen(false);
        setTimeout(resetChat, 400);
      }, 1500);
    }, 300);
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        className={`fab ${isOpen ? 'open' : 'on'}`}
        id="fab"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Chatbot"
        title="Chatbot"
        aria-expanded={isOpen}
        type="button"
      >
        <Ico name="chat" size={24} />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="chat on" id="chat" role="dialog" aria-label="Chatbot UT Family">
          <div className="ph">
            <span>Chatbot UT Family</span>
            <button id="x" onClick={handleClose} aria-label="Tutup" type="button">
              &times;
            </button>
          </div>

          <div className="msgs" id="msgs">
            {messages.map((m, idx) => (
              <div key={m.id} className={`msg ${m.sender}`}>
                <div>{m.text}</div>
                {/* Action button on init */}
                {m.id === 'init-1' && !hasStarted && (
                  <div className="chips" style={{ marginTop: '10px' }}>
                    <button
                      type="button"
                      className="go"
                      onClick={handleStart}
                    >
                      Mulai tanya
                    </button>
                  </div>
                )}
                {/* Suggested Chips */}
                {m.chips && (
                  <div className="chips">
                    {SUGGESTED_QUESTIONS.map((q) => (
                      <button key={q} type="button" onClick={() => handleAsk(q)}>
                        {q}
                      </button>
                    ))}
                  </div>
                )}
                {/* Next actions on bot messages */}
                {m.sender === 'bot' && hasStarted && idx === messages.length - 1 && !isTyping && (
                  <div className="chips act">
                    <button
                      type="button"
                      onClick={() => {
                        setMessages((prev) => [
                          ...prev,
                          { id: Date.now().toString(), sender: 'me', text: 'Ada lagi?' },
                          { id: (Date.now() + 1).toString(), sender: 'bot', text: 'Silakan kak, mau tanya apa lagi?', chips: true }
                        ]);
                      }}
                    >
                      Ada lagi?
                    </button>
                    <button
                      type="button"
                      className="end"
                      onClick={handleEndAndClose}
                    >
                      Selesai dan tutup
                    </button>
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="msg bot" style={{ fontStyle: 'italic', opacity: 0.8 }}>
                Mengetik...
              </div>
            )}
            <div ref={msgsEndRef} />
          </div>

          {/* Input Form */}
          {hasStarted && (
            <form
              className="ask"
              id="cf"
              onSubmit={(e) => {
                e.preventDefault();
                handleAsk(input);
              }}
            >
              <input
                id="q"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ketik pertanyaan..."
                aria-label="Pertanyaan"
                autoFocus
              />
              <button type="submit" disabled={!input.trim()}>
                Kirim
              </button>
            </form>
          )}
        </div>
      )}
    </>
  );
};

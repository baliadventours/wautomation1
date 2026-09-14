import React, { useState } from 'react';
import { Conversation, Message, TripboneBookingContext } from '../types';
import { 
  Search, 
  Send, 
  CheckCheck, 
  Check, 
  Paperclip, 
  Sparkles, 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign, 
  Car, 
  Clock, 
  ExternalLink, 
  Tag, 
  Bot, 
  UserCheck, 
  MessageSquare,
  AlertCircle,
  FileText,
  Navigation,
  Download,
  ShieldAlert,
  Compass
} from 'lucide-react';

interface InboxViewProps {
  conversations: Conversation[];
  onSendMessage: (conversationId: string, text: string) => void;
  onSimulateIncoming: (conversationId: string, text: string) => void;
  onTriggerBookingReminder: (booking: TripboneBookingContext, conversationId: string) => void;
  onSendPdfVoucher?: (booking: TripboneBookingContext, conversationId: string) => void;
}

export const InboxView: React.FC<InboxViewProps> = ({
  conversations,
  onSendMessage,
  onSimulateIncoming,
  onTriggerBookingReminder,
  onSendPdfVoucher,
}) => {
  const [selectedId, setSelectedId] = useState<string>(conversations[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTagFilter, setSelectedTagFilter] = useState<string>('All');
  const [inputText, setInputText] = useState('');
  const [simulatedCustomerText, setSimulatedCustomerText] = useState('Can you confirm our sunrise pickup time again?');
  const [showAttachMenu, setShowAttachMenu] = useState(false);

  // Realistic sample messages for selected conversation
  const [messagesMap, setMessagesMap] = useState<Record<string, Message[]>>({
    'conv-1': [
      {
        id: 'm1',
        conversationId: 'conv-1',
        sender: 'system',
        text: 'Tripbone booking #TB-89412 linked automatically to this WhatsApp conversation.',
        timestamp: '10:00 AM',
        status: 'read',
      },
      {
        id: 'm2',
        conversationId: 'conv-1',
        sender: 'business',
        senderName: 'Workflow Engine',
        text: 'Hello Marcus! Thank you for booking the Mount Batur Sunrise Trek via Tripbone. Your booking #TB-89412 is confirmed.',
        timestamp: '10:01 AM',
        status: 'read',
        isAutomated: true,
      },
      {
        id: 'm3',
        conversationId: 'conv-1',
        sender: 'customer',
        text: 'Great! What time will our private driver arrive at Padma Resort?',
        timestamp: '10:42 AM',
        status: 'read',
      },
    ],
    'conv-2': [
      {
        id: 'm201',
        conversationId: 'conv-2',
        sender: 'customer',
        text: 'Is the Nusa Penida speedboat ticket included in this package?',
        timestamp: '09:18 AM',
        status: 'read',
      },
    ],
    'conv-3': [
      {
        id: 'm301',
        conversationId: 'conv-3',
        sender: 'customer',
        text: 'Thank you for organizing the driver. The tour was incredible!',
        timestamp: 'Yesterday 06:40 PM',
        status: 'read',
      },
      {
        id: 'm302',
        conversationId: 'conv-3',
        sender: 'business',
        senderName: 'Wayan Putra',
        text: 'Thank you so much David! We are thrilled you enjoyed the Uluwatu sunset & seafood dinner.',
        timestamp: 'Yesterday 06:55 PM',
        status: 'read',
      },
    ],
  });

  const selectedConv = conversations.find((c) => c.id === selectedId) || conversations[0];
  const activeMessages = messagesMap[selectedConv?.id] || [];

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg: Message = {
      id: 'msg-' + Date.now(),
      conversationId: selectedConv.id,
      sender: 'business',
      senderName: 'Agent',
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'delivered',
    };

    setMessagesMap((prev) => ({
      ...prev,
      [selectedConv.id]: [...(prev[selectedConv.id] || []), newMsg],
    }));

    onSendMessage(selectedConv.id, inputText.trim());
    setInputText('');
  };

  const handleSendPdfVoucherClick = () => {
    if (!selectedConv?.tripboneBooking) return;
    const b = selectedConv.tripboneBooking;
    const voucherMsg: Message = {
      id: 'msg-' + Date.now(),
      conversationId: selectedConv.id,
      sender: 'business',
      senderName: 'Voucher Engine',
      text: `Official Tour Voucher & Pickup Guide for ${b.tourName}. Reference: #${b.bookingId}.`,
      mediaUrl: `https://api.tripbone.com/v1/vouchers/${b.bookingId}.pdf`,
      mediaType: 'document',
      fileName: `Voucher-${b.bookingId}.pdf`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'delivered',
      isAutomated: true,
    };

    setMessagesMap((prev) => ({
      ...prev,
      [selectedConv.id]: [...(prev[selectedConv.id] || []), voucherMsg],
    }));

    if (onSendPdfVoucher) {
      onSendPdfVoucher(b, selectedConv.id);
    } else {
      onSendMessage(selectedConv.id, `[DOCUMENT: Voucher-${b.bookingId}.pdf] Official voucher dispatched.`);
    }
    setShowAttachMenu(false);
  };

  const handleSendLocationPin = () => {
    const loc = {
      latitude: -8.5192,
      longitude: 115.2635,
      title: selectedConv.tripboneBooking?.pickupLocation || 'Padma Resort Ubud Lobby',
      address: 'Banjar Carik, Desa Puhu Payangan, Ubud, Bali 80572',
    };

    const locationMsg: Message = {
      id: 'msg-' + Date.now(),
      conversationId: selectedConv.id,
      sender: 'business',
      senderName: 'Driver Coordination',
      text: `Driver pickup pinpoint location coordinates:`,
      location: loc,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'delivered',
    };

    setMessagesMap((prev) => ({
      ...prev,
      [selectedConv.id]: [...(prev[selectedConv.id] || []), locationMsg],
    }));

    onSendMessage(selectedConv.id, `[LOCATION PIN: ${loc.title}] Coordinates sent.`);
    setShowAttachMenu(false);
  };

  const handleSimulateReceive = () => {
    if (!simulatedCustomerText.trim()) return;
    const text = simulatedCustomerText.trim();
    const incoming: Message = {
      id: 'msg-' + Date.now(),
      conversationId: selectedConv.id,
      sender: 'customer',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'read',
    };

    const isOptOutWord = ['stop', 'berhenti', 'unsubscribe', 'cancel', 'quit'].includes(text.toLowerCase());
    const isOptInWord = ['start', 'mulai', 'resume'].includes(text.toLowerCase());

    const extraMessages: Message[] = [];
    if (isOptOutWord) {
      selectedConv.isOptedOut = true;
      extraMessages.push({
        id: 'msg-opt-' + Date.now(),
        conversationId: selectedConv.id,
        sender: 'system',
        text: 'AUTOMATED COMPLIANCE: Guest opted out. Automated WhatsApp reminders silenced.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'read',
      });
    } else if (isOptInWord) {
      selectedConv.isOptedOut = false;
      extraMessages.push({
        id: 'msg-optin-' + Date.now(),
        conversationId: selectedConv.id,
        sender: 'system',
        text: 'AUTOMATED COMPLIANCE: Guest re-subscribed to WhatsApp tour updates.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'read',
      });
    }

    setMessagesMap((prev) => ({
      ...prev,
      [selectedConv.id]: [...(prev[selectedConv.id] || []), incoming, ...extraMessages],
    }));

    onSimulateIncoming(selectedConv.id, text);
    setSimulatedCustomerText('');
  };

  const filteredConversations = conversations.filter((c) => {
    const matchesSearch = c.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phoneNumber.includes(searchQuery);
    const matchesTag = selectedTagFilter === 'All' || c.tags.includes(selectedTagFilter);
    return matchesSearch && matchesTag;
  });

  const quickReplies = [
    "Hello! Your private driver Pak Made will arrive at your hotel lobby at 02:30 AM WITA.",
    "Your Tripbone booking voucher is attached. Please prepare comfortable hiking shoes and a warm jacket.",
    "Yes, all harbor taxes, fast boat transfers, and island entry fees are 100% included in the package.",
  ];

  return (
    <div className="h-[calc(100vh-4rem)] flex overflow-hidden bg-neutral-100">
      {/* 1. Left: Conversation List Panel */}
      <div className="w-80 border-r border-neutral-200 bg-white flex flex-col shrink-0">
        {/* Search & Filter Header */}
        <div className="p-3 border-b border-neutral-200 space-y-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search contact or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-400"
            />
          </div>

          <div className="flex gap-1 overflow-x-auto pb-1 text-[11px]">
            {['All', '#tripbone-booking', '#inquiry', '#vip'].map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTagFilter(tag)}
                className={`px-2 py-0.5 rounded-full whitespace-nowrap transition cursor-pointer ${
                  selectedTagFilter === tag
                    ? 'bg-neutral-900 text-white font-medium'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto divide-y divide-neutral-100">
          {filteredConversations.map((c) => {
            const isSelected = c.id === selectedConv?.id;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedId(c.id)}
                className={`w-full text-left p-3 flex items-start gap-3 transition cursor-pointer hover:bg-neutral-50 ${
                  isSelected ? 'bg-emerald-50/60 border-l-3 border-emerald-600' : ''
                }`}
              >
                <img
                  src={c.avatarUrl}
                  alt={c.customerName}
                  className="w-10 h-10 rounded-full object-cover shrink-0 border border-neutral-200"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-neutral-900 truncate">
                      {c.customerName}
                    </span>
                    <span className="text-[10px] text-neutral-400 shrink-0">
                      {c.lastMessageTimestamp}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500 font-mono">{c.phoneNumber}</p>
                  <p className="text-xs text-neutral-600 truncate mt-0.5">{c.lastMessage}</p>

                  <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                    {c.tripboneBooking && (
                      <span className="px-1.5 py-0.2 rounded text-[10px] bg-purple-50 text-purple-700 border border-purple-200 font-medium">
                        {c.tripboneBooking.bookingId}
                      </span>
                    )}
                    {c.tags.slice(0, 2).map((t) => (
                      <span key={t} className="px-1.5 py-0.2 rounded text-[10px] bg-neutral-100 text-neutral-600">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Center: Chat Thread View */}
      <div className="flex-1 flex flex-col bg-white border-r border-neutral-200">
        {/* Chat Header */}
        <div className="h-14 border-b border-neutral-200 px-5 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <img
              src={selectedConv.avatarUrl}
              alt={selectedConv.customerName}
              className="w-8 h-8 rounded-full object-cover border border-neutral-200"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-neutral-900">{selectedConv.customerName}</span>
                <span className="text-[11px] font-mono text-neutral-500">{selectedConv.phoneNumber}</span>
                {selectedConv.isOptedOut && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-rose-100 text-rose-800 font-semibold flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3 text-rose-600" /> Opted Out (STOP)
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-[10px] text-neutral-400">
                <span>Agent: {selectedConv.assignedAgent}</span>
                <span>•</span>
                <span className="text-emerald-600 flex items-center gap-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  WhatsApp Connected
                </span>
              </div>
            </div>
          </div>

          {/* Simulate Customer Message Control */}
          <div className="flex items-center gap-2">
            <div className="hidden xl:flex items-center gap-1">
              <input
                type="text"
                value={simulatedCustomerText}
                onChange={(e) => setSimulatedCustomerText(e.target.value)}
                placeholder="Simulate guest reply (e.g. 'STOP')..."
                className="text-[11px] px-2 py-1 bg-neutral-50 border border-neutral-200 rounded w-52"
              />
              <button
                onClick={handleSimulateReceive}
                className="px-2 py-1 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-[11px] font-medium transition cursor-pointer"
                title="Simulate customer sending message"
              >
                Inbound Sim
              </button>
            </div>
          </div>
        </div>

        {/* Opt-Out Compliance Warning Banner */}
        {selectedConv.isOptedOut && (
          <div className="bg-rose-50 border-b border-rose-200 px-4 py-2 flex items-center justify-between text-xs text-rose-800 shrink-0">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>
                <strong>Anti-Spam Compliance:</strong> Guest sent STOP / BERHENTI. Automated Tripbone marketing and notifications are silenced.
              </span>
            </div>
            <button
              onClick={() => {
                selectedConv.isOptedOut = false;
                setMessagesMap((prev) => ({
                  ...prev,
                  [selectedConv.id]: [
                    ...(prev[selectedConv.id] || []),
                    {
                      id: 'msg-resub-' + Date.now(),
                      conversationId: selectedConv.id,
                      sender: 'system',
                      text: 'Manual agent override: Guest re-subscribed to WhatsApp updates.',
                      timestamp: 'Just now',
                      status: 'read',
                    },
                  ],
                }));
              }}
              className="px-2 py-0.5 text-[11px] font-semibold bg-white border border-rose-300 text-rose-700 hover:bg-rose-100 rounded cursor-pointer transition shrink-0"
            >
              Clear Opt-Out
            </button>
          </div>
        )}

        {/* Message Bubble History */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-neutral-50/70">
          {activeMessages.map((msg) => {
            if (msg.sender === 'system') {
              return (
                <div key={msg.id} className="flex justify-center my-2">
                  <span className="px-3 py-1 rounded-full text-[11px] bg-neutral-200 text-neutral-700 font-medium flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-neutral-500" />
                    {msg.text}
                  </span>
                </div>
              );
            }

            const isMe = msg.sender === 'business';
            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div className="flex items-center gap-1 text-[10px] text-neutral-400 mb-0.5 px-1">
                  {msg.isAutomated && (
                    <span className="flex items-center gap-0.5 text-purple-600 font-medium bg-purple-50 px-1 rounded">
                      <Bot className="w-3 h-3" /> Auto Workflow
                    </span>
                  )}
                  <span>{isMe ? msg.senderName || 'Agent' : selectedConv.customerName}</span>
                </div>

                <div
                  className={`max-w-md p-3 rounded-2xl text-xs leading-relaxed shadow-xs space-y-2 ${
                    isMe
                      ? 'bg-emerald-600 text-white rounded-tr-none'
                      : 'bg-white text-neutral-800 border border-neutral-200 rounded-tl-none'
                  }`}
                >
                  {/* Rich PDF Document Attachment Preview */}
                  {msg.mediaType === 'document' && (
                    <div className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 ${
                      isMe ? 'bg-emerald-700/50 border-emerald-500' : 'bg-neutral-50 border-neutral-200'
                    }`}>
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-500 flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="truncate">
                          <div className="font-bold text-[11px] truncate">{msg.fileName || 'Tripbone_Voucher.pdf'}</div>
                          <div className={`text-[10px] ${isMe ? 'text-emerald-200' : 'text-neutral-400'}`}>
                            PDF Document • Official Voucher
                          </div>
                        </div>
                      </div>
                      <a
                        href={msg.mediaUrl || '#'}
                        target="_blank"
                        rel="noreferrer"
                        className={`p-1.5 rounded-lg shrink-0 transition ${
                          isMe ? 'hover:bg-emerald-600 text-white' : 'hover:bg-neutral-200 text-neutral-700'
                        }`}
                        title="Download Voucher"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  )}

                  {/* Google Maps Location Pin Preview */}
                  {msg.location && (
                    <div className={`p-2.5 rounded-xl border space-y-1.5 ${
                      isMe ? 'bg-emerald-700/50 border-emerald-500 text-white' : 'bg-neutral-50 border-neutral-200 text-neutral-800'
                    }`}>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
                          <Navigation className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-[11px]">{msg.location.title}</div>
                          <div className={`text-[10px] line-clamp-1 ${isMe ? 'text-emerald-200' : 'text-neutral-500'}`}>
                            {msg.location.address || 'Pickup Pin'}
                          </div>
                        </div>
                      </div>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${msg.location.latitude},${msg.location.longitude}`}
                        target="_blank"
                        rel="noreferrer"
                        className={`w-full py-1 px-2 rounded text-[10px] font-semibold text-center block transition ${
                          isMe ? 'bg-emerald-500 hover:bg-emerald-400 text-white' : 'bg-neutral-200 hover:bg-neutral-300 text-neutral-800'
                        }`}
                      >
                        Open in Google Maps ({msg.location.latitude}, {msg.location.longitude})
                      </a>
                    </div>
                  )}

                  <p>{msg.text}</p>
                  <div
                    className={`text-[10px] mt-1 flex items-center justify-end gap-1 ${
                      isMe ? 'text-emerald-100' : 'text-neutral-400'
                    }`}
                  >
                    <span>{msg.timestamp}</span>
                    {isMe && (
                      <span>
                        {msg.status === 'read' ? (
                          <CheckCheck className="w-3.5 h-3.5 text-emerald-200" />
                        ) : (
                          <Check className="w-3.5 h-3.5 text-emerald-200" />
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Reply Suggestions */}
        <div className="px-4 py-2 border-t border-neutral-100 bg-white flex items-center gap-2 overflow-x-auto">
          <span className="text-[10px] font-semibold text-neutral-400 uppercase shrink-0">Quick Snippets:</span>
          {quickReplies.map((reply, i) => (
            <button
              key={i}
              onClick={() => setInputText(reply)}
              className="px-2.5 py-1 rounded-full text-[11px] bg-neutral-100 hover:bg-neutral-200 text-neutral-700 truncate max-w-xs transition shrink-0 cursor-pointer"
            >
              {reply}
            </button>
          ))}
        </div>

        {/* Input Bar & Attachment Popup */}
        <div className="relative">
          {showAttachMenu && (
            <div className="absolute bottom-14 left-3 bg-white border border-neutral-200 shadow-xl rounded-2xl p-2 w-64 space-y-1 z-20">
              <div className="px-2 py-1 text-[10px] font-bold text-neutral-400 uppercase">WhatsApp Media Dispatch</div>
              <button
                type="button"
                onClick={handleSendPdfVoucherClick}
                className="w-full px-2.5 py-2 text-left text-xs rounded-xl hover:bg-neutral-100 text-neutral-800 flex items-center gap-2.5 cursor-pointer transition"
              >
                <FileText className="w-4 h-4 text-red-500" />
                <div>
                  <div className="font-semibold">Send Itinerary PDF Voucher</div>
                  <div className="text-[10px] text-neutral-400">Digital Tripbone voucher card</div>
                </div>
              </button>

              <button
                type="button"
                onClick={handleSendLocationPin}
                className="w-full px-2.5 py-2 text-left text-xs rounded-xl hover:bg-neutral-100 text-neutral-800 flex items-center gap-2.5 cursor-pointer transition"
              >
                <MapPin className="w-4 h-4 text-emerald-600" />
                <div>
                  <div className="font-semibold">Send Hotel Pickup GPS Pin</div>
                  <div className="text-[10px] text-neutral-400">Google Maps coordinates</div>
                </div>
              </button>
            </div>
          )}

          <form onSubmit={handleSend} className="p-3 border-t border-neutral-200 bg-white flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAttachMenu(!showAttachMenu)}
              className={`p-2 rounded-xl transition cursor-pointer ${
                showAttachMenu ? 'bg-neutral-200 text-neutral-900' : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-600'
              }`}
              title="Attach PDF voucher or location pin"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            <input
              type="text"
              placeholder="Type a WhatsApp message..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-neutral-400"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white transition cursor-pointer shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* 3. Right: Dedicated Tripbone Guest & Booking Context Sidebar */}
      <div className="w-84 bg-white flex flex-col shrink-0 overflow-y-auto p-5 space-y-5">
        <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs text-neutral-900">Tripbone SaaS Sync</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-purple-100 text-purple-800 font-semibold">
              Live API
            </span>
          </div>
          <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Synced
          </span>
        </div>

        {selectedConv.tripboneBooking ? (
          <div className="space-y-4">
            {/* Booking ID Header Card */}
            <div className="p-3.5 bg-purple-50/70 border border-purple-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-purple-700 tracking-wider">Reservation Reference</span>
                <span className="font-mono text-xs font-bold text-purple-900">{selectedConv.tripboneBooking.bookingId}</span>
              </div>
              <h4 className="font-bold text-sm text-neutral-900 leading-snug">
                {selectedConv.tripboneBooking.tourName}
              </h4>
              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="font-semibold text-neutral-700">{selectedConv.tripboneBooking.totalAmount}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                  selectedConv.tripboneBooking.paymentStatus === 'Paid'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {selectedConv.tripboneBooking.paymentStatus}
                </span>
              </div>
            </div>

            {/* Logistics Breakdown */}
            <div className="space-y-2.5 text-xs">
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-[10px] text-neutral-400 uppercase font-semibold">Pickup Time & Date</div>
                  <div className="font-medium text-neutral-800">{selectedConv.tripboneBooking.pickupTime}</div>
                  <div className="text-[11px] text-neutral-500">{selectedConv.tripboneBooking.tourDate}</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-[10px] text-neutral-400 uppercase font-semibold">Pickup Location</div>
                  <div className="font-medium text-neutral-800">{selectedConv.tripboneBooking.pickupLocation}</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Users className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-[10px] text-neutral-400 uppercase font-semibold">Party Size</div>
                  <div className="font-medium text-neutral-800">{selectedConv.tripboneBooking.pax} Passengers</div>
                </div>
              </div>

              {selectedConv.tripboneBooking.assignedDriver && (
                <div className="flex items-start gap-2.5">
                  <Car className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[10px] text-neutral-400 uppercase font-semibold">Assigned Driver</div>
                    <div className="font-medium text-neutral-800">{selectedConv.tripboneBooking.assignedDriver}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Actions for this booking */}
            <div className="pt-2 space-y-2">
              <button
                onClick={() => onTriggerBookingReminder(selectedConv.tripboneBooking!, selectedConv.id)}
                className="w-full py-2 px-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send WhatsApp Pickup Card</span>
              </button>

              <button
                onClick={handleSendPdfVoucherClick}
                className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Send Official PDF Voucher</span>
              </button>

              <button
                onClick={handleSendLocationPin}
                className="w-full py-2 px-3 rounded-lg border border-neutral-200 hover:bg-neutral-50 text-neutral-700 text-xs font-medium transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Compass className="w-3.5 h-3.5 text-neutral-500" />
                <span>Send Hotel GPS Coordinate Pin</span>
              </button>

              <button
                onClick={() => alert(`Opening reservation ${selectedConv.tripboneBooking?.bookingId} in Tripbone PMS...`)}
                className="w-full py-2 px-3 rounded-lg border border-neutral-200 hover:bg-neutral-50 text-neutral-700 text-xs font-medium transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5 text-neutral-500" />
                <span>Open in Tripbone Dashboard</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-neutral-50 rounded-xl text-center space-y-2 border border-neutral-200">
            <AlertCircle className="w-5 h-5 text-neutral-400 mx-auto" />
            <p className="text-xs text-neutral-600 font-medium">No Tripbone Booking Linked</p>
            <p className="text-[11px] text-neutral-400">
              This contact has not yet made a reservation on Tripbone or phone number did not match.
            </p>
            <button
              onClick={() => alert('Search Tripbone bookings by guest name or email')}
              className="mt-2 text-xs text-purple-700 font-semibold hover:underline"
            >
              + Search and Link Reservation
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

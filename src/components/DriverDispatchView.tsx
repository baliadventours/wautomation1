import React, { useState, useEffect } from 'react';
import { Tenant, Conversation, Driver } from '../types';
import { api } from '../services/api';
import { 
  Car, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Send, 
  UserCheck, 
  Sparkles, 
  Phone, 
  ShieldCheck, 
  RefreshCw, 
  AlertCircle, 
  Layers, 
  ChevronRight,
  Star,
  Users,
  MessageSquare,
  Radio,
  FileText,
  Download,
  Printer,
  ThumbsUp,
  Award,
  ExternalLink,
  ShieldAlert,
  Search,
  Check,
  Calendar
} from 'lucide-react';

interface DriverDispatchViewProps {
  tenant: Tenant;
  conversations: Conversation[];
  onDispatchSuccess?: (msg: string) => void;
  onRefreshConversations?: () => void;
}

export const DriverDispatchView: React.FC<DriverDispatchViewProps> = ({
  tenant,
  conversations,
  onDispatchSuccess,
  onRefreshConversations,
}) => {
  const [activeTab, setActiveTab] = useState<'dispatch' | 'reviews' | 'manifest'>('dispatch');

  // Drivers Fleet State
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loadingDrivers, setLoadingDrivers] = useState(false);
  const [selectedDriverMap, setSelectedDriverMap] = useState<Record<string, string>>({});
  const [dispatchingConvId, setDispatchingConvId] = useState<string | null>(null);
  const [lastDispatchedInfo, setLastDispatchedInfo] = useState<{
    guestName: string;
    driverName: string;
    tourName: string;
  } | null>(null);

  // Broadcast Announcement State
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState(
    '⛅ Bali Weather Update: Mount Batur summit is clear for tomorrow sunrise (15°C). Remember your light jacket and comfortable trekking shoes! Your assigned driver will meet you in the lobby at the scheduled pickup time.'
  );
  const [broadcasting, setBroadcasting] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState<any>(null);

  // Reviews Engine State
  const [selectedReviewConvId, setSelectedReviewConvId] = useState<string>(
    conversations.find((c) => Boolean(c.tripboneBooking))?.id || conversations[0]?.id || ''
  );
  const [reviewPlatform, setReviewPlatform] = useState<'tripadvisor' | 'google'>('tripadvisor');
  const [sendingReview, setSendingReview] = useState(false);
  const [reviewSimulating, setReviewSimulating] = useState(false);
  const [reviewLog, setReviewLog] = useState<{
    status: 'sent' | 'rated_positive' | 'rated_negative';
    message: string;
    rating?: number;
    feedbackText?: string;
    botResponse?: string;
  } | null>(null);

  // Manifest State
  const [manifestData, setManifestData] = useState<any>(null);
  const [loadingManifest, setLoadingManifest] = useState(false);
  const [manifestFilter, setManifestFilter] = useState('');

  const fetchDrivers = async () => {
    setLoadingDrivers(true);
    try {
      const data = await api.getDrivers();
      setDrivers(data);
    } catch (err) {
      console.error('Failed to load drivers', err);
    } finally {
      setLoadingDrivers(false);
    }
  };

  const fetchManifest = async () => {
    setLoadingManifest(true);
    try {
      const data = await api.getTourManifest(tenant.id);
      setManifestData(data);
    } catch (err) {
      console.error('Failed to load manifest', err);
    } finally {
      setLoadingManifest(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
    fetchManifest();
  }, [tenant.id]);

  // Filter conversations that have tour bookings
  const bookings = conversations.filter((c) => Boolean(c.tripboneBooking));

  const handleSelectDriver = (convId: string, driverId: string) => {
    setSelectedDriverMap((prev) => ({ ...prev, [convId]: driverId }));
  };

  const handleAssignAndDispatch = async (conv: Conversation) => {
    const driverId = selectedDriverMap[conv.id] || drivers[0]?.id;
    if (!driverId) return;

    setDispatchingConvId(conv.id);
    setLastDispatchedInfo(null);

    try {
      const res = await api.assignDriver({
        conversationId: conv.id,
        driverId,
        notifyDriver: true,
        notifyGuest: true,
      });

      if (res.success) {
        setLastDispatchedInfo({
          guestName: conv.customerName,
          driverName: res.driver?.name || 'Driver',
          tourName: conv.tripboneBooking?.tourName || 'Bali Tour',
        });
        if (onDispatchSuccess) {
          onDispatchSuccess(`Driver ${res.driver?.name} assigned to ${conv.customerName}! WhatsApp briefings queued.`);
        }
        if (onRefreshConversations) {
          onRefreshConversations();
        }
        fetchManifest();
      }
    } catch (err: any) {
      alert('Failed to dispatch driver: ' + (err.message || 'Unknown error'));
    } finally {
      setDispatchingConvId(null);
    }
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;

    setBroadcasting(true);
    setBroadcastResult(null);

    try {
      const res = await api.broadcastCampaign({
        tenantId: tenant.id,
        messageText: broadcastMessage,
        audience: 'upcoming',
      });
      setBroadcastResult(res);
      if (onDispatchSuccess) {
        onDispatchSuccess(`Broadcast of ${res.recipientCount} messages enqueued in anti-ban queue!`);
      }
    } catch (err: any) {
      setBroadcastResult({ error: err.message });
    } finally {
      setBroadcasting(false);
    }
  };

  // Dispatch review request
  const handleDispatchReview = async () => {
    if (!selectedReviewConvId) return;
    setSendingReview(true);
    try {
      const res = await api.requestReview(selectedReviewConvId, reviewPlatform);
      setReviewLog({
        status: 'sent',
        message: res.message || 'Review request sent to traveler WhatsApp!',
      });
      if (onDispatchSuccess) {
        onDispatchSuccess('Post-tour review request & photo gallery link sent!');
      }
      if (onRefreshConversations) onRefreshConversations();
    } catch (err: any) {
      alert('Failed to send review request: ' + err.message);
    } finally {
      setSendingReview(false);
    }
  };

  // Simulate traveler rating (Positive or Negative)
  const handleSimulateRating = async (rating: number, feedback: string) => {
    if (!selectedReviewConvId) return;
    setReviewSimulating(true);
    try {
      const res = await api.simulateReviewRating(selectedReviewConvId, rating, feedback);
      setReviewLog({
        status: rating >= 4 ? 'rated_positive' : 'rated_negative',
        rating,
        feedbackText: feedback,
        message: rating >= 4 
          ? 'Guest rated 5/5! TripAdvisor redirect & 15% VIP discount code (BALISUNRISE15) delivered.'
          : 'Low rating detected! Manager escalation alert triggered and private apology sent.',
        botResponse: res.botResponseText,
      });
      if (onRefreshConversations) onRefreshConversations();
    } catch (err: any) {
      alert('Failed to simulate rating: ' + err.message);
    } finally {
      setReviewSimulating(false);
    }
  };

  // Export Manifest to CSV
  const handleExportCsv = () => {
    if (!manifestData || !manifestData.entries) return;
    const headers = [
      'Manifest ID',
      'Booking ID',
      'Lead Guest',
      'Phone Number',
      'Tour Name',
      'Pickup Time',
      'Hotel Lobby',
      'Pax',
      'Assigned Driver',
      'Payment Status',
      'Amount',
      'Insurance',
    ];

    const rows = manifestData.entries.map((m: any) => [
      m.manifestId,
      m.bookingId,
      `"${m.guestName}"`,
      `"${m.guestPhone}"`,
      `"${m.tourName}"`,
      `"${m.pickupTime}"`,
      `"${m.pickupLocation}"`,
      m.pax,
      `"${m.assignedDriver}"`,
      m.paymentStatus,
      m.totalAmount,
      m.insuranceStatus,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e: any[]) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bali-adventours-manifest-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print Manifest Layout
  const handlePrintManifest = () => {
    window.print();
  };

  const activeReviewConv = conversations.find((c) => c.id === selectedReviewConvId);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Driver & Tour Operations Center</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              Tripbone Synced
            </span>
          </div>
          <p className="text-sm text-neutral-500 mt-1">
            Real-time driver dispatch, post-tour TripAdvisor review booster, and official daily passenger manifest.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsBroadcastOpen(!isBroadcastOpen)}
            className="flex items-center gap-2 px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            <Radio className="w-3.5 h-3.5 text-purple-600" />
            <span>{isBroadcastOpen ? 'Close Broadcast' : 'Weather Advisory Broadcast'}</span>
          </button>

          <button
            onClick={() => {
              fetchDrivers();
              fetchManifest();
            }}
            disabled={loadingDrivers || loadingManifest}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition cursor-pointer shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingDrivers || loadingManifest ? 'animate-spin text-emerald-600' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-200 pb-3">
        <button
          onClick={() => setActiveTab('dispatch')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'dispatch'
              ? 'bg-neutral-900 text-white shadow-xs'
              : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
          }`}
        >
          <Car className="w-4 h-4" />
          <span>Fleet & Hotel Pickup Dispatch</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-neutral-700 text-white ml-1">
            {bookings.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('reviews')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'reviews'
              ? 'bg-neutral-900 text-white shadow-xs'
              : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
          }`}
        >
          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          <span>Post-Tour Review Booster</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-200 text-amber-900 ml-1 font-bold">
            TripAdvisor & Google
          </span>
        </button>

        <button
          onClick={() => setActiveTab('manifest')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'manifest'
              ? 'bg-neutral-900 text-white shadow-xs'
              : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
          }`}
        >
          <FileText className="w-4 h-4 text-blue-500" />
          <span>Daily Tour Manifest & PPGB Insurance</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-100 text-blue-800 ml-1">
            Export
          </span>
        </button>
      </div>

      {/* Success Notification Banner */}
      {lastDispatchedInfo && activeTab === 'dispatch' && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 flex items-start gap-3 shadow-xs animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold text-sm">
              WhatsApp Pickup Briefing Successfully Dispatched!
            </div>
            <p className="text-emerald-700 leading-relaxed">
              Assigned <strong className="text-emerald-900">{lastDispatchedInfo.driverName}</strong> to <strong className="text-emerald-900">{lastDispatchedInfo.guestName}</strong> for <em>{lastDispatchedInfo.tourName}</em>. Driver was paged via WhatsApp with hotel lobby directions, and the guest received their Driver Verification Pass.
            </p>
          </div>
        </div>
      )}

      {/* Broadcast Announcement Drawer */}
      {isBroadcastOpen && (
        <div className="bg-gradient-to-r from-neutral-900 to-indigo-950 text-white rounded-2xl p-6 shadow-md border border-neutral-800 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
            <div className="flex items-center gap-2.5">
              <Radio className="w-4 h-4 text-purple-400 animate-pulse" />
              <h3 className="font-bold text-sm">Bulk Weather & Schedule Advisory Dispatcher</h3>
            </div>
            <span className="text-[11px] text-purple-300 font-mono">
              Targets: All Upcoming Bookings (Paced with Anti-Ban Queue)
            </span>
          </div>

          <form onSubmit={handleSendBroadcast} className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1">
                Announcement Message (Sent to non-opted-out travelers)
              </label>
              <textarea
                rows={3}
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                className="w-full text-xs font-sans p-3 bg-neutral-800/90 text-white border border-neutral-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-400 resize-none"
                required
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <div className="text-[11px] text-neutral-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Automatically skips opted-out contacts and applies ~3s randomized anti-ban delays.</span>
              </div>

              <button
                type="submit"
                disabled={broadcasting}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-2 shrink-0 disabled:opacity-50"
              >
                {broadcasting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>{broadcasting ? 'Enqueueing...' : 'Dispatch Broadcast to Travelers'}</span>
              </button>
            </div>
          </form>

          {broadcastResult && (
            <div className="p-3 bg-neutral-800/80 rounded-xl font-mono text-[11px] text-emerald-400 border border-neutral-700">
              {broadcastResult.success ? (
                <div>
                  ✓ {broadcastResult.message} (Estimated queue completion: {broadcastResult.estimatedDeliveryTimeSec} seconds)
                </div>
              ) : (
                <div className="text-red-400">Error: {broadcastResult.error}</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 1: FLEET & HOTEL PICKUP DISPATCH                      */}
      {/* ========================================================= */}
      {activeTab === 'dispatch' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Tour Bookings & Dispatch Controls */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <Car className="w-4 h-4 text-emerald-600" />
                <h2 className="font-bold text-base text-neutral-900">Today & Tomorrow's Tour Pickups ({bookings.length})</h2>
              </div>
              <span className="text-xs text-neutral-500">Auto-synchronized with Tripbone</span>
            </div>

            <div className="space-y-4">
              {bookings.map((conv) => {
                const booking = conv.tripboneBooking!;
                const selectedDriverId = selectedDriverMap[conv.id] || drivers[0]?.id;
                const isAssigned = Boolean(booking.assignedDriver);
                const isDispatchingThis = dispatchingConvId === conv.id;

                return (
                  <div
                    key={conv.id}
                    className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs hover:border-neutral-300 transition space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 font-mono">
                            {booking.bookingId}
                          </span>
                          <h3 className="font-bold text-sm text-neutral-900">{booking.tourName}</h3>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-neutral-500 mt-1">
                          <span className="font-medium text-neutral-800">{conv.customerName}</span>
                          <span>•</span>
                          <span className="font-mono text-neutral-600">{conv.phoneNumber}</span>
                          <span>•</span>
                          <span>{booking.pax} Guests</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          isAssigned 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {isAssigned ? 'Driver Assigned' : 'Awaiting Driver'}
                        </span>
                      </div>
                    </div>

                    {/* Pickup Logistics Bar */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-neutral-50 p-3.5 rounded-xl text-xs">
                      <div className="flex items-center gap-2 text-neutral-700">
                        <Clock className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                        <div>
                          <span className="text-[10px] text-neutral-400 block font-medium">PICKUP TIME</span>
                          <span className="font-semibold text-neutral-900">{booking.pickupTime}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-neutral-700">
                        <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                        <div className="truncate">
                          <span className="text-[10px] text-neutral-400 block font-medium">HOTEL LOBBY</span>
                          <span className="font-semibold text-neutral-900 truncate block">{booking.pickupLocation}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-neutral-700">
                        <UserCheck className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                        <div>
                          <span className="text-[10px] text-neutral-400 block font-medium">CURRENT DRIVER</span>
                          <span className="font-semibold text-neutral-900">
                            {booking.assignedDriver ? booking.assignedDriver.split('(')[0] : 'Unassigned'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Dispatch Controls */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                      <div className="flex items-center gap-2 flex-1 max-w-sm">
                        <label className="text-xs font-medium text-neutral-600 shrink-0">Assign Driver:</label>
                        <select
                          value={selectedDriverId}
                          onChange={(e) => handleSelectDriver(conv.id, e.target.value)}
                          className="w-full text-xs font-semibold px-3 py-2 bg-neutral-100 hover:bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                        >
                          {drivers.map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.name} — {d.vehicleModel} ({d.rating}★)
                            </option>
                          ))}
                        </select>
                      </div>

                      <button
                        onClick={() => handleAssignAndDispatch(conv)}
                        disabled={isDispatchingThis}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-2 shadow-xs shrink-0 disabled:opacity-50"
                      >
                        {isDispatchingThis ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Send className="w-3.5 h-3.5" />
                        )}
                        <span>
                          {isAssigned ? 'Re-Dispatch WhatsApp Pass' : 'Dispatch Driver & WhatsApp Pass'}
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right 1 Col: Registered Fleet Roster */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-600" />
                <h2 className="font-bold text-base text-neutral-900">Bali Fleet Roster</h2>
              </div>
              <span className="text-xs text-neutral-500">Live Status</span>
            </div>

            <div className="space-y-3">
              {drivers.map((driver) => (
                <div
                  key={driver.id}
                  className="bg-white rounded-2xl border border-neutral-200 p-4 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={driver.photoUrl}
                        alt={driver.name}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-full object-cover border border-neutral-200"
                      />
                      <div>
                        <div className="font-bold text-sm text-neutral-900 flex items-center gap-1.5">
                          <span>{driver.name}</span>
                          <span className="flex items-center text-amber-500 text-xs font-medium">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span>{driver.rating}</span>
                          </span>
                        </div>
                        <div className="text-[11px] text-neutral-500 font-mono">
                          {driver.phone}
                        </div>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {driver.status === 'available' ? 'Available' : 'On Trip'}
                    </span>
                  </div>

                  <div className="p-2.5 bg-neutral-50 rounded-xl text-xs space-y-1">
                    <div className="flex items-center justify-between text-neutral-700">
                      <span className="text-[11px] text-neutral-400">Vehicle:</span>
                      <span className="font-semibold">{driver.vehicleModel}</span>
                    </div>
                    <div className="flex items-center justify-between text-neutral-700">
                      <span className="text-[11px] text-neutral-400">Plate Number:</span>
                      <span className="font-mono font-bold bg-neutral-200 px-1.5 py-0.5 rounded text-[10px]">
                        {driver.licensePlate}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-neutral-700">
                      <span className="text-[11px] text-neutral-400">Experience:</span>
                      <span>{driver.totalTrips} completed tours</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-neutral-400">
                      Languages: {driver.languages.join(', ')}
                    </span>

                    <a
                      href={`https://wa.me/${driver.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: POST-TOUR REVIEW & REPUTATION BOOSTER              */}
      {/* ========================================================= */}
      {activeTab === 'reviews' && (
        <div className="space-y-6">
          {/* Top KPI Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs space-y-1">
              <span className="text-xs text-neutral-500 font-medium">Overall Rating</span>
              <div className="flex items-center gap-1.5 text-2xl font-bold text-neutral-900">
                <span>4.92</span>
                <div className="flex text-amber-400 text-sm">
                  {'★★★★★'.split('').map((s, i) => (
                    <span key={i}>{s}</span>
                  ))}
                </div>
              </div>
              <span className="text-[11px] text-emerald-600 font-semibold">1,240 Verified Reviews</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs space-y-1">
              <span className="text-xs text-neutral-500 font-medium">5-Star Conversion Rate</span>
              <div className="text-2xl font-bold text-neutral-900">94.8%</div>
              <span className="text-[11px] text-neutral-500">TripAdvisor & Google Maps</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs space-y-1">
              <span className="text-xs text-neutral-500 font-medium">VIP Promo Claims</span>
              <div className="text-2xl font-bold text-neutral-900">312</div>
              <span className="text-[11px] text-purple-700 font-semibold">Code: BALISUNRISE15</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs space-y-1">
              <span className="text-xs text-neutral-500 font-medium">Negative Review Interception</span>
              <div className="text-2xl font-bold text-emerald-700">100%</div>
              <span className="text-[11px] text-neutral-500">Privately escalated to Ketut</span>
            </div>
          </div>

          {/* Interactive Review Dispatch & Simulation Console */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
              <div>
                <h3 className="font-bold text-base text-neutral-900">Automated Review & NPS Booster Console</h3>
                <p className="text-xs text-neutral-500">
                  Deliver personalized WhatsApp review prompts with high-res tour photo gallery links after excursion completion.
                </p>
              </div>

              {/* Target Traveler Select */}
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-neutral-700">Guest:</label>
                <select
                  value={selectedReviewConvId}
                  onChange={(e) => {
                    setSelectedReviewConvId(e.target.value);
                    setReviewLog(null);
                  }}
                  className="text-xs font-semibold px-3 py-2 bg-neutral-100 border border-neutral-200 rounded-xl focus:ring-1 focus:ring-emerald-500"
                >
                  {conversations.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.customerName} ({c.tripboneBooking?.tourName || 'Bali Tour'})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Config & Dispatch Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Dispatch Controls */}
              <div className="space-y-4">
                <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-3 text-xs">
                  <div className="font-bold text-neutral-800 text-sm">Review Destination Strategy</div>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer font-medium text-neutral-700">
                      <input
                        type="radio"
                        name="platform"
                        value="tripadvisor"
                        checked={reviewPlatform === 'tripadvisor'}
                        onChange={() => setReviewPlatform('tripadvisor')}
                        className="text-emerald-600"
                      />
                      <span>TripAdvisor (Bali Adventours #1 Trekking)</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer font-medium text-neutral-700">
                      <input
                        type="radio"
                        name="platform"
                        value="google"
                        checked={reviewPlatform === 'google'}
                        onChange={() => setReviewPlatform('google')}
                        className="text-emerald-600"
                      />
                      <span>Google Maps Reviews</span>
                    </label>
                  </div>

                  <div className="pt-2 text-neutral-500 leading-relaxed text-[11px]">
                    Includes direct link to traveler's private Google Drive / Photo gallery with drone sunrise footage taken by their mountain guide.
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleDispatchReview}
                    disabled={sendingReview}
                    className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
                  >
                    {sendingReview ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    <span>Dispatch WhatsApp Review Request</span>
                  </button>
                </div>

                {/* Simulation Triggers */}
                <div className="p-4 bg-purple-50 rounded-xl border border-purple-200 space-y-2">
                  <span className="text-[11px] font-bold text-purple-900 block">SIMULATE TRAVELER RESPONSE:</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleSimulateRating(5, 'The sunrise at Mount Batur was mindblowing! Pak Made took the best photos.')}
                      disabled={reviewSimulating}
                      className="py-2 px-3 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <ThumbsUp className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Simulate 5-Star Reply</span>
                    </button>

                    <button
                      onClick={() => handleSimulateRating(2, 'Tour was okay but the pickup car air-conditioning was too weak.')}
                      disabled={reviewSimulating}
                      className="py-2 px-3 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
                      <span>Simulate 2-Star Complaint</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Live WhatsApp Screen Preview */}
              <div className="bg-[#E5DDD5] rounded-2xl p-4 border border-neutral-300 space-y-3 shadow-inner">
                <div className="text-[10px] text-neutral-600 font-bold uppercase tracking-wider flex items-center justify-between border-b border-neutral-300 pb-2">
                  <span>Guest Phone: {activeReviewConv?.customerName}</span>
                  <span className="text-[9px] text-emerald-700 font-semibold bg-emerald-100 px-2 py-0.5 rounded">
                    Tripbone Verified Tour
                  </span>
                </div>

                {/* Outbound prompt bubble */}
                <div className="flex justify-start">
                  <div className="bg-white text-neutral-900 rounded-xl rounded-tl-none p-3 text-xs max-w-[90%] shadow-xs space-y-1.5 leading-relaxed">
                    <div className="font-bold text-emerald-900">⭐ HOW WAS YOUR BALI EXPEDITION TODAY?</div>
                    <p className="text-neutral-700">
                      Hello {activeReviewConv?.customerName}! We hope you had an unforgettable adventure on your <strong>{activeReviewConv?.tripboneBooking?.tourName || 'Bali tour'}</strong> with your guide!
                    </p>
                    <div className="text-[11px] text-neutral-600 bg-neutral-50 p-2 rounded-lg border border-neutral-200">
                      📸 <strong>Tour Photos:</strong> https://photos.baliadventours.com/tours/{activeReviewConv?.tripboneBooking?.bookingId || 'today'}
                    </div>
                    <div className="text-[9px] text-neutral-400 text-right">04:30 PM • Automated</div>
                  </div>
                </div>

                {/* Guest simulation response bubble */}
                {reviewLog && reviewLog.rating && (
                  <div className="flex justify-end animate-fade-in">
                    <div className="bg-[#DCF8C6] text-neutral-900 rounded-xl rounded-tr-none p-3 text-xs max-w-[85%] shadow-xs space-y-1">
                      <div className="font-bold text-neutral-900">⭐ Rating: {reviewLog.rating}/5</div>
                      <p className="text-neutral-800">"{reviewLog.feedbackText}"</p>
                      <div className="text-[9px] text-neutral-500 text-right">04:32 PM ✓✓</div>
                    </div>
                  </div>
                )}

                {/* Automated bot response bubble */}
                {reviewLog && reviewLog.botResponse && (
                  <div className="flex justify-start animate-fade-in">
                    <div className={`rounded-xl rounded-tl-none p-3 text-xs max-w-[90%] shadow-xs space-y-1.5 leading-relaxed ${
                      reviewLog.rating && reviewLog.rating >= 4 ? 'bg-emerald-50 text-emerald-950 border border-emerald-200' : 'bg-amber-50 text-amber-950 border border-amber-200'
                    }`}>
                      <div className="whitespace-pre-line">{reviewLog.botResponse}</div>
                      <div className="text-[9px] text-neutral-500 text-right">04:32 PM • Automated</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: DAILY TOUR MANIFEST & PPGB INSURANCE               */}
      {/* ========================================================= */}
      {activeTab === 'manifest' && (
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-neutral-900">Daily Passenger & Tour Manifest</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 font-mono">
                  {manifestData?.date || 'Today'}
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">
                Official dispatch sheet for Port Authority (Sanur Harbour) & Mount Batur PPGB National Park guide insurance.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handlePrintManifest}
                className="flex items-center gap-2 px-3.5 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl text-xs font-semibold transition cursor-pointer border border-neutral-200"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Manifest</span>
              </button>

              <button
                onClick={handleExportCsv}
                className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV for Park Ranger</span>
              </button>
            </div>
          </div>

          {/* Quick Summary Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-neutral-50 p-3.5 rounded-xl text-xs">
            <div>
              <span className="text-neutral-400 block text-[10px] font-medium uppercase">Total Passengers</span>
              <span className="font-bold text-neutral-900 text-sm">{manifestData?.totalPassengers || 6} Guests</span>
            </div>
            <div>
              <span className="text-neutral-400 block text-[10px] font-medium uppercase">Active Tour Groups</span>
              <span className="font-bold text-neutral-900 text-sm">{manifestData?.totalGroups || 3} Bookings</span>
            </div>
            <div>
              <span className="text-neutral-400 block text-[10px] font-medium uppercase">Insurance Policy</span>
              <span className="font-bold text-emerald-700 text-sm">PPGB Active & Verified</span>
            </div>
            <div>
              <span className="text-neutral-400 block text-[10px] font-medium uppercase">Operator Code</span>
              <span className="font-mono text-neutral-800 text-sm">TB-VENDOR-BALI-01</span>
            </div>
          </div>

          {/* Search bar */}
          <div className="flex items-center gap-2 max-w-sm">
            <Search className="w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Filter by guest name, hotel lobby, or driver..."
              value={manifestFilter}
              onChange={(e) => setManifestFilter(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Manifest Table */}
          <div className="overflow-x-auto border border-neutral-200 rounded-2xl shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-100/70 border-b border-neutral-200 text-neutral-600 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Manifest #</th>
                  <th className="py-3 px-4">Booking ID</th>
                  <th className="py-3 px-4">Lead Traveler</th>
                  <th className="py-3 px-4">Tour / Destination</th>
                  <th className="py-3 px-4">Pickup Time</th>
                  <th className="py-3 px-4">Hotel Lobby</th>
                  <th className="py-3 px-4 text-center">Pax</th>
                  <th className="py-3 px-4">Assigned Driver</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Insurance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 font-medium text-neutral-800">
                {(manifestData?.entries || [])
                  .filter((entry: any) => {
                    if (!manifestFilter.trim()) return true;
                    const f = manifestFilter.toLowerCase();
                    return (
                      entry.guestName.toLowerCase().includes(f) ||
                      entry.pickupLocation.toLowerCase().includes(f) ||
                      entry.tourName.toLowerCase().includes(f) ||
                      entry.assignedDriver.toLowerCase().includes(f)
                    );
                  })
                  .map((entry: any) => (
                    <tr key={entry.manifestId} className="hover:bg-neutral-50/80 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-neutral-600">{entry.manifestId}</td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-purple-700">{entry.bookingId}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-neutral-900">{entry.guestName}</div>
                        <div className="text-[11px] text-neutral-400 font-mono">{entry.guestPhone}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-neutral-800">{entry.tourName}</div>
                        <div className="text-[11px] text-neutral-500">{entry.tourDate}</div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-neutral-900">{entry.pickupTime}</td>
                      <td className="py-3.5 px-4 max-w-[180px] truncate text-neutral-700" title={entry.pickupLocation}>
                        {entry.pickupLocation}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-full bg-neutral-100 font-bold font-mono">
                          {entry.pax}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-neutral-900 block">{entry.assignedDriver}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {entry.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{entry.insuranceStatus}</span>
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

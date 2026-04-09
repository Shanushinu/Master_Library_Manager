import { useState } from "react";
import { useReadingRooms, useAvailableSeats, useBookSeat, useMySeatBookings, useCancelSeatBooking, type SeatBookingItem } from "@/lib/api-extra";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Armchair, Calendar, Loader2, X, Clock, MapPin } from "lucide-react";
import { cn, formatDate, getBookingStatusColor } from "@/lib/utils";

const TIME_SLOTS = [
  { value: "morning", label: "Morning (9 AM - 1 PM)", start: "09:00", end: "13:00" },
  { value: "afternoon", label: "Afternoon (1 PM - 5 PM)", start: "13:00", end: "17:00" },
  { value: "fullday", label: "Full Day (9 AM - 5 PM)", start: "09:00", end: "17:00" },
];

export default function SeatBookingPage() {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null);
  const [bookingModal, setBookingModal] = useState<number | null>(null);
  const [selectedSlot, setSelectedSlot] = useState("fullday");

  const { data: rooms, isLoading: roomsLoading } = useReadingRooms();
  const { data: availableSeats, isLoading: seatsLoading } = useAvailableSeats(selectedRoom, selectedDate);
  const { data: myBookings, isLoading: bookingsLoading } = useMySeatBookings();
  const bookSeat = useBookSeat();
  const cancelBooking = useCancelSeatBooking();

  const currentRoom = rooms?.find(r => r.id === selectedRoom);
  const totalSeats = currentRoom?.totalSeats ?? 0;

  const handleBookSeat = () => {
    if (!selectedRoom || bookingModal === null) return;
    const slot = TIME_SLOTS.find(s => s.value === selectedSlot)!;
    bookSeat.mutate({
      roomId: selectedRoom,
      seatNumber: bookingModal,
      bookingDate: selectedDate,
      startTime: slot.start,
      endTime: slot.end,
    }, {
      onSuccess: () => { toast({ title: "Seat Booked!", description: `Seat #${bookingModal} reserved for ${formatDate(selectedDate)}` }); setBookingModal(null); },
      onError: (err: any) => toast({ title: "Booking failed", description: (err as any)?.message ?? "Could not book seat", variant: "destructive" }),
    });
  };

  // Determine seat status
  const getSeatStatus = (seatNum: number) => {
    const myBooking = myBookings?.find(b => b.seatNumber === seatNum && b.bookingDate === selectedDate && b.roomId === selectedRoom && b.status !== "CANCELLED");
    if (myBooking) return "mine";
    if (availableSeats && !availableSeats.includes(seatNum)) return "booked";
    return "available";
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Armchair className="w-6 h-6 text-blue-600" /> Seat Booking
        </h1>
        <p className="text-gray-500 text-sm mt-1">Reserve a seat in our reading rooms</p>
      </div>

      {/* Date & Room Selection */}
      <div className="flex gap-4 flex-wrap">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-gray-500 uppercase">Date</Label>
          <Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}
            min={new Date().toISOString().split("T")[0]} className="h-10 rounded-xl w-48" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-gray-500 uppercase">Reading Room</Label>
          <Select value={selectedRoom?.toString() ?? ""} onValueChange={(v) => setSelectedRoom(Number(v))}>
            <SelectTrigger className="h-10 rounded-xl w-64"><SelectValue placeholder="Select a room" /></SelectTrigger>
            <SelectContent>
              {rooms?.map(room => (
                <SelectItem key={room.id} value={room.id.toString()}>
                  <span className="flex items-center gap-2"><MapPin className="w-3 h-3" /> {room.name} ({room.totalSeats} seats)</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Seat Map */}
      {selectedRoom && (
        <Card className="border-0 shadow-sm rounded-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span>{currentRoom?.name} — Seat Map</span>
              <div className="flex gap-4 text-xs font-normal">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-500" /> Available</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-500" /> Booked</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-500" /> My Booking</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {seatsLoading ? (
              <div className="flex items-center justify-center h-32"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>
            ) : (
              <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
                {Array.from({ length: totalSeats }, (_, i) => i + 1).map(seatNum => {
                  const status = getSeatStatus(seatNum);
                  return (
                    <button key={seatNum}
                      onClick={() => status === "available" ? setBookingModal(seatNum) : undefined}
                      disabled={status === "booked"}
                      className={cn(
                        "aspect-square rounded-xl flex flex-col items-center justify-center text-xs font-medium transition-all border-2",
                        status === "available" && "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-400 hover:shadow-md cursor-pointer",
                        status === "booked" && "bg-red-50 border-red-200 text-red-400 cursor-not-allowed opacity-60",
                        status === "mine" && "bg-blue-100 border-blue-400 text-blue-700 ring-2 ring-blue-300 shadow-md"
                      )}>
                      <Armchair className="w-4 h-4 mb-0.5" />
                      {seatNum}
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!selectedRoom && !roomsLoading && (
        <Card className="border-0 shadow-sm rounded-xl">
          <CardContent className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Armchair className="w-12 h-12 mb-3 opacity-30" />
            <p className="font-medium">Select a room to view seats</p>
          </CardContent>
        </Card>
      )}

      {/* My Bookings */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">My Seat Bookings</h2>
        {bookingsLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>
        ) : myBookings && myBookings.length > 0 ? (
          <div className="space-y-2">
            {myBookings.map((b) => (
              <Card key={b.id} className="border-0 shadow-sm rounded-xl">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-50 rounded-xl p-2.5">
                      <Armchair className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{b.roomName} — Seat #{b.seatNumber}</p>
                      <div className="flex gap-3 text-xs text-gray-500 mt-0.5">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(b.bookingDate)}</span>
                        {b.startTime && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{b.startTime} - {b.endTime}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", getBookingStatusColor(b.status))}>{b.status}</span>
                    {b.status === "BOOKED" && (
                      <Button size="sm" variant="outline" className="rounded-lg text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => { cancelBooking.mutate(b.id); toast({ title: "Booking cancelled" }); }}>
                        <X className="w-3 h-3 mr-1" /> Cancel
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-0 shadow-sm rounded-xl">
            <CardContent className="text-center py-8 text-gray-400 text-sm">No seat bookings yet</CardContent>
          </Card>
        )}
      </div>

      {/* Booking Modal */}
      <Dialog open={bookingModal !== null} onOpenChange={() => setBookingModal(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Book Seat #{bookingModal}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-blue-50 rounded-xl p-3 text-sm">
              <p className="font-medium text-blue-800">{currentRoom?.name}</p>
              <p className="text-blue-600 text-xs">{formatDate(selectedDate)}</p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Time Slot</Label>
              <Select value={selectedSlot} onValueChange={setSelectedSlot}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TIME_SLOTS.map(s => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setBookingModal(null)} className="rounded-xl">Cancel</Button>
            <Button onClick={handleBookSeat} disabled={bookSeat.isPending}
              className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600">
              {bookSeat.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Booking"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

package com.lms.dto;

import com.lms.model.ReadingRoom;

public record ReadingRoomResponse(
    Long id,
    String name,
    Integer totalSeats
) {
    public static ReadingRoomResponse from(ReadingRoom room) {
        return new ReadingRoomResponse(room.getId(), room.getName(), room.getTotalSeats());
    }
}

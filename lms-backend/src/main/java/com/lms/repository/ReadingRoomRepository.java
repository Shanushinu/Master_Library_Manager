package com.lms.repository;

import com.lms.model.ReadingRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReadingRoomRepository extends JpaRepository<ReadingRoom, Long> {
    Optional<ReadingRoom> findByName(String name);
}

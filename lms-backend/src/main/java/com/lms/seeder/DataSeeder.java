package com.lms.seeder;

import com.lms.model.*;
import com.lms.model.enums.*;
import com.lms.repository.*;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final UserRepository userRepository;
    private final BookRepository bookRepository;
    private final BookCopyRepository bookCopyRepository;
    private final ReadingRoomRepository readingRoomRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("Database already seeded, skipping...");
            return;
        }
        log.info("Seeding database with initial data...");
        seedUsers();
        seedBooks();
        seedReadingRooms();
        log.info("Database seeding complete!");
    }

    private void seedUsers() {
        List<User> users = List.of(
            User.builder().email("admin@library.com").passwordHash(passwordEncoder.encode("Admin@123"))
                .name("Admin User").role(UserRole.ROLE_ADMIN).build(),
            User.builder().email("librarian@library.com").passwordHash(passwordEncoder.encode("Lib@123"))
                .name("Jane Librarian").role(UserRole.ROLE_LIBRARIAN).build(),
            User.builder().email("faculty@library.com").passwordHash(passwordEncoder.encode("Faculty@123"))
                .name("Prof. Sharma").role(UserRole.ROLE_FACULTY).collegeName("IIT Delhi").build(),
            User.builder().email("student@library.com").passwordHash(passwordEncoder.encode("Student@123"))
                .name("Rahul Student").role(UserRole.ROLE_STUDENT).studentId("STU-2024-001")
                .collegeName("IIT Delhi").build(),
            User.builder().email("member@library.com").passwordHash(passwordEncoder.encode("Member@123"))
                .name("Priya Member").role(UserRole.ROLE_MEMBER)
                .membershipExpiry(LocalDate.now().plusYears(1)).build(),
            User.builder().email("college@library.com").passwordHash(passwordEncoder.encode("Student@123"))
                .name("Amit College").role(UserRole.ROLE_COLLEGE_STUDENT).collegeName("IIT Delhi").build(),
            User.builder().email("school@library.com").passwordHash(passwordEncoder.encode("Student@123"))
                .name("Priya School").role(UserRole.ROLE_SCHOOL_STUDENT).schoolGrade("GRADE_9_10")
                .parentEmail("parent@example.com").build(),
            User.builder().email("patron@library.com").passwordHash(passwordEncoder.encode("Patron@123"))
                .name("General Patron").role(UserRole.ROLE_GENERAL_PATRON).build()
        );
        userRepository.saveAll(users);
        log.info("Seeded {} users", users.size());
    }

    private void seedBooks() {
        List<Book> books = List.of(
            Book.builder().title("Quantitative Aptitude for CAT").author("Arun Sharma")
                .isbn("9780070681705").mainCategory(MainCategory.COMPETITIVE_EXAM).subCategory("CAT")
                .genre("Education").publisher("McGraw Hill").publicationYear(2023).totalCopies(5).availableCopies(5)
                .language("English").description("Comprehensive CAT preparation guide").build(),
            Book.builder().title("General Studies for UPSC Prelims").author("M. Laxmikanth")
                .isbn("9789352607969").mainCategory(MainCategory.COMPETITIVE_EXAM).subCategory("UPSC")
                .genre("Education").publisher("McGraw Hill").publicationYear(2023).totalCopies(8).availableCopies(8)
                .language("English").description("Complete UPSC Civil Services guide").build(),
            Book.builder().title("Engineering Mathematics").author("B.S. Grewal")
                .isbn("9788174091955").mainCategory(MainCategory.COLLEGE).subCategory("ENGINEERING")
                .genre("Mathematics").publisher("Khanna Publishers").publicationYear(2021).totalCopies(10).availableCopies(10)
                .language("English").description("Standard reference for engineering mathematics").build(),
            Book.builder().title("NCERT Class 10 Science").author("NCERT")
                .isbn("9788174500199").mainCategory(MainCategory.SCHOOL).subCategory("GRADE_9_10")
                .genre("Science").publisher("NCERT").publicationYear(2023).totalCopies(15).availableCopies(15)
                .language("English").description("Class 10 Science textbook").build(),
            Book.builder().title("The Dark Knight Returns").author("Frank Miller")
                .isbn("9781563893421").mainCategory(MainCategory.COMIC).subCategory("SUPERHERO")
                .genre("Comics").publisher("DC Comics").publicationYear(1986).totalCopies(3).availableCopies(3)
                .language("English").description("Iconic Batman graphic novel").build(),
            Book.builder().title("India After Gandhi").author("Ramachandra Guha")
                .isbn("9780060958589").mainCategory(MainCategory.HISTORY).subCategory("MODERN")
                .genre("History").publisher("HarperCollins").publicationYear(2007).totalCopies(4).availableCopies(4)
                .language("English").description("History of post-independence India").build(),
            Book.builder().title("Sapiens: A Brief History of Humankind").author("Yuval Noah Harari")
                .isbn("9780062316097").mainCategory(MainCategory.NON_FICTION).subCategory("SCIENCE")
                .genre("Science").publisher("Harper").publicationYear(2015).totalCopies(6).availableCopies(6)
                .language("English").description("Brief history of humankind").build(),
            Book.builder().title("Atomic Habits").author("James Clear")
                .isbn("9780735211292").mainCategory(MainCategory.NON_FICTION).subCategory("SELF_HELP")
                .genre("Self-Help").publisher("Avery").publicationYear(2018).totalCopies(8).availableCopies(8)
                .language("English").description("Build good habits, break bad ones").build(),
            Book.builder().title("Dune").author("Frank Herbert")
                .isbn("9780441013593").mainCategory(MainCategory.FICTION).subCategory("SCI_FI")
                .genre("Science Fiction").publisher("Ace Books").publicationYear(2019).totalCopies(5).availableCopies(5)
                .language("English").description("Epic science fiction masterpiece").build(),
            Book.builder().title("Pride and Prejudice").author("Jane Austen")
                .isbn("9780141439518").mainCategory(MainCategory.FICTION).subCategory("LITERARY")
                .genre("Classic Fiction").publisher("Penguin Classics").publicationYear(2002).totalCopies(7).availableCopies(7)
                .language("English").description("Classic literary romance").build()
        );
        List<Book> savedBooks = bookRepository.saveAll(books);
        log.info("Seeded {} books", savedBooks.size());

        // Create BookCopies for the first 5 books
        int copyCount = 0;
        for (int i = 0; i < Math.min(5, savedBooks.size()); i++) {
            Book book = savedBooks.get(i);
            for (int c = 1; c <= Math.min(3, book.getTotalCopies()); c++) {
                BookCopy copy = BookCopy.builder()
                    .book(book)
                    .copyNumber(c)
                    .barcode("LMS-" + book.getId() + "-" + String.format("%03d", c))
                    .condition(CopyCondition.GOOD)
                    .isAvailable(true)
                    .shelfLocation("Shelf-" + (char)('A' + i))
                    .rackNumber("Rack-" + c)
                    .build();
                bookCopyRepository.save(copy);
                copyCount++;
            }
        }
        log.info("Seeded {} book copies", copyCount);
    }

    private void seedReadingRooms() {
        List<ReadingRoom> rooms = List.of(
            ReadingRoom.builder().name("Main Reading Hall").totalSeats(50).build(),
            ReadingRoom.builder().name("Quiet Study Room").totalSeats(20).build(),
            ReadingRoom.builder().name("Group Discussion Room").totalSeats(30).build()
        );
        readingRoomRepository.saveAll(rooms);
        log.info("Seeded {} reading rooms", rooms.size());
    }
}

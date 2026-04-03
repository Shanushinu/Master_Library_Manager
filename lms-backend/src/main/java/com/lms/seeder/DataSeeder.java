package com.lms.seeder;

import com.lms.model.Book;
import com.lms.model.Loan;
import com.lms.model.User;
import com.lms.model.enums.LoanStatus;
import com.lms.model.enums.MainCategory;
import com.lms.model.enums.UserRole;
import com.lms.repository.BookRepository;
import com.lms.repository.LoanRepository;
import com.lms.repository.UserRepository;
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
    private final LoanRepository loanRepository;
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
            User.builder().email("college@library.com").passwordHash(passwordEncoder.encode("Student@123"))
                .name("Rahul College").role(UserRole.ROLE_COLLEGE_STUDENT).collegeName("IIT Delhi").build(),
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
            // COMPETITIVE_EXAM books
            Book.builder().title("Quantitative Aptitude for CAT").author("Arun Sharma")
                .isbn("9780070681705").mainCategory(MainCategory.COMPETITIVE_EXAM).subCategory("CAT")
                .publisher("McGraw Hill").publicationYear(2023).totalCopies(5).availableCopies(5)
                .language("English").description("Comprehensive CAT preparation guide").build(),
            Book.builder().title("General Studies for UPSC Prelims").author("M. Laxmikanth")
                .isbn("9789352607969").mainCategory(MainCategory.COMPETITIVE_EXAM).subCategory("UPSC")
                .publisher("McGraw Hill").publicationYear(2023).totalCopies(8).availableCopies(8)
                .language("English").description("Complete UPSC Civil Services guide").build(),
            Book.builder().title("SSC CGL Tier 1 Complete Guide").author("Disha Experts")
                .isbn("9789389986068").mainCategory(MainCategory.COMPETITIVE_EXAM).subCategory("SSC")
                .publisher("Disha Publications").publicationYear(2023).totalCopies(6).availableCopies(6)
                .language("English").description("Complete SSC CGL preparation").build(),
            Book.builder().title("GATE Computer Science 2024").author("MADE EASY Team")
                .isbn("9789389587845").mainCategory(MainCategory.COMPETITIVE_EXAM).subCategory("GATE")
                .publisher("MADE EASY").publicationYear(2023).totalCopies(4).availableCopies(4)
                .language("English").description("GATE CS/IT preparation handbook").build(),
            Book.builder().title("NEET Biology by Disha").author("Disha Experts")
                .isbn("9789388241815").mainCategory(MainCategory.COMPETITIVE_EXAM).subCategory("NEET")
                .publisher("Disha Publications").publicationYear(2023).totalCopies(7).availableCopies(7)
                .language("English").description("Complete NEET Biology guide").build(),
            Book.builder().title("Banking & Finance Awareness").author("Arihant Experts")
                .isbn("9789313192985").mainCategory(MainCategory.COMPETITIVE_EXAM).subCategory("BANKING")
                .publisher("Arihant").publicationYear(2023).totalCopies(5).availableCopies(5)
                .language("English").description("Banking exams preparation guide").build(),
            // COLLEGE books
            Book.builder().title("Engineering Mathematics").author("B.S. Grewal")
                .isbn("9788174091955").mainCategory(MainCategory.COLLEGE).subCategory("ENGINEERING")
                .publisher("Khanna Publishers").publicationYear(2021).totalCopies(10).availableCopies(10)
                .language("English").description("Standard reference for engineering mathematics").build(),
            Book.builder().title("Robbins Basic Pathology").author("Vinay Kumar")
                .isbn("9780323353175").mainCategory(MainCategory.COLLEGE).subCategory("MEDICAL")
                .publisher("Elsevier").publicationYear(2022).totalCopies(3).availableCopies(3)
                .language("English").referenceOnly(true).description("Medical pathology textbook").build(),
            Book.builder().title("Principles of Management").author("Harold Koontz")
                .isbn("9780071077811").mainCategory(MainCategory.COLLEGE).subCategory("MANAGEMENT")
                .publisher("McGraw Hill").publicationYear(2020).totalCopies(6).availableCopies(6)
                .language("English").description("Management principles and practices").build(),
            // SCHOOL books
            Book.builder().title("NCERT Class 10 Science").author("NCERT")
                .isbn("9788174500199").mainCategory(MainCategory.SCHOOL).subCategory("GRADE_9_10")
                .publisher("NCERT").publicationYear(2023).totalCopies(15).availableCopies(15)
                .language("English").description("Class 10 Science textbook").build(),
            Book.builder().title("NCERT Class 8 Mathematics").author("NCERT")
                .isbn("9788174507747").mainCategory(MainCategory.SCHOOL).subCategory("GRADE_6_8")
                .publisher("NCERT").publicationYear(2023).totalCopies(12).availableCopies(12)
                .language("English").description("Class 8 Mathematics textbook").build(),
            Book.builder().title("NCERT Class 12 Physics Part 1").author("NCERT")
                .isbn("9788174506528").mainCategory(MainCategory.SCHOOL).subCategory("GRADE_11_12")
                .publisher("NCERT").publicationYear(2023).totalCopies(10).availableCopies(10)
                .language("English").description("Class 12 Physics textbook").build(),
            // COMIC books
            Book.builder().title("The Dark Knight Returns").author("Frank Miller")
                .isbn("9781563893421").mainCategory(MainCategory.COMIC).subCategory("SUPERHERO")
                .publisher("DC Comics").publicationYear(1986).totalCopies(3).availableCopies(3)
                .language("English").description("Iconic Batman graphic novel").build(),
            Book.builder().title("Death Note Vol. 1").author("Tsugumi Ohba")
                .isbn("9781421501680").mainCategory(MainCategory.COMIC).subCategory("MANGA")
                .publisher("VIZ Media").publicationYear(2005).totalCopies(4).availableCopies(4)
                .language("English").description("Classic manga thriller").build(),
            // HISTORY books
            Book.builder().title("The Rise and Fall of the Roman Empire").author("Edward Gibbon")
                .isbn("9780140437645").mainCategory(MainCategory.HISTORY).subCategory("ANCIENT")
                .publisher("Penguin Classics").publicationYear(1994).totalCopies(2).availableCopies(2)
                .language("English").description("Classic work on Roman history").build(),
            Book.builder().title("India After Gandhi").author("Ramachandra Guha")
                .isbn("9780060958589").mainCategory(MainCategory.HISTORY).subCategory("MODERN")
                .publisher("HarperCollins").publicationYear(2007).totalCopies(4).availableCopies(4)
                .language("English").description("History of post-independence India").build(),
            // NON-FICTION books
            Book.builder().title("Sapiens: A Brief History of Humankind").author("Yuval Noah Harari")
                .isbn("9780062316097").mainCategory(MainCategory.NON_FICTION).subCategory("SCIENCE")
                .publisher("Harper").publicationYear(2015).totalCopies(6).availableCopies(6)
                .language("English").description("Brief history of humankind").build(),
            Book.builder().title("Atomic Habits").author("James Clear")
                .isbn("9780735211292").mainCategory(MainCategory.NON_FICTION).subCategory("SELF_HELP")
                .publisher("Avery").publicationYear(2018).totalCopies(8).availableCopies(8)
                .language("English").description("Build good habits, break bad ones").build(),
            // FICTION books
            Book.builder().title("Dune").author("Frank Herbert")
                .isbn("9780441013593").mainCategory(MainCategory.FICTION).subCategory("SCI_FI")
                .publisher("Ace Books").publicationYear(2019).totalCopies(5).availableCopies(5)
                .language("English").description("Epic science fiction masterpiece").build(),
            Book.builder().title("Pride and Prejudice").author("Jane Austen")
                .isbn("9780141439518").mainCategory(MainCategory.FICTION).subCategory("LITERARY")
                .publisher("Penguin Classics").publicationYear(2002).totalCopies(7).availableCopies(7)
                .language("English").description("Classic literary romance").build(),
            // OTHER
            Book.builder().title("National Geographic Magazine - Jan 2024").author("National Geographic Society")
                .mainCategory(MainCategory.OTHER).subCategory("MAGAZINE")
                .publisher("National Geographic").publicationYear(2024).totalCopies(3).availableCopies(3)
                .language("English").description("January 2024 issue").build()
        );
        bookRepository.saveAll(books);
        log.info("Seeded {} books", books.size());
    }
}

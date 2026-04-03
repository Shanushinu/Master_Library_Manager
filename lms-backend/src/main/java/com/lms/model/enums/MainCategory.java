package com.lms.model.enums;

import java.util.List;
import java.util.Map;
import java.util.Set;

public enum MainCategory {
    COMPETITIVE_EXAM("Competitive Exams"),
    COLLEGE("College"),
    SCHOOL("School"),
    COMIC("Comics"),
    HISTORY("History"),
    NON_FICTION("Non-Fiction"),
    FICTION("Fiction"),
    OTHER("Other");

    private final String displayName;

    private static final Map<MainCategory, Set<String>> VALID_SUBCATEGORIES = Map.of(
        COMPETITIVE_EXAM, Set.of("SSC", "UPSC", "CAT", "GATE", "NEET", "JEE", "BANKING", "RAILWAY", "OTHER_EXAM"),
        COLLEGE, Set.of("ENGINEERING", "MEDICAL", "COMMERCE", "ARTS", "LAW", "MANAGEMENT", "RESEARCH"),
        SCHOOL, Set.of("K_5", "GRADE_6_8", "GRADE_9_10", "GRADE_11_12"),
        COMIC, Set.of("SUPERHERO", "MANGA", "GRAPHIC_NOVEL", "HUMOR"),
        HISTORY, Set.of("ANCIENT", "MEDIEVAL", "MODERN", "WORLD", "REGIONAL"),
        NON_FICTION, Set.of("BIOGRAPHY", "SCIENCE", "SELF_HELP", "TRAVEL", "BUSINESS", "HEALTH"),
        FICTION, Set.of("LITERARY", "SCI_FI", "FANTASY", "MYSTERY", "ROMANCE", "HORROR"),
        OTHER, Set.of("MAGAZINE", "JOURNAL", "REFERENCE", "AUDIOBOOK")
    );

    MainCategory(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    public Set<String> getAllowedSubcategories() {
        return VALID_SUBCATEGORIES.getOrDefault(this, Set.of());
    }

    public boolean isValidSubcategory(String subcategory) {
        return VALID_SUBCATEGORIES.getOrDefault(this, Set.of()).contains(subcategory);
    }

    public static MainCategory fromString(String value) {
        for (MainCategory cat : values()) {
            if (cat.name().equalsIgnoreCase(value)) return cat;
        }
        throw new IllegalArgumentException("Unknown main category: " + value);
    }
}

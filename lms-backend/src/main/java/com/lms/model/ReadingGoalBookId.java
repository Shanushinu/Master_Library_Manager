package com.lms.model;

import java.io.Serializable;
import java.util.Objects;

public class ReadingGoalBookId implements Serializable {
    private Long goal;
    private Long loan;

    public ReadingGoalBookId() {}

    public ReadingGoalBookId(Long goal, Long loan) {
        this.goal = goal;
        this.loan = loan;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ReadingGoalBookId that = (ReadingGoalBookId) o;
        return Objects.equals(goal, that.goal) && Objects.equals(loan, that.loan);
    }

    @Override
    public int hashCode() {
        return Objects.hash(goal, loan);
    }
}

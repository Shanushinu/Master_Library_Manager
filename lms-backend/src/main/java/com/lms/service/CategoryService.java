package com.lms.service;

import com.lms.dto.CategoryNode;
import com.lms.model.enums.MainCategory;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;

@Service
public class CategoryService {

    public List<CategoryNode> getAllCategories() {
        return Arrays.stream(MainCategory.values())
            .map(cat -> new CategoryNode(
                cat.name(),
                cat.getDisplayName(),
                cat.getAllowedSubcategories().stream().sorted().toList()
            ))
            .toList();
    }

    public CategoryNode getCategoryWithSubcategories(String mainCategoryStr) {
        try {
            MainCategory cat = MainCategory.valueOf(mainCategoryStr.toUpperCase());
            return new CategoryNode(
                cat.name(),
                cat.getDisplayName(),
                cat.getAllowedSubcategories().stream().sorted().toList()
            );
        } catch (IllegalArgumentException e) {
            throw new com.lms.exception.InvalidCategoryException("Invalid main category: " + mainCategoryStr);
        }
    }
}

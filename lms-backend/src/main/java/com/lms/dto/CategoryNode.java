package com.lms.dto;

import java.util.List;

public record CategoryNode(
    String main,
    String displayName,
    List<String> subcategories
) {}

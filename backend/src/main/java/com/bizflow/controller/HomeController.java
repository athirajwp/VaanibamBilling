package com.bizflow.controller;

import io.swagger.v3.oas.annotations.Hidden;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
@Hidden
public class HomeController {

    /**
     * Redirects root URL requests directly to the interactive Swagger UI.
     */
    @GetMapping("/")
    public String index() {
        return "redirect:/swagger-ui.html";
    }
}

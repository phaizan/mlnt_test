package org.mlnt.mlnt_test.controller.rest;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class ForwardingController {
    @RequestMapping("/{path:^(?!api|static|assets).*$}/**")
    public String forward() {
        return "forward:/index.html";
    }
}

